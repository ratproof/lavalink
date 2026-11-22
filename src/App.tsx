import { useEffect, useState, type ReactNode } from "react";
import { useNode } from "./useNode";
import { bytes, pct, uptime } from "./format";
import { resolveSources } from "./sources";
import Navbar from "./Navbar";

const HISTORY = 40;

/**
 * Simple Icons serves each logo in its official brand color when no color is given in the url.
 * Brands whose color is black would disappear on the dark chips, so they get an explicit override.
 */
const ICON_COLOR_OVERRIDE: Record<string, string> = {
  tidal: "ffffff",
};

interface Service {
  key: string;
  name: string;
  slug: string;
}

function Logo({ service }: { service: Service }) {
  const [broken, setBroken] = useState(service.slug === "");
  if (broken) {
    return <span className="text-2xl font-semibold text-[var(--color-accent-soft)]">{service.name.slice(0, 1).toUpperCase()}</span>;
  }
  const override = ICON_COLOR_OVERRIDE[service.slug];
  return (
    <img
      src={`https://cdn.simpleicons.org/${service.slug}${override ? `/${override}` : ""}`}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-8 w-8"
    />
  );
}

function Chip({ service }: { service: Service }) {
  return (
    <div className="group relative grid h-16 w-16 shrink-0 cursor-default place-items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-1)] transition-colors duration-200 hover:border-white/25 hover:bg-[var(--color-surface-2)]">
      <Logo service={service} />
      <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 translate-y-1 rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-[var(--color-fg)] opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
        {service.name}
      </span>
    </div>
  );
}

/** Endless strip of the sources the node can play from. Pauses on hover, name shows under the icon. */
function Services({ enabled }: { enabled: string[] }) {
  const { popular, other } = resolveSources(enabled);
  const services: Service[] = [
    // "Direct links" is not a service, so it stays out of the strip.
    ...popular.filter((s) => s.enabled && s.id !== "http").map((s) => ({ key: s.id, name: s.name, slug: s.id })),
    ...other.map((n) => ({ key: n, name: n, slug: n.toLowerCase().replace(/[^a-z0-9]/g, "") })),
  ];
  if (services.length === 0) return null;

  // One half of the loop must be wider than any screen (each chip takes 80px with its gap),
  // otherwise the right side goes blank while the strip scrolls.
  const reps = Math.max(1, Math.ceil(46 / services.length));
  const half = Array.from({ length: reps }, () => services).flat();

  return (
    <div className="marquee-wrap overflow-hidden pb-14" aria-label="Available services">
      <div className="marquee" style={{ animationDuration: `${Math.round(half.length * 1.8)}s` }}>
        {[0, 1].map((copy) =>
          half.map((s, i) => (
            <div key={`${copy}-${i}`} aria-hidden={copy === 1 ? true : undefined}>
              <Chip service={s} />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function MiniBar({ value }: { value: number }) {
  const v = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  return (
    <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/10 sm:block">
      <div className="h-full rounded-full bg-[var(--color-accent-soft)] transition-[width] duration-500" style={{ width: `${v * 100}%` }} />
    </div>
  );
}

function Row({ name, value, bar }: { name: string; value: ReactNode; bar?: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4 last:border-0">
      <span className="font-medium">{name}</span>
      <span className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
        {bar !== undefined && <MiniBar value={bar} />}
        {value}
      </span>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-1)]">{children}</div>;
}

function Checks({ history }: { history: boolean[] }) {
  const empty = Array.from({ length: HISTORY - history.length }, () => null);
  const slots: (boolean | null)[] = [...empty, ...history];
  return (
    <div>
      <div className="flex h-9 items-stretch gap-[3px]">
        {slots.map((s, i) => (
          <div
            key={i}
            className={`flex-1 rounded-[3px] ${s === null ? "bg-white/[0.06]" : s ? "bg-emerald-400/80" : "bg-red-400/80"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>Checks since you opened this page</span>
        <span>Now</span>
      </div>
    </div>
  );
}

export default function App() {
  const { data, failed } = useNode();
  const [history, setHistory] = useState<boolean[]>([]);

  useEffect(() => {
    if (data) setHistory((h) => [...h, data.online].slice(-HISTORY));
  }, [data]);

  const online = data?.online === true;
  const stats = data?.stats ?? null;
  const info = data?.info ?? null;

  const tone =
    data === null
      ? { box: "border-white/10 bg-white/[0.04] text-zinc-300", dot: "bg-zinc-400", text: failed ? "Status api unreachable" : "Checking node..." }
      : online
        ? { box: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400", text: "Node is operational" }
        : { box: "border-red-400/25 bg-red-400/10 text-red-300", dot: "bg-red-400", text: "Node is not responding" };

  return (
    <>
      <Navbar />

      {/* The navbar is fixed and 68px tall, so content starts below it. */}
      <div className="fade-in pt-24">{info && <Services enabled={info.sourceManagers} />}</div>

      <main className="mx-auto w-full max-w-2xl px-5 pt-4 pb-16 sm:pt-8">
        <h1 className="fade-in text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">Stains music status</h1>

        <div className={`fade-in mt-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${tone.box}`}>
          <span className="flex items-center gap-3 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              {online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden />
            </span>
            {tone.text}
          </span>
          {online && data?.latency != null && <span className="text-sm opacity-80">{data.latency} ms</span>}
        </div>

        {data && !online && <p className="mt-3 text-sm text-[var(--color-text-muted)]">{data.error ?? "No response."}</p>}

        {stats && info && (
          <div className="fade-in">
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Node</h2>
              <Panel>
                <Row name="Voice players" value={`${stats.playingPlayers} playing, ${stats.players} connected`} />
                <Row name="Uptime" value={uptime(stats.uptime)} />
                <Row name="CPU" value={pct(stats.cpu.lavalinkLoad)} bar={stats.cpu.lavalinkLoad} />
                <Row
                  name="Memory"
                  value={bytes(stats.memory.used)}
                  bar={stats.memory.allocated > 0 ? stats.memory.used / stats.memory.allocated : 0}
                />
              </Panel>
            </section>

            <section className="mt-8">
              <Checks history={history} />
            </section>

            <p className="mt-10 text-xs text-[var(--color-text-muted)]">Lavalink {info.version.semver}. Refreshes every 5 seconds.</p>
          </div>
        )}
      </main>
    </>
  );
}
