import { useState, type ReactNode } from "react";
import { useNode } from "./useNode";
import { bytes, clock, pct, uptime } from "./format";
import { ClockIcon, CpuIcon, MemoryIcon, SignalIcon, UsersIcon } from "./icons";
import type { PlayerRow } from "./types";
import { resolveSources } from "./sources";

/** simple-icons slugs where they differ from our source ids. Anything missing falls back to a letter. */
const SLUGS: Record<string, string> = {
  http: "",
  applemusic: "applemusic",
  yandexmusic: "yandexmusic",
};

interface Service {
  key: string;
  name: string;
  slug: string;
}

function Logo({ service }: { service: Service }) {
  const [broken, setBroken] = useState(service.slug === "");
  if (broken) {
    return <span className="text-base font-semibold text-[var(--color-accent-soft)]">{service.name.slice(0, 1).toUpperCase()}</span>;
  }
  return (
    <img
      src={`https://cdn.simpleicons.org/${service.slug}/ffffff`}
      alt=""
      width={22}
      height={22}
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-[22px] w-[22px] opacity-70 transition-opacity duration-200 group-hover:opacity-100"
    />
  );
}

function Chip({ service }: { service: Service }) {
  return (
    <div className="group relative grid h-14 w-14 shrink-0 cursor-default place-items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-1)] transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--color-brand)_60%,transparent)] hover:bg-[var(--color-surface-2)]">
      <Logo service={service} />
      <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 translate-y-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[var(--color-fg)] opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
        {service.name}
      </span>
    </div>
  );
}

/** Endless strip of the sources the node can play from. Pauses on hover, name shows under the icon. */
function Services({ enabled }: { enabled: string[] }) {
  const { popular, other } = resolveSources(enabled);
  const services: Service[] = [
    ...popular.filter((s) => s.enabled).map((s) => ({ key: s.id, name: s.name, slug: SLUGS[s.id] ?? s.id })),
    ...other.map((n) => ({ key: n, name: n, slug: n.toLowerCase().replace(/[^a-z0-9]/g, "") })),
  ];
  if (services.length === 0) return null;

  // Repeat the list so one half of the loop is always wider than the screen.
  const reps = Math.max(1, Math.ceil(14 / services.length));
  const half = Array.from({ length: reps }, () => services).flat();

  return (
    <div className="marquee-wrap overflow-hidden pb-11" aria-label="Available services">
      <div className="marquee" style={{ animationDuration: `${Math.max(30, half.length * 4)}s` }}>
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

function Bar({ value }: { value: number }) {
  const v = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
      <div className="bg-grad h-full rounded-full transition-[width] duration-500" style={{ width: `${v * 100}%` }} />
    </div>
  );
}

function Stat({ icon, label, value, bar }: { icon: ReactNode; label: string; value: string; bar?: number }) {
  return (
    <div className="card rounded-2xl p-5 text-left">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span className="text-[var(--color-accent-soft)]">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
      {bar !== undefined && (
        <div className="mt-3">
          <Bar value={bar} />
        </div>
      )}
    </div>
  );
}

function NowPlaying({ players }: { players: PlayerRow[] }) {
  const active = players.filter((p) => p.title);
  if (active.length === 0) return null;
  return (
    <div className="card mt-4 rounded-2xl p-5 text-left">
      <div className="mb-3 text-sm text-[var(--color-text-muted)]">Now playing</div>
      <ul className="divide-y divide-[var(--color-line)]">
        {active.map((p) => (
          <li key={p.guildId} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{p.title}</div>
              <div className="truncate text-sm text-[var(--color-text-muted)]">{p.author}</div>
            </div>
            <div className="shrink-0 text-sm text-[var(--color-text-muted)]">
              {p.paused ? "Paused" : p.isStream ? "Live" : clock(p.position)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const { data, failed } = useNode();
  const online = data?.online === true;
  const stats = data?.stats ?? null;
  const info = data?.info ?? null;

  const dot = data === null ? "bg-zinc-500" : online ? "bg-emerald-400" : "bg-red-400";
  const label = data === null ? (failed ? "Status api unreachable" : "Checking node") : online ? "Online" : "Offline";

  return (
    <>
      {info && (
        <div className="fade-in pt-8">
          <Services enabled={info.sourceManagers} />
        </div>
      )}

      <main className="mx-auto w-full max-w-4xl px-5 pt-6 pb-20 text-center sm:pt-12">
        <div className="fade-in inline-flex items-center gap-2.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-1)] px-4 py-1.5 text-sm text-[var(--color-text-muted)]">
          <span className="relative flex h-2.5 w-2.5">
            {online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
          </span>
          {label}
          {online && data?.latency != null && (
            <span className="flex items-center gap-1.5 border-l border-[var(--color-line)] pl-2.5">
              <SignalIcon width={14} height={14} />
              {data.latency} ms
            </span>
          )}
        </div>

        <h1 className="text-grad fade-in mt-6">Lavalink node</h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--color-text-muted)]">Live status of the node that powers Stains music.</p>

        {data && !online && (
          <div className="card mx-auto mt-10 max-w-xl rounded-2xl p-6 text-left">
            <h3 className="text-lg font-semibold">The node did not answer</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{data.error ?? "No response."}</p>
          </div>
        )}

        {stats && info && (
          <div className="fade-in mt-12">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat icon={<UsersIcon width={18} height={18} />} label="Players" value={`${stats.playingPlayers} / ${stats.players}`} />
              <Stat icon={<ClockIcon width={18} height={18} />} label="Uptime" value={uptime(stats.uptime)} />
              <Stat icon={<CpuIcon width={18} height={18} />} label="CPU" value={pct(stats.cpu.lavalinkLoad)} bar={stats.cpu.lavalinkLoad} />
              <Stat
                icon={<MemoryIcon width={18} height={18} />}
                label="Memory"
                value={bytes(stats.memory.used)}
                bar={stats.memory.allocated > 0 ? stats.memory.used / stats.memory.allocated : 0}
              />
            </div>

            {data?.players && <NowPlaying players={data.players} />}

            <p className="mt-8 text-sm text-[var(--color-text-muted)]">Lavalink {info.version.semver}</p>
          </div>
        )}
      </main>
    </>
  );
}
