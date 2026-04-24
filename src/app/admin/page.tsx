import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/auth";
import { getAllTokens, getTokenStats, initDb } from "@/lib/db";
import { AdminDashboard } from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) redirect("/admin/login");

  await initDb();
  const tokens = await getAllTokens();
  const stats = await getTokenStats();

  return <AdminDashboard tokens={tokens} stats={stats} />;
}
