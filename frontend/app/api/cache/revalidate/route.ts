import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

const staticTags = new Set(["topics", "categories", "lessons"])
const dynamicTagPattern = /^(category|lesson|transcripts):\d+$/

export async function POST(request: Request) {
  const secret = process.env.CACHE_REVALIDATE_SECRET
  const authorization = request.headers.get("authorization")
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { tags?: unknown }
  try {
    body = (await request.json()) as { tags?: unknown }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const tags = Array.isArray(body.tags)
    ? [...new Set(body.tags.filter((tag): tag is string =>
        typeof tag === "string" && (staticTags.has(tag) || dynamicTagPattern.test(tag))))]
    : []

  if (tags.length === 0 || tags.length > 20) {
    return NextResponse.json({ error: "No valid cache tags provided" }, { status: 400 })
  }

  tags.forEach((tag) => revalidateTag(tag, "max"))
  return NextResponse.json({ revalidated: true, tags })
}
