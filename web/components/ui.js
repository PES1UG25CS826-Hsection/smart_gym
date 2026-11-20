export const ACCENT = '#d4ff3a';
export const inputCls = 'rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#0b0b0f] focus:ring-2 focus:ring-[#d4ff3a]';
export const fieldCls = `${inputCls} w-full`;
const btn = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60';
export const btnPrimary = `${btn} bg-[#d4ff3a] text-[#0b0b0f] shadow-sm hover:brightness-95`;
export const btnDark = `${btn} bg-[#0b0b0f] text-white hover:bg-[#1c1c24]`;
export const btnGhost = `${btn} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`;
export const btnGhostLight = `${btn} border border-white/30 text-white hover:bg-white/10`;
export const linkAction = 'text-sm font-semibold text-gray-900 underline decoration-[#d4ff3a] decoration-2 underline-offset-4 hover:bg-[#d4ff3a]/40';
export const linkDanger = 'text-sm font-semibold text-red-600 hover:underline';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-bold text-gray-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[#d4ff3a]" />
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function Hero({ kicker, title, children }) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-[#0b0b0f] p-7 text-white md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d4ff3a]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4ff3a]">{kicker}</p>
        <h1 className="mt-2 text-3xl font-black uppercase leading-tight tracking-tight md:text-5xl">{title}</h1>
        {children && <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

export function Notice({ ok, children }) {
  if (!children) return null;
  return <p className={`rounded-xl px-4 py-2.5 text-sm font-medium ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{children}</p>;
}

export function Loading() {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-gray-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#0b0b0f]" />
      Loading...
    </div>
  );
}

export function ErrorText({ children }) {
  return children ? <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{children}</p> : null;
}
