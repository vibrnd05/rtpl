import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getAdminToken } from "@/lib/adminSession";
import { LEAGUE } from "@/lib/league";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in - RTPL",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // A live cookie means there is nothing to sign in to.
  if (await getAdminToken()) redirect("/admin");

  return (
    <>
      <SiteHeader variant="back" />

      <div className="shell-narrow">
        <section className="pb-[clamp(56px,8vw,110px)] pt-[clamp(40px,6vw,76px)]">
          <p className="eyebrow mb-5">Tournament desk</p>
          <h1 className="ml-[-0.058em] text-[clamp(38px,5.6vw,68px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            Admin login
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16.5px] leading-[1.65] text-ink/75">
            Sign in to see the owner entries that have come in for Season {LEAGUE.season}.
          </p>

          <LoginForm />
        </section>
      </div>
    </>
  );
}
