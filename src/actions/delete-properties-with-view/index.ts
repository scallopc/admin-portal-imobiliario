"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function deletePropertiesWithView() {
  try {
    // Buscar todos os imóveis que possuem a propriedade "views"
    const snapshot = await adminDb.collection("properties").get();
    const propertiesWithViews = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.views !== undefined && data.views !== null;
    });

    console.log(`Encontrados ${propertiesWithViews.length} imóveis com propriedade 'views'`);

    if (propertiesWithViews.length === 0) {
      return {
        success: true,
        message: "Nenhum imóvel com propriedade 'views' encontrado",
        deletedCount: 0,
      };
    }

    // Deletar todos os imóveis encontrados
    const deletePromises = propertiesWithViews.map((doc) =>
      doc.ref.delete()
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      message: `${propertiesWithViews.length} imóvel(is) com propriedade 'views' removido(s) com sucesso`,
      deletedCount: propertiesWithViews.length,
    };
  } catch (error) {
    console.error("Erro ao deletar imóveis com propriedade 'views':", error);
    return {
      success: false,
      message: "Erro ao deletar imóveis com propriedade 'views'",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
