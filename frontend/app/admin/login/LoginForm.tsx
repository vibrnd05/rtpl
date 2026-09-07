"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"} <span className="btn__arrow">→</span>
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="mt-9 grid max-w-[420px] gap-6">
      <div className="field">
        <label
          htmlFor="username"
          className="mb-1.5! block text-[14.5px] font-semibold text-ink!"
        >
          Username
        </label>
        <input
          className="input"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="field">
        <label
          htmlFor="password"
          className="mb-1.5! block text-[14.5px] font-semibold text-ink!"
        >
          Password
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <p
          className={`m-0 text-[13.5px] ${
            state.message ? "text-accent-700" : "text-ink/70"
          }`}
        >
          {state.message || "Tournament desk access only."}
        </p>
      </div>
    </form>
  );
}
