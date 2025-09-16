import { NextResponse } from "next/server"
import { getProperty } from "@/actions/get-property"
import { updateProperty } from "@/actions/update-property"
import { z } from "zod"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`Iniciando busca pelo imóvel com ID: ${params.id}`)
    
    if (!params.id) {
      console.error('ID do imóvel não fornecido')
      return NextResponse.json(
        { error: "ID do imóvel não fornecido" },
        { status: 400 }
      )
    }

    console.log(`Chamando getProperty para o ID: ${params.id}`)
    const data = await getProperty({ id: params.id })
    console.log(`Dados do imóvel ${params.id} carregados com sucesso`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Erro ao buscar imóvel ${params.id}:`, error)
    
    if (error instanceof z.ZodError) {
      console.error('Erro de validação:', error.errors)
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: error.errors,
          message: error.message
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao buscar imóvel"
    const errorStack = process.env.NODE_ENV === 'development' ? (error as any)?.stack : undefined
    
    console.error('Mensagem de erro:', errorMessage)
    if (errorStack) console.error('Stack trace:', errorStack)

    return NextResponse.json(
      { 
        error: errorMessage,
        stack: errorStack
      },
      { 
        status: error instanceof Error && error.message.includes('não encontrado') ? 404 : 500 
      }
    )
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: "ID do imóvel não fornecido" },
        { status: 400 }
      )
    }

    const payload = await req.json()
    const result = await updateProperty({ id: params.id }, payload)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error(`Erro ao atualizar imóvel ${params.id}:`, error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Erro ao atualizar imóvel",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: error instanceof Error && error.message.includes('não encontrado') ? 404 : 400 }
    )
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: "ID do imóvel não fornecido" },
        { status: 400 }
      )
    }

    const { deleteProperty } = await import("@/actions/delete-property")
    await deleteProperty(params.id)
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(`Erro ao excluir imóvel ${params.id}:`, error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Erro ao excluir imóvel",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}
