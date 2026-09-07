"use server";

import { redirect } from "next/navigation";
import { clearAdminToken } from "@/lib/adminSession";

export async function signOut() {
  await clearAdminToken();
  redirect("/admin/login");
}
