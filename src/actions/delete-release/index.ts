'use server'

import { adminDb } from '@/lib/firebase-admin';
import { CloudinaryService } from '@/services/cloudinary.service';
import { getUser } from '@/actions/get-user';

export async function deleteRelease(id: string) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const releaseRef = adminDb.collection('releases').doc(id);
    const releaseDoc = await releaseRef.get();
    if (!releaseDoc.exists) {
      throw new Error('Lançamento não encontrado');
    }

    await Promise.all([
      releaseRef.delete(),
      CloudinaryService.deleteFolder(id),
    ]);

    return {
      success: true,
      message: 'Lançamento excluído com sucesso',
    };
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Erro interno do servidor',
    };
  }
}
