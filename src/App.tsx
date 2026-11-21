import type { ReactNode } from "react";
import { useNode } from "./useNode";
import { bytes, clock, date, pct, uptime } from "./format";
import { ClockIcon, CpuIcon, MemoryIcon, SignalIcon, UsersIcon } from "./icons";
import type { LavalinkInfo, LavalinkStats, PlayerRow } from "./types";
import { resolveSources } from "./sources";

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
      <div className="bg-grad h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

function Stat({ icon, label, value, sub, bar }: { icon: ReactNode; label: string; value: string; sub?: string; bar?: number }) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center gap-3 text-[var(--color-accent-soft)]">
        <span className="icon-tile !h-10 !w-10 !rounded-xl">{icon}</span>
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
      {bar !== undefined && <div className="mt-3"><Bar value={bar} /></div>}
      {sub && <div className="mt-2 text-sm text-[var(--color-text-muted)]">{sub}</div>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-[var(--color-line)] py-2.5 last:border-0">
      <dt className="text-sm text-[var(--color-text-muted)]">{k}</dt>
      <dd className="text-right text-sm break-all">{v}</dd>
    </div>
  );
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-[var(--color-text-muted)]">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((i) => (
        <li key={i} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-1.5 text-sm">
          {i}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="card rounded-2xl p-6">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {note && <p className="mt-1 mb-4 text-sm text-[var(--color-text-muted)]">{note}</p>}
      {!note && <div className="mb-4" />}
      {children}
    </section>
  );
}

function Sources({ enabled }: { enabled: string[] }) {
  const { popular, other } = resolveSources(enabled);
  const count = popular.filter((s) => s.enabled).length;
  return (
    <Section
      title="Supported sources"
      note={`${count} of ${popular.length} common sources are enabled. Use the search prefix in front of a query, or paste a link.`}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {popular.map((s) => (
          <li
            key={s.id}
            className={`rounded-xl border p-4 ${s.enabled ? "border-[color-mix(in_srgb,var(--color-brand)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-brand)_10%,transparent)]" : "border-[var(--color-line)] opacity-50"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{s.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <span className={`h-2 w-2 rounded-full ${s.enabled ? "bg-emerald-400" : "bg-zinc-500"}`} aria-hidden />
                {s.enabled ? "Enabled" : "Not enabled"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{s.note}</p>
            {s.prefix && s.enabled && (
              <code className="mt-2 inline-block rounded-md bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-accent-soft)]">{s.prefix}</code>
            )}
          </li>
        ))}
      </ul>
      {other.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm text-[var(--color-text-muted)]">Also enabled</p>
          <Chips items={other} empty="" />
        </div>
      )}
    </Section>
  );
}

function Cpu({ stats }: { stats: LavalinkStats }) {
  return (
    <Stat
      icon={<CpuIcon />}
      label="Lavalink CPU"
      value={pct(stats.cpu.lavalinkLoad)}
      bar={stats.cpu.lavalinkLoad}
      sub={`System ${pct(stats.cpu.systemLoad)} on ${stats.cpu.cores} cores`}
    />
  );
}

function Memory({ stats }: { stats: LavalinkStats }) {
  return (
    <Stat
      icon={<MemoryIcon />}
      label="Memory used"
      value={bytes(stats.memory.used)}
      bar={stats.memory.used / stats.memory.allocated}
      sub={`${bytes(stats.memory.allocated)} allocated, ${bytes(stats.memory.reservable)} max`}
    />
  );
}

function Runtime({ info }: { info: LavalinkInfo }) {
  const v = info.version;
  return (
    <Section title="Runtime">
      <dl>
        <Row k="Lavalink" v={v.semver} />
        <Row k="Built" v={date(info.buildTime)} />
        <Row k="Git" v={`${info.git.branch} @ ${info.git.commit.slice(0, 7)}`} />
        <Row k="JVM" v={info.jvm} />
        <Row k="Lavaplayer" v={info.lavaplayer} />
      </dl>
    </Section>
  );
}

function Frames({ stats }: { stats: LavalinkStats }) {
  const f = stats.frameStats;
  return (
    <Section title="Audio frames" note="Per minute, averaged by Lavalink. Only reported while audio is playing.">
      {f ? (
        <dl>
          <Row k="Sent" v={f.sent.toLocaleString()} />
          <Row k="Nulled" v={f.nulled.toLocaleString()} />
          <Row k="Deficit" v={f.deficit.toLocaleString()} />
        </dl>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">Nothing playing right now, so there are no frame stats.</p>
      )}
    </Section>
  );
}

function Connections({ stats, players }: { stats: LavalinkStats; players: PlayerRow[] | null }) {
  return (
    <Section
      title="Connections"
      note={`${stats.players} connected voice ${stats.players === 1 ? "player" : "players"}, ${stats.playingPlayers} playing.`}
    >
      {players === null ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Set LAVALINK_SESSION_ID on the server to list each player here.
        </p>
      ) : players.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No active players on this session.</p>
      ) : (
        <ul className="divide-y divide-[var(--color-line)]">
          {players.map((p) => (
            <li key={p.guildId} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.title ?? "Idle"}</div>
                <div className="truncate text-sm text-[var(--color-text-muted)]">
                  {p.author ?? "No track loaded"}
                  {p.title && !p.isStream ? `, ${clock(p.position)} / ${clock(p.length)}` : ""}
                  {p.isStream ? ", live" : ""}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span>Guild ...{p.guildId.slice(-4)}</span>
                <span>{p.paused ? "Paused" : "Playing"}</span>
                <span>{p.connected ? `${p.ping} ms` : "Not connected"}</span>
                <span>Vol {p.volume}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export default function App() {
  const { data, failed } = useNode();
  const online = data?.online === true;
  const stats = data?.stats ?? null;
  const info = data?.info ?? null;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <header className="fade-in">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <span
            className={`h-2.5 w-2.5 rounded-full ${data === null ? "bg-zinc-500" : online ? "bg-emerald-400" : "bg-red-400"}`}
            aria-hidden
          />
          <span>
            {data === null ? (failed ? "Could not reach the status api" : "Checking node") : online ? "Node online" : "Node offline"}
          </span>
          {online && data?.latency != null && (
            <span className="flex items-center gap-1.5 pl-3">
              <SignalIcon width={14} height={14} />
              {data.latency} ms
            </span>
          )}
        </div>
        <h1 className="text-grad mt-4">Lavalink node</h1>
        <p className="mt-4 max-w-xl text-[var(--color-text-muted)]">
          Live stats, runtime details and active voice connections for the node that powers Stains music. Updates every 5 seconds.
        </p>
      </header>

      {data && !online && (
        <div className="card mt-10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold">The node did not answer</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {data.error ?? "No response."} Check that Lavalink is running and that LAVALINK_URL and LAVALINK_PASSWORD are set on the server.
          </p>
        </div>
      )}

      {stats && info && (
        <div className="mt-10 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<UsersIcon />} label="Players" value={`${stats.playingPlayers} / ${stats.players}`} sub="Playing / connected" />
            <Stat icon={<ClockIcon />} label="Uptime" value={uptime(stats.uptime)} sub={`Lavalink ${info.version.semver}`} />
            <Cpu stats={stats} />
            <Memory stats={stats} />
          </div>

          <Connections stats={stats} players={data?.players ?? null} />

          <div className="grid gap-4 md:grid-cols-2">
            <Runtime info={info} />
            <Frames stats={stats} />
          </div>

          <Sources enabled={info.sourceManagers} />

          <Section title="Filters" note="Audio filters the node supports.">
            <Chips items={info.filters} empty="None enabled." />
          </Section>

          <Section title="Plugins" note="Loaded on the node, with versions.">
            <Chips items={info.plugins.map((p) => `${p.name} ${p.version}`)} empty="No plugins loaded." />
          </Section>
        </div>
      )}
    </main>
  );
}
