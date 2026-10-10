"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerPlayer, type FormState } from "./actions";
import {
  PLAYING_ROLES,
  T_SHIRT_SIZES,
  MEMBERSHIP_TYPES,
  BATTING_STYLES,
  BOWLING_STYLES,
} from "@/lib/players";
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
        className="mb-1.5! block text-[14.5px] font-semibold text-ink!"
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

export function PlayerRegistrationForm() {
  const [state, formAction] = useActionState(registerPlayer, initialState);

  // Controlled so nothing is lost when a failed submission re-renders the form.
  const [values, setValues] = useState({
    fullName: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    city: "",
    lastYearTeam: "",
    membershipType: "",
    playingRole: "",
    tShirtSize: "",
    battingStyle: "",
    bowlingStyle: "",
  });

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
          {state.fullName
            ? `${state.fullName} is in the squad list.`
            : "Your entry is in the squad list."}
        </h2>
        <p className="mt-7 max-w-[56ch] text-[16.5px] leading-[1.65]">
          The tournament desk has your details. We will be in touch on the
          number you gave with the kit, the schedule and the auction brief.
          Reference: {state.reference}
        </p>

        {state.fee !== undefined && (
          <div className="mt-8 max-w-[56ch] border-2 border-divider p-6">
            <p className="text-[14.5px] font-semibold">
              Entry fee: Rs. {state.fee.toLocaleString("en-IN")}
              {state.phase && (
                <span className="ml-2 text-ink/65">({state.phase})</span>
              )}
            </p>
            <p className="mt-1.5 text-sm text-ink/70">
              Scan the QR code below to pay.
            </p>
            {/* Placeholder until the payment QR code is ready. */}
            <div
              className="mt-5 flex aspect-square w-[min(240px,100%)] items-center justify-center border-2 border-dashed border-divider text-sm text-ink/55"
              role="img"
              aria-label="Payment QR code, coming soon"
            >
              QR code coming soon
            </div>
          </div>
        )}
        <div className="mt-8.5 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the league <span className="btn__arrow">→</span>
          </Link>
          <a href="/register" className="btn btn-ghost">
            Register another player
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

      {/* 01 — the player */}
      <section className="pt-[clamp(40px,5vw,64px)]">
        <SectionHeading
          index="01"
          title="The player"
          note="Everything about the entry goes to this number."
        >
          <div className="grid gap-6">
            <Question
              label="Full name"
              required
              htmlFor="fullName"
              error={err.fullName}
            >
              <input
                className="input"
                id="fullName"
                name="fullName"
                type="text"
                maxLength={120}
                value={values.fullName}
                onChange={set("fullName")}
                aria-invalid={Boolean(err.fullName)}
              />
            </Question>

            <Question
              label="Mobile number"
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
                maxLength={20}
                value={values.mobile}
                onChange={set("mobile")}
                aria-invalid={Boolean(err.mobile)}
              />
            </Question>

            <Question
              label="Email address"
              required
              htmlFor="email"
              error={err.email}
            >
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                maxLength={160}
                value={values.email}
                onChange={set("email")}
                aria-invalid={Boolean(err.email)}
              />
            </Question>

            <Question
              label="Date of birth"
              required
              htmlFor="dateOfBirth"
              error={err.dateOfBirth}
            >
              <input
                className="input"
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth}
                onChange={set("dateOfBirth")}
                aria-invalid={Boolean(err.dateOfBirth)}
              />
            </Question>

            <Question label="City" required htmlFor="city" error={err.city}>
              <input
                className="input"
                id="city"
                name="city"
                type="text"
                maxLength={80}
                value={values.city}
                onChange={set("city")}
                aria-invalid={Boolean(err.city)}
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
              label="Last year's team"
              hint="If you didn't play last season, write Uncapped."
              required
              htmlFor="lastYearTeam"
              error={err.lastYearTeam}
            >
              <input
                className="input"
                id="lastYearTeam"
                name="lastYearTeam"
                type="text"
                maxLength={80}
                value={values.lastYearTeam}
                onChange={set("lastYearTeam")}
                aria-invalid={Boolean(err.lastYearTeam)}
              />
            </Question>

            <Question
              label="Tabler / 41er"
              required
              error={err.membershipType}
            >
              <Choice
                name="membershipType"
                options={MEMBERSHIP_TYPES}
                value={values.membershipType}
                onChange={pick("membershipType")}
                invalid={Boolean(err.membershipType)}
              />
            </Question>
          </div>
        </SectionHeading>
      </section>

      <hr className="rule mt-[clamp(36px,4vw,56px)]" />

      {/* 03 — kit and role */}
      <section className="pt-[clamp(36px,4vw,56px)]">
        <SectionHeading index="03" title="Kit & role">
          <div className="grid gap-7">
            <Question
              label="T-shirt size"
              required
              error={err.tShirtSize}
            >
              <Choice
                name="tShirtSize"
                options={T_SHIRT_SIZES}
                value={values.tShirtSize}
                onChange={pick("tShirtSize")}
                invalid={Boolean(err.tShirtSize)}
              />
            </Question>

            <Question
              label="Define your quality as a player"
              hint="E.g. batsman, bowler, all-rounder or wicketkeeper."
              required
              error={err.playingRole}
            >
              <Choice
                name="playingRole"
                options={PLAYING_ROLES}
                value={values.playingRole}
                onChange={pick("playingRole")}
                invalid={Boolean(err.playingRole)}
              />
            </Question>

            <Question
              label="Type of batsman"
              required
              error={err.battingStyle}
            >
              <Choice
                name="battingStyle"
                options={BATTING_STYLES}
                value={values.battingStyle}
                onChange={pick("battingStyle")}
                invalid={Boolean(err.battingStyle)}
              />
            </Question>

            <Question
              label="Type of bowler"
              required
              error={err.bowlingStyle}
            >
              <Choice
                name="bowlingStyle"
                options={BOWLING_STYLES}
                value={values.bowlingStyle}
                onChange={pick("bowlingStyle")}
                invalid={Boolean(err.bowlingStyle)}
              />
            </Question>
          </div>
        </SectionHeading>
      </section>

      <hr className="rule mt-[clamp(36px,4vw,56px)]" />

      {/* 04 — payment */}
      <section className="pt-[clamp(36px,4vw,56px)]">
        <SectionHeading
          index="04"
          title="Payment"
          note="Pay the entry fee by scanning the QR code once your entry is in."
        >
          {/* Placeholder until the payment QR code is ready. */}
          <div
            className="flex aspect-square w-[min(240px,100%)] items-center justify-center border-2 border-dashed border-divider text-sm text-ink/55"
            role="img"
            aria-label="Payment QR code, coming soon"
          >
            QR code coming soon
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
