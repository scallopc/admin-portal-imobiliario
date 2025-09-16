"use server";

import { adminDb } from "@/lib/firebase-admin";
import { listLinksResponseSchema, type LinkListItem } from "./schema";

export async function listLinks(): Promise<LinkListItem[]> {
  const snapshot = await adminDb.collection("links").orderBy("updatedAt", "desc").get();
  const data: LinkListItem[] = snapshot.docs.map((doc) => {
    const d = doc.data() as any
    return {
      id: doc.id,
      type: d.type,
      title: d.title ?? "",
      url: d.url ?? "",
      createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
      updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt,
    }
  })

  const parsed = listLinksResponseSchema.safeParse(data)
  if (!parsed.success) throw new Error("Invalid links data")
  return parsed.data
}


