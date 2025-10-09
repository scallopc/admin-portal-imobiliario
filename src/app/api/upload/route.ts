import { NextResponse } from 'next/server';
import { CloudinaryService } from '@/services/cloudinary.service';

export const maxDuration = 60; // Extend timeout to 60 seconds for large uploads
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const propertyId = formData.get('propertyId') as string | null;
    const files = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('file'))
      .map(([_, value]) => value as File);

    if (files.length === 0) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    if (!propertyId) {
      return NextResponse.json({ message: 'propertyId é obrigatório' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const url = await CloudinaryService.uploadFile(buffer, file.name, propertyId);
      uploadedUrls.push(url);
    }

    return NextResponse.json({ urls: uploadedUrls });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro ao processar o upload' },
      { status: 500 }
    );
  }
}
