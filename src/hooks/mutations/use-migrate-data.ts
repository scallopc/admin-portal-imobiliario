import { useMutation } from "@tanstack/react-query"

export const migrateDataMutationKey = () => ["migrate-data"] as const

async function migrateData(): Promise<{ success: boolean; leadsMigrated: number; propertiesMigrated: number }> {
  const res = await fetch("/api/migrate", {
    method: "POST",
  })
  if (!res.ok) throw new Error("Falha na migração dos dados")
  return res.json()
}

export function useMigrateData() {
  return useMutation({
    mutationKey: migrateDataMutationKey(),
    mutationFn: migrateData,
  })
}
