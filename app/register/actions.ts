"use server";

import { getSupabaseClient } from "@/lib/supabase";
import { LEAGUE } from "@/lib/league";
import { TSHIRT_SIZES, YES_NO, YES_NO_MAYBE } from "@/lib/registration";

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

const makeReference = () =>
  `RTPL${LEAGUE.season}-${Math.floor(1000 + Math.random() * 9000)}`;

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

  const fieldErrors: Record<string, string> = {};

  if (values.owners.length < 2) {
    fieldErrors.owners = "Please list the owners and their table numbers.";
  } else if (values.owners.length > 400) {
    fieldErrors.owners = "Please keep this under 400 characters.";
  }

  if (values.mobile.length < 6) {
    fieldErrors.mobile = "A contact mobile number is required.";
  } else if (!/^[\d\s+(),/-]+$/.test(values.mobile)) {
    fieldErrors.mobile = "Use digits, spaces and + ( ) , / - only.";
  }

  if (values.team.length < 2) {
    fieldErrors.team = "A proposed team name is required.";
  } else if (values.team.length > 80) {
    fieldErrors.team = "Please keep the team name under 80 characters.";
  }

  if (values.tshirt && !TSHIRT_SIZES.includes(values.tshirt as never)) {
    fieldErrors.tshirt = "Choose one of the listed sizes.";
  }
  if (values.tshirt === "Other" && !values.tshirt_other) {
    fieldErrors.tshirt = "Tell us which size you need.";
  }
  if (values.tshirt_other.length > 60) {
    fieldErrors.tshirt = "Please keep this under 60 characters.";
  }

  if (!YES_NO.includes(values.financial as never)) {
    fieldErrors.financial = "Please answer the financial commitment question.";
  }
  if (!YES_NO_MAYBE.includes(values.auction as never)) {
    fieldErrors.auction = "Please share your availability for the auction.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted questions and submit again.",
      fieldErrors,
      values,
    };
  }

  const entry = {
    owners: values.owners,
    owners_mobile: values.mobile,
    team_name: values.team,
    tshirt_size: values.tshirt || null,
    // Only meaningful alongside Other; the DB enforces the same rule.
    tshirt_size_other: values.tshirt === "Other" ? values.tshirt_other : null,
    financial_commitment: values.financial,
    auction_availability: values.auction,
    status: "pending" as const,
  };

  try {
    const supabase = getSupabaseClient();

    // Retry only on a reference collision — the 4-digit suffix can repeat.
    for (let attempt = 0; attempt < 4; attempt++) {
      const reference = makeReference();
      const { error } = await supabase
        .from("owner_registrations")
        .insert({ ...entry, reference });

      if (!error) {
        return {
          status: "success",
          message: "",
          fieldErrors: {},
          values,
          teamName: values.team,
          reference,
        };
      }

      if (error.code === "23505") {
        if (error.message.includes("reference")) continue;
        return {
          status: "error",
          message: "",
          fieldErrors: {
            team: "A team is already entered under that name. Pick another, or contact the tournament desk if this was you.",
          },
          values,
        };
      }

      console.error("[rtpl] registration insert failed", error);
      return {
        status: "error",
        message: `We could not save your entry just now. Please try again in a moment, or email ${LEAGUE.email}.`,
        fieldErrors: {},
        values,
      };
    }

    return {
      status: "error",
      message: "Could not allocate an entry reference. Please submit again.",
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
