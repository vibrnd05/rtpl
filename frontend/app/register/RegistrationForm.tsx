"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerTeam, type FormState } from "./actions";
import { TSHIRT_SIZES, YES_NO, YES_NO_MAYBE } from "@/lib/registration";
import { LEAGUE } from "@/lib/league";

// Defined here, not in actions.ts: a "use server" module may only export
// async functions, so a plain object export would arrive as undefined.
const initialState: FormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: {},
};

function SectionHeading({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-[clamp(20px,4vw,60px)] md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]"
      data-reveal
    >
      <div>
        <p className="tnum m-0 text-[12.5px] uppercase tracking-widest text-ink/65">
          {index}
        </p>
        <h2 className="mt-3 text-[22px] font-extrabold tracking-[-0.01em]">
          {title}
        </h2>
        {note && (
          <p className="mt-3.5 text-sm leading-[1.6] text-ink/70">{note}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Question({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const Label = htmlFor ? "label" : "p";
  return (
    <div className="field">
      <Label
        htmlFor={htmlFor}
        className="mb-1.5! block text-[13px] font-semibold text-ink!"
      >
        {label}
        {required && <span className="ml-1 text-accent-700">*</span>}
      </Label>
      {hint && <p className="mb-2 text-xs leading-normal text-ink/60">{hint}</p>}
      {children}
      {error && <p className="mt-1.5 text-xs text-accent-700">{error}</p>}
    </div>
  );
}

/** Segmented radio group — one hidden input per option. */
function Choice({
  name,
  options,
  value,
  onChange,
  invalid,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  invalid?: boolean;
}) {
  return (
    <div className="seg" role="radiogroup" aria-invalid={invalid || undefined}>
      {options.map((option) => (
        <label key={option} className="seg-opt">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Submitting…" : "Submit entry"}{" "}
      <span className="btn__arrow">→</span>
    </button>
  );
}

export function RegistrationForm() {
  const [state, formAction] = useActionState(registerTeam, initialState);

  // Controlled so nothing is lost when a failed submission re-renders the form.
  const [values, setValues] = useState({
    owners: "",
    mobile: "",
    team: "",
    tshirt: "",
    tshirt_other: "",
    financial: "",
    auction: "",
  });

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const pick = (key: keyof typeof values) => (next: string) =>
    setValues((v) => ({ ...v, [key]: next }));

  const err = state.fieldErrors;

  if (state.status === "success") {
    return (
      <section className="py-[clamp(56px,8vw,110px)]">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="inline-block h-2.5 w-2.5 bg-accent" />
          Entry received
        </p>
        <h2 className="ml-[-0.058em] max-w-[26ch] text-[clamp(30px,4vw,50px)] font-extrabold leading-[1.06] tracking-tight">
          {state.teamName
            ? `${state.teamName} is in the draw.`
            : "Your entry is in the draw."}
        </h2>
        <p className="mt-7 max-w-[56ch] text-[16.5px] leading-[1.65]">
          The tournament desk has your details. We will be in touch on the
          number you gave with the owner agreement, the fee schedule and the
          auction brief. Reference: {state.reference}
        </p>
        <div className="mt-8.5 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the league <span className="btn__arrow">→</span>
          </Link>
          <a href="/register" className="btn btn-ghost">
            Submit another team
          </a>
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} className="pb-[clamp(48px,6vw,80px)]" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {/* 01 — the owners */}
      <section className="pt-[clamp(40px,5vw,64px)]">
        <SectionHeading
          index="01"
          title="The owners"
          note="Everything about the entry goes to this number."
        >
          <div className="grid gap-6">
            <Question
              label="Name of Owner with Table No"
              hint="E.g Arjun Mehta (RT 187)"
              required
              htmlFor="owners"
              error={err.owners}
            >
              <textarea
                className="input"
                id="owners"
                name="owners"
                rows={3}
                maxLength={400}
                value={values.owners}
                onChange={set("owners")}
                aria-invalid={Boolean(err.owners)}
              />
            </Question>

            <Question
              label="Mobile Number of the Owner"
              required
              htmlFor="mobile"
              error={err.mobile}
            >
              <input
                className="input"
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="tel"
                maxLength={120}
                value={values.mobile}
                onChange={set("mobile")}
                aria-invalid={Boolean(err.mobile)}
              />
            </Question>
          </div>
        </SectionHeading>
      </section>

      <hr className="rule mt-[clamp(36px,4vw,56px)]" />

      {/* 02 — the team */}
      <section className="pt-[clamp(36px,4vw,56px)]">
        <SectionHeading index="02" title="The team">
          <div className="grid gap-6">
            <Question
              label="Proposed Team Name"
              required
              htmlFor="team"
              error={err.team}
            >
              <input
                className="input"
                id="team"
                name="team"
                type="text"
                maxLength={80}
                value={values.team}
                onChange={set("team")}
                aria-invalid={Boolean(err.team)}
              />
            </Question>

            <Question label="T-Shirt size" error={err.tshirt}>
              <Choice
                name="tshirt"
                options={TSHIRT_SIZES}
                value={values.tshirt}
                onChange={pick("tshirt")}
                invalid={Boolean(err.tshirt)}
              />
              {values.tshirt === "Other" && (
                <input
                  className="input mt-3 max-w-70"
                  name="tshirt_other"
                  type="text"
                  maxLength={60}
                  aria-label="Other t-shirt size"
                  value={values.tshirt_other}
                  onChange={set("tshirt_other")}
                />
              )}
            </Question>
          </div>
        </SectionHeading>
      </section>

      <hr className="rule mt-[clamp(36px,4vw,56px)]" />

      {/* 03 — commitments */}
      <section className="pt-[clamp(36px,4vw,56px)]">
        <SectionHeading index="03" title="Commitments">
          <div className="grid gap-7">
            <Question
              label="Owning a RTPL team involves a financial commitment, are you willing to fulfill that and timely?"
              hint={`Fees is ${LEAGUE.entryFee}.`}
              required
              error={err.financial}
            >
              <Choice
                name="financial"
                options={YES_NO}
                value={values.financial}
                onChange={pick("financial")}
                invalid={Boolean(err.financial)}
              />
            </Question>

            <Question
              label={`Auction Date would be ${LEAGUE.auctionDate}, please share your availability.`}
              required
              error={err.auction}
            >
              <Choice
                name="auction"
                options={YES_NO_MAYBE}
                value={values.auction}
                onChange={pick("auction")}
                invalid={Boolean(err.auction)}
              />
            </Question>
          </div>
        </SectionHeading>
      </section>

      <div className="mt-[clamp(40px,5vw,64px)] flex flex-wrap items-center gap-3 border-t-2 border-divider pt-8">
        <SubmitButton />
        <Link href="/" className="btn btn-ghost">
          Cancel
        </Link>
        <p
          className={`m-0 text-[13.5px] ${
            state.status === "error" ? "text-accent-700" : "text-ink/70"
          }`}
        >
          {state.message || "Fields marked * are required."}
        </p>
      </div>
    </form>
  );
}
