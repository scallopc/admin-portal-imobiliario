"use server";

import { adminAuth } from "@/lib/firebase-admin";
import { changePasswordSchema, type ChangePasswordInput } from "./schema";
import { cookies } from "next/headers";

export async function changePassword(data: ChangePasswordInput) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar sessão
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const uid = decodedToken.uid;

    // Validar dados
    const parsed = changePasswordSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Dados inválidos: ${parsed.error.errors.map(e => e.message).join(", ")}`);
    }

    const { newPassword } = parsed.data;

    // Atualizar senha no Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return {
      success: true,
      message: "Senha alterada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    throw new Error(`Falha ao alterar senha: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}
