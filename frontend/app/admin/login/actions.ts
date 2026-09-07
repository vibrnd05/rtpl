"use server";

import { redirect } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { setAdminToken } from "@/lib/adminSession";

export type LoginState = {
  message: string;
};

export async function signIn(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = (formData.get("username") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!username || !password) {
    return { message: "Enter both a username and a password." };
  }

  let result;
  try {
    result = await adminLogin(username, password);
  } catch (err) {
    console.error("[rtpl] admin login threw", err);
    return { message: "Sign-in is temporarily unavailable. Try again shortly." };
  }

  if (!result.ok) {
    console.error("[rtpl] admin login rejected", result.status, result.error);
    return {
      message:
        result.status >= 500
          ? "Sign-in is temporarily unavailable. Try again shortly."
          : result.message,
    };
  }

  await setAdminToken(result.data.token, result.data.expiresIn);

  // Outside the try/catch — redirect() works by throwing.
  redirect("/admin");
}
