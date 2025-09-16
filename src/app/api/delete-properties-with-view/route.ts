import { NextRequest, NextResponse } from "next/server";
import { deletePropertiesWithView } from "@/actions/delete-properties-with-view";

export async function POST(request: NextRequest) {
  try {
    const result = await deletePropertiesWithView();

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("Erro na API delete-properties-with-view:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
