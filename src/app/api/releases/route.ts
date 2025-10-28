import { NextRequest, NextResponse } from "next/server";
import { getReleases } from "@/actions/get-releases";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const releases = await getReleases();
    return NextResponse.json(releases);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro ao listar lançamentos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.slug || !body.description) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    const releaseData = {
      title: body.title,
      slug: body.slug,
      description: body.description,
      developer: body.developer || "",
      status: body.status,
      propertyType: body.propertyType,
      address: {
        city: body.city,
        neighborhood: body.neighborhood,
      },
      images: body.images || [],
      floorPlans: body.floorPlans || [],
      seo: body.seo || "",
      features: body.features || [],
      videoUrl: body.videoUrl || "",
      virtualTourUrl: body.virtualTourUrl || "",
      delivery: body.delivery,
      unitsCount: 0,
      units: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    const releaseRef = await adminDb.collection("releases").add(releaseData);
    
    // Verificar se foi salvo corretamente
    const savedDoc = await releaseRef.get();
    
    if (!savedDoc.exists) {
      throw new Error("Falha ao salvar no banco de dados");
    }

    return NextResponse.json({ 
      success: true, 
      releaseId: releaseRef.id,
      data: { id: releaseRef.id, ...releaseData }
    });
  } catch (error: any) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json({ error: error?.message || "Erro ao criar lançamento" }, { status: 500 });
  }
}
