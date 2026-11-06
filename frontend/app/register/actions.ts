"use server";

import { submitPlayer } from "@/lib/api";
import { LEAGUE } from "@/lib/league";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string>;
  /** Submitted values, echoed back so the form survives a failed round trip. */
  values: Record<string, string>;
  fullName?: string;
  /** Where the entry-received email went. */
  email?: string;
  reference?: string;
  /** Phase label and fee in rupees, shown on the confirmation panel. */
  phase?: string;
  fee?: number;
};

const str = (data: FormData, key: string) =>
  (data.get(key) as string | null)?.trim() ?? "";

/** Mirrors the backend's upload limit, so an oversize file fails here, fast. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** What is wrong with an uploaded image, or null if it can go to the API. */
function imageError(
  file: FormDataEntryValue | null,
  missing: string,
  tooLarge: string
) {
  if (!(file instanceof File) || file.size === 0) return missing;
  if (file.size > MAX_IMAGE_BYTES) return tooLarge;
  return null;
}

/**
 * Shapes the submission, forwards it to the API, and turns the answer back
 * into form state. Validation lives in the Mongoose model, so the rules the
 * database enforces and the rules the player sees cannot drift apart.
 */
export async function registerPlayer(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const values = {
    fullName: str(formData, "fullName"),
    mobile: str(formData, "mobile"),
    email: str(formData, "email"),
    dateOfBirth: str(formData, "dateOfBirth"),
    city: str(formData, "city"),
    lastYearTeam: str(formData, "lastYearTeam"),
    membershipType: str(formData, "membershipType"),
    playingRole: str(formData, "playingRole"),
    tShirtSize: str(formData, "tShirtSize"),
    battingStyle: str(formData, "battingStyle"),
    bowlingStyle: str(formData, "bowlingStyle"),
  };

  // Honeypot — bots fill every field, players never see this one.
  if (str(formData, "website")) {
    return { status: "success", message: "", fieldErrors: {}, values };
  }

  const photo = formData.get("playerPhoto");
  const screenshot = formData.get("paymentScreenshot");

  const photoError = imageError(
    photo,
    "Please upload a picture of yourself.",
    "Your picture must be 5 MB or smaller."
  );
  const screenshotError = imageError(
    screenshot,
    "Please upload a screenshot of your payment.",
    "The payment screenshot must be 5 MB or smaller."
  );

  if (photoError || screenshotError) {
    return {
      status: "error",
      message: (photoError || screenshotError) as string,
      fieldErrors: {
        ...(photoError && { playerPhoto: photoError }),
        ...(screenshotError && { paymentScreenshot: screenshotError }),
      },
      values,
    };
  }

  try {
    const result = await submitPlayer(values, photo as File, screenshot as File);

    if (result.ok) {
      return {
        status: "success",
        message: "",
        fieldErrors: {},
        values,
        fullName: result.data.player.fullName,
        email: values.email,
        reference: result.data.player.reference,
        phase: result.data.player.phase,
        fee: result.data.player.fee,
      };
    }

    console.error("[rtpl] player registration rejected", result.status, result.error);

    return {
      status: "error",
      // A server fault is not the player's to act on, so they get the
      // generic line and a way to reach the desk instead.
      message:
        result.status >= 500
          ? `We could not save your entry just now. Please try again in a moment, or email ${LEAGUE.email}.`
          : result.message,
      fieldErrors: {},
      values,
    };
  } catch (err) {
    console.error("[rtpl] player registration threw", err);
    return {
      status: "error",
      message: "Registration is temporarily unavailable. Please try again shortly.",
      fieldErrors: {},
      values,
    };
  }
}
