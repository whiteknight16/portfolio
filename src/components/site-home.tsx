/**
 * Placeholder for the real portfolio home.
 *
 * This is the seam the launch flag switches to. Build the actual site out here
 * (or restructure into route segments) on your `develop` branch. It renders
 * only when `LAUNCHED=true`, so it stays out of production until you flip the
 * switch.
 */
export function SiteHome() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
          The real site goes here.
        </h1>
        <p className="mt-4 text-white/60">
          You&rsquo;re seeing this because{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">
            LAUNCHED=true
          </code>
          . Build out your portfolio in{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">
            src/components/site-home.tsx
          </code>
          .
        </p>
      </div>
    </main>
  );
}
