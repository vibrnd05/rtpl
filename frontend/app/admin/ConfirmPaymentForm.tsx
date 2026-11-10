"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { confirmPayment, type ConfirmPaymentState } from "./actions";
import { toast } from "@/components/Toaster";

// Defined here, not in actions.ts: a "use server" module may only export
// async functions.
const initialState: ConfirmPaymentState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary whitespace-nowrap"
      disabled={pending}
    >
      {pending ? "Confirming…" : "Payment confirmed"}
    </button>
  );
}

export function ConfirmPaymentForm({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
  const [state, formAction] = useActionState(confirmPayment, initialState);

  useEffect(() => {
    if (state.status === "idle" || !state.message) return;
    toast(state.message, state.status === "error" ? "error" : "success");
  }, [state]);

  return (
    <form action={formAction} className="min-w-[300px]">
      <input type="hidden" name="playerId" value={playerId} />
      <div className="flex items-center gap-2">
        <input
          className="input"
          name="utr"
          type="text"
          placeholder="Transaction UTR"
          maxLength={30}
          autoComplete="off"
          aria-label={`Transaction UTR for ${playerName}`}
          aria-invalid={state.status === "error" || undefined}
        />
        <SubmitButton />
      </div>
    </form>
  );
}
