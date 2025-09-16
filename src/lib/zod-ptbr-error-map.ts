import { ZodErrorMap, ZodIssueCode } from "zod"

export const zodPtBrErrorMap: ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === "undefined") return { message: "Campo obrigatório" }
      return { message: `Tipo inválido` }
    case ZodIssueCode.invalid_string:
      if (issue.validation === "email") return { message: "E-mail inválido" }
      if (issue.validation === "url") return { message: "URL inválida" }
      if (issue.validation === "regex") return { message: "Formato inválido" }
      return { message: "Texto inválido" }
    case ZodIssueCode.too_small:
      if (issue.type === "string") return { message: `Mínimo de ${issue.minimum} caracteres` }
      if (issue.type === "number") return { message: `Valor mínimo é ${issue.minimum}` }
      if (issue.type === "array") return { message: `Selecione pelo menos ${issue.minimum} itens` }
      return { message: "Valor muito pequeno" }
    case ZodIssueCode.too_big:
      if (issue.type === "string") return { message: `Máximo de ${issue.maximum} caracteres` }
      if (issue.type === "number") return { message: `Valor máximo é ${issue.maximum}` }
      if (issue.type === "array") return { message: `Máximo de ${issue.maximum} itens` }
      return { message: "Valor muito grande" }
    case ZodIssueCode.invalid_enum_value:
      return { message: "Selecione uma opção válida" }
    case ZodIssueCode.custom:
      return { message: (issue.params as any)?.message ?? "Valor inválido" }
    default:
      return { message: ctx.defaultError }
  }
}
