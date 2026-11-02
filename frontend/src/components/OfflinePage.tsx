export default function OfflinePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#edf7fa] px-6 py-12 text-[#21243d] dark:bg-[#0f172a] dark:text-[#f8fafc]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,#00a8cc12_1px,transparent_1px),linear-gradient(to_bottom,#00a8cc12_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <section
        aria-labelledby="offline-title"
        className="relative w-full max-w-[560px] border-2 border-[#21243d] bg-white/90 p-6 shadow-[8px_8px_0_#00a8cc] sm:p-10 dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[8px_8px_0_#0e7490]"
      >
        <div className="mb-8 flex items-center justify-between border-b-2 border-dashed border-[#cbd5e1] pb-4 dark:border-[#334155]">
          <p className="font-heebo-bold text-[12px] uppercase tracking-[0.16em] text-[#64748b] dark:text-[#94a3b8]">
            Connection status <span className="text-[#ff6464]">/ 01</span>
          </p>
          <span className="font-heebo-bold flex items-center gap-2 text-[11px] uppercase tracking-wide text-[#bd3d3d] dark:text-[#ffaaaa]">
            <span className="h-2.5 w-2.5 animate-pulse bg-[#ff6464]" />
            Offline
          </span>
        </div>

        <div className="mb-7 flex justify-center">
          <div
            aria-hidden="true"
            className="relative flex h-36 w-36 items-center justify-center border-2 border-[#21243d] bg-[#edf7fa] dark:border-[#94a3b8] dark:bg-[#0f172a]"
          >
            <svg
              className="h-20 w-20 text-[#00a8cc] dark:text-[#67e8f9]"
              fill="none"
              viewBox="0 0 80 80"
            >
              <path
                d="M12 30c15-13 41-13 56 0M22 41c10-9 26-9 36 0M32 52c4-4 12-4 16 0"
                stroke="currentColor"
                strokeLinecap="square"
                strokeWidth="5"
              />
              <path
                d="M40 60v2"
                stroke="currentColor"
                strokeLinecap="square"
                strokeWidth="6"
              />
              <path
                d="m18 18 44 44"
                stroke="#ff6464"
                strokeLinecap="square"
                strokeWidth="6"
              />
            </svg>
            <span className="absolute -bottom-2 -right-2 grid grid-cols-2 gap-1">
              <span className="h-2 w-2 bg-[#00a8cc]" />
              <span className="h-2 w-2 bg-[#ff6464]" />
              <span className="h-2 w-2 bg-[#ff6464]" />
              <span className="h-2 w-2 bg-[#00a8cc]" />
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="font-heebo-medium text-[13px] uppercase tracking-[0.2em] text-[#ff6464]">
            Lost in transmission
          </p>
          <h1
            className="font-heebo-bold mt-2 text-[34px] leading-tight sm:text-[42px]"
            id="offline-title"
          >
            You’re offline
          </h1>
          <p className="font-heebo-regular mx-auto mt-4 max-w-[390px] text-[16px] leading-relaxed text-[#64748b] dark:text-[#cbd5e1]">
            Looks like the connection dropped. Check your internet and we’ll be
            ready when you’re back.
          </p>
          <button
            className="font-heebo-bold mt-7 cursor-pointer border-2 border-[#21243d] bg-[#ff6464] px-5 py-3 text-[14px] tracking-wide text-white transition-colors hover:bg-[#e95454] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6464] dark:border-[#94a3b8]"
            onClick={() => window.location.reload()}
            type="button"
          >
            Try again
          </button>
        </div>
      </section>
    </main>
  )
}
