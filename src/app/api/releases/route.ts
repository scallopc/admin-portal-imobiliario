import { NextResponse } from "next/server";
import { getReleases } from "@/actions/get-releases";

export const runtime = "nodejs";

export async function GET() {
  try {
    const releases = await getReleases();
    return NextResponse.json(releases);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro ao listar lançamentos" }, { status: 500 });
  }
}
