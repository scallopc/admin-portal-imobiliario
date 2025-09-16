"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, HelpCircle } from "lucide-react"
import { useState } from "react"

export function UploadInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/template-imoveis.csv'
    link.download = 'template-imoveis.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
          className="p-0 h-auto"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Como usar a importação?
        </Button>
      </div>

      {showInstructions && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Instruções para Importação</h3>
          </div>
          
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p><strong>1.</strong> Baixe o template CSV clicando no botão abaixo</p>
            <p><strong>2.</strong> Abra o arquivo no Excel (Dados → Texto para Colunas → Delimitado → Ponto e vírgula)</p>
            <p><strong>3.</strong> Preencha os dados dos imóveis seguindo o formato do template</p>
            <p><strong>4.</strong> Salve o arquivo como CSV (UTF-8)</p>
            <p><strong>5.</strong> Use o botão "Importar Planilha" para fazer o upload</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 <strong>Dica:</strong> Se tiver dificuldades, consulte o arquivo <code>INSTRUCOES-EXCEL.md</code> na pasta public
            </p>
          </div>

          <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
            <p><strong>Campos obrigatórios:</strong> titulo</p>
            <p><strong>Campos opcionais:</strong> descricao, tipo, status, preco, area, quartos, banheiros, suites, vagas, mobiliado, endereço, etc.</p>
            <p><strong>Arrays (vírgula):</strong> Use vírgula para separar itens dentro da célula (ex: "piscina,academia,portaria 24h")</p>
            <p><strong>Boolean:</strong> Use "true", "1", "sim" ou "yes" para verdadeiro</p>
            <p><strong>Separador:</strong> Ponto e vírgula (;) entre colunas, vírgula (,) dentro de arrays</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="bg-white dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Template CSV
          </Button>
        </div>
      )}
    </div>
  )
}
