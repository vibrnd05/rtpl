"use server";

import { submitRegistration } from "@/lib/api";
import { LEAGUE } from "@/lib/league";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string>;
  /** Submitted values, echoed back so the form survives a failed round trip. */
  values: Record<string, string>;
  teamName?: string;
  reference?: string;
};

const str = (data: FormData, key: string) =>
  (data.get(key) as string | null)?.trim() ?? "";

/**
 * Shapes the submission, forwards it to the API, and turns the answer back
 * into form state. Validation lives in the Mongoose model, so the rules the
 * database enforces and the rules the owner sees cannot drift apart.
 */
export async function registerTeam(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const values = {
    owners: str(formData, "owners"),
    mobile: str(formData, "mobile"),
    team: str(formData, "team"),
    tshirt: str(formData, "tshirt"),
    tshirt_other: str(formData, "tshirt_other"),
    financial: str(formData, "financial"),
    auction: str(formData, "auction"),
  };

  // Honeypot — bots fill every field, owners never see this one.
  if (str(formData, "website")) {
    return { status: "success", message: "", fieldErrors: {}, values };
  }

  try {
    const result = await submitRegistration({
      owners: values.owners,
      ownersMobile: values.mobile,
      teamName: values.team,
      tshirtSize: values.tshirt,
      tshirtSizeOther: values.tshirt_other,
      financialCommitment: values.financial,
      auctionAvailability: values.auction,
    });

    if (result.ok) {
      return {
        status: "success",
        message: "",
        fieldErrors: {},
        values,
        teamName: result.data.registration.teamName,
        reference: result.data.registration.reference,
      };
    }

    console.error("[rtpl] registration rejected", result.status, result.error);

    return {
      status: "error",
      // A server fault is not the owner's to act on, so they get the generic
      // line and a way to reach the desk instead.
      message:
        result.status >= 500
          ? `We could not save your entry just now. Please try again in a moment, or email ${LEAGUE.email}.`
          : result.message,
      fieldErrors: {},
      values,
    };
  } catch (err) {
    console.error("[rtpl] registration threw", err);
    return {
      status: "error",
      message: "Registration is temporarily unavailable. Please try again shortly.",
      fieldErrors: {},
      values,
    };
  }
}
