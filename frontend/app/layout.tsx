import type { Metadata, Viewport } from "next";
import { LEAGUE } from "@/lib/league";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import "./globals.css";

const description = `Round Table Premier League Season ${LEAGUE.season} — two days of floodlit T10 cricket, ${LEAGUE.dates}, at ${LEAGUE.venue.name}. ${LEAGUE.slotsOpen} team slots open.`;

export const metadata: Metadata = {
  title: {
    default: `RTPL - Round Table Premier League Season ${LEAGUE.season}`,
    template: "%s",
  },
  description,
  openGraph: {
    title: `RTPL - Round Table Premier League Season ${LEAGUE.season}`,
    description,
    type: "website",
  },
};

/* Paints the mobile browser's own chrome the same navy as the page ground,
   so the address bar does not sit on the design as a light band. Kept in step
   with --color-paper in globals.css by hand — Next needs a literal here. */
export const viewport: Viewport = {
  themeColor: "#040d22",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline script below adds `class="js"` to
    // this element before React hydrates, so the server markup and the client
    // DOM legitimately differ here. Scoped to <html> only — mismatches
    // anywhere else still surface.
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink">
        {/* Runs before the rest of the body is parsed, so the scroll-reveal
            start state is in place before first paint — no flash of content
            appearing and then hiding. Without JS the class is never added and
            everything simply stays visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
        {children}
        <ScrollReveal />
        {/* In the layout, not a page, so the track survives the hop
            between the landing page and the registration form. */}
        <BackgroundMusic />
      </body>
    </html>
  );
}
