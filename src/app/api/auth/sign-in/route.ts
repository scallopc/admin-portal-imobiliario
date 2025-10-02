import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type IdpResponse = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email: string;
  registered: boolean;
};

const IDP_ENDPOINT = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "MISSING_API_KEY" }, { status: 500 });

    const res = await fetch(`${IDP_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, returnSecureToken: true }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => undefined);
      const message: string | undefined = err?.error?.message;
      const map: Record<string, number> = {
        EMAIL_NOT_FOUND: 401,
        INVALID_PASSWORD: 401,
        USER_DISABLED: 403,
      };
      const status = (message && map[message]) || 400;
      return NextResponse.json({ error: message ?? "AUTH_ERROR" }, { status });
    }

    const data: IdpResponse = await res.json();

    const expiresInMs = 7 * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn: expiresInMs });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(expiresInMs / 1000),
    });

    return NextResponse.json({ uid: data.localId, email: data.email ?? null });
  } catch (e) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
