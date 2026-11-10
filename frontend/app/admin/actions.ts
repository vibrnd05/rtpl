"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminToken, getAdminToken } from "@/lib/adminSession";
import {
  addPlayerScreenshots,
  confirmPlayerPayment,
  deletePlayerScreenshot,
} from "@/lib/api";

export type ScreenshotResult = { ok: boolean; message: string };

/**
 * One screenshot per call: Vercel caps a request body at 4.5 MB, so the
 * dashboard sends them one after another rather than all in one request.
 */
export async function uploadPlayerScreenshot(formData: FormData): Promise<ScreenshotResult> {
  const token = await getAdminToken();
  if (!token) redirect("/admin/login");

  const playerId = String(formData.get("playerId") ?? "");
  const file = formData.get("screenshot");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a screenshot to upload." };
  }

  let result;
  try {
    result = await addPlayerScreenshots(token, playerId, [file]);
  } catch (err) {
    console.error("[rtpl] upload screenshot threw", err);
    return { ok: false, message: "Could not reach the server. Please try again." };
  }

  if (!result.ok) {
    if (result.status === 401) redirect("/admin/login");
    return { ok: false, message: result.message };
  }

  return { ok: true, message: "" };
}

export async function removePlayerScreenshot(
  playerId: string,
  imageId: string
): Promise<ScreenshotResult> {
  const token = await getAdminToken();
  if (!token) redirect("/admin/login");

  let result;
  try {
    result = await deletePlayerScreenshot(token, playerId, imageId);
  } catch (err) {
    console.error("[rtpl] delete screenshot threw", err);
    return { ok: false, message: "Could not reach the server. Please try again." };
  }

  if (!result.ok) {
    if (result.status === 401) redirect("/admin/login");
    return { ok: false, message: result.message };
  }

  revalidatePath("/admin");
  return { ok: true, message: "Screenshot deleted." };
}

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
