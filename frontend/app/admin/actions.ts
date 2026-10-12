"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminToken, getAdminToken } from "@/lib/adminSession";
import { confirmPlayerPayment } from "@/lib/api";

export async function signOut() {
  await clearAdminToken();
  redirect("/admin/login");
}

export type ConfirmPaymentState = {
  status: "idle" | "success" | "error";
  message: string;
};

/** Records the UTR against a player, which also emails them the confirmation. */
export async function confirmPayment(
  _prevState: ConfirmPaymentState,
  formData: FormData
): Promise<ConfirmPaymentState> {
  const token = await getAdminToken();
  if (!token) redirect("/admin/login");

  const playerId = String(formData.get("playerId") ?? "");
  const utr = String(formData.get("utr") ?? "").trim();

  if (!utr) {
    return { status: "error", message: "Enter the transaction UTR." };
  }

  let result;
  try {
    result = await confirmPlayerPayment(token, playerId, utr);
  } catch (err) {
    console.error("[rtpl] confirm payment threw", err);
    return {
      status: "error",
      message: "Could not reach the server. Please try again.",
    };
  }

  // Outside the try: redirect() works by throwing.
  if (!result.ok) {
    if (result.status === 401) redirect("/admin/login");
    return { status: "error", message: result.message };
  }

  revalidatePath("/admin");

  return {
    status: "success",
    message: result.data.emailSent
      ? "Confirmed. The player has been emailed."
      : "Confirmed, but the email could not be sent.",
  };
}
