"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import { registerPlayer, type FormState } from "./actions";
import { compressImage } from "@/lib/compressImage";
import { toast } from "@/components/Toaster";
import {
  PLAYING_ROLES,
  T_SHIRT_SIZES,
  MEMBERSHIP_TYPES,
  BATTING_STYLES,
  BOWLING_STYLES,
  LAST_YEAR_TEAMS,
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
      {/* The message itself goes to a toast; the field just turns red. */}
      {error && <span className="sr-only">{error}</span>}
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

/** Matches the server action's per-file limit. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** Vercel rejects request bodies over 4.5 MB; leave room for the text fields. */
const MAX_TOTAL_UPLOAD_BYTES = 4.2 * 1024 * 1024;

type Values = {
  fullName: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  city: string;
  lastYearTeam: string;
  membershipType: string;
  playingRole: string;
  tShirtSize: string;
  jerseyNumber: string;
  battingStyle: string;
  bowlingStyle: string;
};

/**
 * The checks that need no server, run before anything is uploaded. Messages
 * match the backend model's, which stays the authority on the finer rules.
 */
function validate(
  values: Values,
  availabilityConfirmed: boolean,
  photo: File | null,
  screenshot: File | null
): Record<string, string> {
  const errors: Record<string, string> = {};
  const v = Object.fromEntries(
    Object.entries(values).map(([k, val]) => [k, val.trim()])
  ) as Values;

  if (v.fullName.length < 2) errors.fullName = "Please enter the player's full name.";
  if (v.mobile.length < 6) errors.mobile = "A contact mobile number is required.";
  else if (!/^[\d\s+(),/-]+$/.test(v.mobile))
    errors.mobile = "Use digits, spaces and + ( ) , / - only.";
  if (!v.email) errors.email = "An email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    errors.email = "Enter a valid email address.";
  if (!v.dateOfBirth) errors.dateOfBirth = "A date of birth is required.";
  if (!v.city) errors.city = "A city is required.";
  if (!photo) errors.playerPhoto = "Please upload a picture of yourself.";
  if (!v.lastYearTeam) errors.lastYearTeam = "Please select last year's team, or Uncapped.";
  if (!v.membershipType) errors.membershipType = "Please select Tabler or Square Leg.";
  if (!v.tShirtSize) errors.tShirtSize = "Please select a T-shirt size.";
  if (!/^\d{1,3}$/.test(v.jerseyNumber))
    errors.jerseyNumber = v.jerseyNumber
      ? "The jersey number must be 1 to 3 digits."
      : "Please enter a jersey number.";
  if (!v.playingRole) errors.playingRole = "Please select a playing role.";
  if (!v.battingStyle) errors.battingStyle = "Please select a type of batsman.";
  if (!v.bowlingStyle) errors.bowlingStyle = "Please select a type of bowler.";
  if (!screenshot) errors.paymentScreenshot = "Please upload a screenshot of your payment.";
  if (!availabilityConfirmed)
    errors.availabilityConfirmed =
      "Please confirm that you are available to play on both 20th and 21st February 2027.";

  return errors;
}

/** The chosen file, or null when the input is empty. */
function pickedFile(form: HTMLFormElement, name: string): File | null {
  const input = form.elements.namedItem(name);
  const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
  return file && file.size > 0 ? file : null;
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? label : "Submit entry"}{" "}
      <span className="btn__arrow">→</span>
    </button>
  );
}

export function PlayerRegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerPlayer, initialState);

  // Problems caught in the browser, before anything is sent.
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [preparing, setPreparing] = useState(false);

  // Every answer from the server arrives as a fresh state object, so each one
  // raises its own toast — including the same error twice in a row.
  useEffect(() => {
    if (state.status === "error") toast(state.message);
    if (state.status === "success")
      toast(
        state.reference ? `Entry submitted. Reference ${state.reference}.` : "Entry submitted.",
        "success"
      );
  }, [state]);

  // Controlled so nothing is lost when a failed submission re-renders the form.
  const [values, setValues] = useState<Values>({
    fullName: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    city: "",
    lastYearTeam: "",
    membershipType: "",
    playingRole: "",
    tShirtSize: "",
    jerseyNumber: "",
    battingStyle: "",
    bowlingStyle: "",
  });
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false);

  /** Drops a field's browser-side error once the player touches it. */
  const clearError = (key: string) =>
    setClientErrors((errs) => {
      if (!(key in errs)) return errs;
      const { [key]: _, ...rest } = errs;
      return rest;
    });

  const set =
    (key: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      clearError(key);
    };

  const pick = (key: keyof Values) => (next: string) => {
    setValues((v) => ({ ...v, [key]: next }));
    clearError(key);
  };

  const err = { ...state.fieldErrors, ...clientErrors };
  const busy = preparing || isPending;

  /**
   * Submitted by hand rather than through `<form action>`: React resets a form
   * after an action-attribute submission, and a reset empties the file inputs
   * — which cannot be refilled from code — so every rejected entry used to
   * cost the player both uploads.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;

    const photo = pickedFile(form, "playerPhoto");
    const screenshot = pickedFile(form, "paymentScreenshot");

    const errors = validate(values, availabilityConfirmed, photo, screenshot);
    if (Object.keys(errors).length > 0) {
      showErrors(form, errors);
      return;
    }

    setPreparing(true);
    const [smallPhoto, smallScreenshot] = await Promise.all([
      compressImage(photo!),
      compressImage(screenshot!),
    ]);
    setPreparing(false);

    const sizeErrors: Record<string, string> = {};
    if (smallPhoto.size > MAX_IMAGE_BYTES)
      sizeErrors.playerPhoto = "Your picture must be 5 MB or smaller.";
    if (smallScreenshot.size > MAX_IMAGE_BYTES)
      sizeErrors.paymentScreenshot = "The payment screenshot must be 5 MB or smaller.";
    if (
      Object.keys(sizeErrors).length === 0 &&
      smallPhoto.size + smallScreenshot.size > MAX_TOTAL_UPLOAD_BYTES
    ) {
      const tooBig = "Together the two images are too large. Please use a smaller picture or a JPG screenshot.";
      sizeErrors[smallPhoto.size >= smallScreenshot.size ? "playerPhoto" : "paymentScreenshot"] = tooBig;
    }
    if (Object.keys(sizeErrors).length > 0) {
      showErrors(form, sizeErrors);
      return;
    }

    setClientErrors({});

    const data = new FormData(form);
    data.set("playerPhoto", smallPhoto, smallPhoto.name);
    data.set("paymentScreenshot", smallScreenshot, smallScreenshot.name);
    startTransition(() => formAction(data));
  }

  /**
   * Fields go red; the toast names the first problem in form order, which is
   * also where the page scrolls to.
   */
  function showErrors(form: HTMLFormElement, errors: Record<string, string>) {
    setClientErrors(errors);

    const first = Array.from(form.elements).find(
      (el): el is HTMLInputElement =>
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
          ? el.name in errors
          : false
    );
    first?.scrollIntoView({ behavior: "smooth", block: "center" });

    const count = Object.keys(errors).length;
    const lead = (first && errors[first.name]) || Object.values(errors)[0];
    toast(
      count > 1
        ? `${lead} (${count - 1} more field${count > 2 ? "s" : ""} highlighted.)`
        : lead
    );
  }

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
          The tournament desk has your details, and we have sent a copy of
          your entry to {state.email || "your email address"}. Once the RTPL
          Management Team has verified your payment, we will email you again
          to confirm your registration.
        </p>

        <div className="mt-8 max-w-[56ch] border-2 border-divider p-6">
          <p className="tnum m-0 text-[14.5px] font-semibold">
            Reference: {state.reference}
          </p>
          {state.fee !== undefined && (
            <p className="mt-1.5 text-sm text-ink/70">
              Entry fee: Rs. {state.fee.toLocaleString("en-IN")}
              {state.phase && <span className="ml-2">({state.phase.replace(/^phase-(\d+)$/, "Phase $1").replace(/^reserve$/, "Reserve")})</span>}
            </p>
          )}
        </div>

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
    <form onSubmit={handleSubmit} className="pb-[clamp(48px,6vw,80px)]" noValidate>
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

            <Question
              label="Upload your picture"
              hint="A clear, recent picture of you. JPG, PNG, WEBP or HEIC, up to 5 MB."
              required
              htmlFor="playerPhoto"
              error={err.playerPhoto}
            >
              <input
                className="input file:mr-4 file:cursor-pointer file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-paper"
                id="playerPhoto"
                name="playerPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={() => clearError("playerPhoto")}
                aria-invalid={Boolean(err.playerPhoto)}
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
              hint="Your RTPL 7.0 side. If you didn't play last season, choose Uncapped."
              required
              htmlFor="lastYearTeam"
              error={err.lastYearTeam}
            >
              <div className="relative">
                <select
                  className="input pr-10"
                  id="lastYearTeam"
                  name="lastYearTeam"
                  value={values.lastYearTeam}
                  onChange={set("lastYearTeam")}
                  aria-invalid={Boolean(err.lastYearTeam)}
                >
                  <option value="" disabled>
                    Select a team
                  </option>
                  {LAST_YEAR_TEAMS.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink/60"
                >
                  ▼
                </span>
              </div>
            </Question>

            <Question
              label="Tabler / Square Leg"
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
              label="Jersey number"
              hint="Digits only, up to 3."
              required
              htmlFor="jerseyNumber"
              error={err.jerseyNumber}
            >
              <input
                className="input"
                id="jerseyNumber"
                name="jerseyNumber"
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={values.jerseyNumber}
                onChange={(e) =>
                  pick("jerseyNumber")(e.target.value.replace(/\D/g, ""))
                }
                aria-invalid={Boolean(err.jerseyNumber)}
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
          note="Scan the QR code to pay the entry fee, then submit your entry. Keep the transaction UTR handy in case we need to trace the payment."
        >
          <div className="grid gap-7">
            <div className="grid gap-3">
              <img
                src="/qr-code.jpeg"
                alt="UPI payment QR code"
                className="block aspect-square w-[min(240px,100%)] border-2 border-divider object-contain"
              />
              <p className="m-0 text-sm text-ink/70">
                Or pay to UPI ID:{" "}
                <span className="font-semibold text-ink select-all">
                  pawansurana85@okhdfcbank
                </span>
              </p>
            </div>

            <p className="m-0 text-[14.5px] font-semibold">
              Entry fee: {LEAGUE.playerFee}
            </p>

            <Question
              label="Upload payment screenshot"
              hint="A screenshot of the completed payment showing the UTR / transaction ID. JPG, PNG, WEBP or HEIC, up to 5 MB."
              required
              htmlFor="paymentScreenshot"
              error={err.paymentScreenshot}
            >
              <input
                className="input file:mr-4 file:cursor-pointer file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-paper"
                id="paymentScreenshot"
                name="paymentScreenshot"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={() => clearError("paymentScreenshot")}
                aria-invalid={Boolean(err.paymentScreenshot)}
              />
            </Question>
          </div>
        </SectionHeading>
      </section>

      <label className="mt-[clamp(40px,5vw,64px)] flex cursor-pointer items-start gap-3 border-t-2 border-divider pt-8 text-[14.5px] font-semibold leading-normal">
        <input
          className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer accent-accent"
          type="checkbox"
          name="availabilityConfirmed"
          checked={availabilityConfirmed}
          onChange={(e) => {
            setAvailabilityConfirmed(e.target.checked);
            clearError("availabilityConfirmed");
          }}
          aria-invalid={Boolean(err.availabilityConfirmed)}
        />
        {/* No inline message any more, so the sentence itself turns orange. */}
        <span className={err.availabilityConfirmed ? "text-accent-700" : undefined}>
          By submitting this form, I confirm that I am available to attend and
          play in RTPL on both 20th and 21st February 2027
          <span className="ml-1 text-accent-700">*</span>
        </span>
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SubmitButton
          pending={busy}
          label={preparing ? "Preparing images…" : "Submitting…"}
        />
        <Link href="/" className="btn btn-ghost">
          Cancel
        </Link>
        <p className="m-0 text-[13.5px] text-ink/70">
          Fields marked * are required.
        </p>
      </div>
    </form>
  );
}
