import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { createToken, deleteToken, initDb } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initDb();

  const { emails: emailsRaw } = await request.json();
  const emails = (emailsRaw as string)
    .split(/[\n,]+/)
    .map((e: string) => e.trim().toLowerCase())
    .filter((e: string) => e && e.includes("@"));

  const created = [];
  for (const email of emails) {
    const token = nanoid(16);
    const result = await createToken(token, email);
    if (result) {
      created.push({ email, token });
    }
  }

  return NextResponse.json({ created, count: created.length });
}

export async function DELETE(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await deleteToken(id);

  return NextResponse.json({ success: true });
}
