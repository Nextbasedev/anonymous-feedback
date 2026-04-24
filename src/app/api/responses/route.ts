import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { getFormResponses } from "@/lib/google-forms";

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const responses = await getFormResponses();
  return NextResponse.json({ responses });
}
