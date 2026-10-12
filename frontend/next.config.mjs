/** @type {import('next').NextConfig} */
const nextConfig = {
  // Escape hatch so a production build/serve can be run without clobbering the
  // `.next` cache a `npm run dev` session is using. Leave unset for normal work;
  // set NEXT_DIST_DIR=.next-verify to build into a throwaway directory.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // Server actions cap request bodies at 1 MB; the player form carries a
    // payment screenshot of up to 5 MB, plus room for the other fields.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
