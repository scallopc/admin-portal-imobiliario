import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type ImportPayload = {
  release: {
    title?: string;
    slug?: string;
    description?: string;
    developer?: string;
    status?: string;
    propertyType?: string;
    address?: {
      city?: string;
      neighborhood?: string;
    };
    images?: string[];
    floorPlans?: string[];
    seo?: string;
    features?: string[];
    videoUrl?: string;
    virtualTourUrl?: string;
  };
  units: Record<string, any>[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImportPayload;
    if (!body || !Array.isArray(body.units) || body.units.length === 0) {
      return NextResponse.json({ error: "Payload inválido. Envie units como um array não vazio." }, { status: 400 });
    }

    const prices = (body.units || [])
      .map(u => {
        const v = (u as any)?.price;
        if (typeof v === "number" && Number.isFinite(v)) return v;
        if (typeof v === "string") {
          const n = parseFloat(
            v
              .replace(/\./g, "")
              .replace(/,/g, ".")
              .replace(/[^0-9.\-]/g, "")
          );
          if (Number.isFinite(n)) return n;
        }
        return undefined;
      })
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
    const minUnitPrice = prices.length ? Math.min(...prices) : undefined;

    const releaseData = {
      title: body.release?.title || "Empreendimento",
      slug: body.release?.slug,
      description: body.release?.description || "",
      developer: body.release?.developer,
      status: body.release?.status,
      propertyType: body.release?.propertyType,
      address: body.release?.address || { city: '', neighborhood: '' },
      images: Array.isArray(body.release?.images) ? body.release!.images : [],
      floorPlans: Array.isArray(body.release?.floorPlans) ? body.release!.floorPlans : [],
      seo: body.release?.seo,
      features: Array.isArray(body.release?.features) ? body.release!.features : [],
      videoUrl: body.release?.videoUrl,
      virtualTourUrl: body.release?.virtualTourUrl,
      unitsCount: body.units.length,
      minUnitPrice,
      units: body.units.map((unit, index) => ({
        id: `unit-${index}`,
        ...unit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      createdAt: Date.now(),
      isActive: true,
    };

    const releaseRef = await adminDb.collection("releases").add(releaseData);

    return NextResponse.json({ success: true, releaseId: releaseRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro ao importar lançamento" }, { status: 500 });
  }
}
