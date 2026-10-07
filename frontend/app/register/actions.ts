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
  reference?: string;
};

const str = (data: FormData, key: string) =>
  (data.get(key) as string | null)?.trim() ?? "";

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

  try {
    const result = await submitPlayer(values);

    if (result.ok) {
      return {
        status: "success",
        message: "",
        fieldErrors: {},
        values,
        fullName: result.data.player.fullName,
        reference: result.data.player.reference,
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
