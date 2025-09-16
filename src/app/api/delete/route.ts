import { NextResponse } from 'next/server';
import { CloudinaryService } from '@/services/cloudinary.service';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { message: 'URLs inválidas fornecidas' },
        { status: 400 }
      );
    }

    // Filter out any invalid URLs
    const validUrls = urls.filter(
      (url): url is string => 
        typeof url === 'string' && url.trim() !== ''
    );

    if (validUrls.length === 0) {
      return NextResponse.json(
        { message: 'Nenhuma URL válida fornecida' },
        { status: 400 }
      );
    }

    // Delete the images
    await CloudinaryService.deleteFiles(validUrls);

    return NextResponse.json({ 
      success: true, 
      message: 'Imagens excluídas com sucesso' 
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir as imagens' 
      },
      { status: 500 }
    );
  }
}
