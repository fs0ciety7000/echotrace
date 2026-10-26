import { mastery } from '@echotrace/engine';
import { BookOpen, LogOut, Mail, Network, Radar, Settings, SquareTerminal } from 'lucide-react';
import type { ReactNode } from 'react';
import { CATEGORY_TITLES, conceptById } from '../content/index.ts';
import { MasteryMeter } from '../features/journal/MasteryMeter.tsx';
import { ObjectivesList } from '../features/missions/ObjectivesPanel.tsx';
import { EchoTerm } from '../features/terminal/EchoTerm.tsx';
import { useGame } from '../state/game.ts';
import { StatusDot, type Tone } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { cx } from '../ui/cx.ts';
import { Logo } from '../ui/Logo.tsx';
import { Panel } from '../ui/Panel.tsx';

function RailButton({
  icon,
  label,
  active,
  disabled,
  onClick,
  badge = 0,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? `${label} — bientôt` : label}
      aria-label={badge ? `${label} (${badge} non lu${badge > 1 ? 's' : ''})` : label}
      className={cx(
        'relative flex size-10 items-center justify-center rounded-sm transition-colors duration-(--duration-fast)',
        active ? 'bg-raised text-signal' : 'text-fg-subtle hover:bg-raised hover:text-fg',
        'disabled:cursor-not-allowed disabled:text-fg-faint disabled:hover:bg-transparent',
      )}
    >
      {active && <span aria-hidden className="absolute inset-y-2 -left-2 w-0.5 rounded-full bg-signal" />}
      {icon}
      {badge > 0 && (
        <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-signal px-0.5 font-mono text-[9px] font-semibold text-void">
          {badge}
        </span>
      )}
    </button>
  );
}

function Rail() {
  const setModal = useGame((s) => s.setModal);
  const toMenu = useGame((s) => s.toMenu);
  const run = useGame((s) => s.run);
  const setComms = useGame((s) => s.setComms);
  const unread = useGame((s) => s.engine?.mission?.unreadCount() ?? 0);
  useGame((s) => s.rev);
  return (
    <nav aria-label="Outils" className="row-span-2 flex flex-col items-center gap-1 border-r border-line bg-void py-3">
      <div className="mb-3 flex h-8 items-center">
        <Logo />
      </div>
      <RailButton icon={<Radar size={18} />} label="Briefing" onClick={() => setModal('briefing')} />
      <RailButton icon={<SquareTerminal size={18} />} label="Terminal" active />
      <RailButton icon={<Network size={18} />} label="Vue réseau" disabled />
      <RailButton icon={<BookOpen size={18} />} label="Journal" onClick={() => run('journal')} />
      <RailButton icon={<Mail size={18} />} label="Messages" onClick={() => setComms(true)} badge={unread} />
      <div className="mt-auto flex flex-col gap-1">
        <RailButton icon={<Settings size={18} />} label="Paramètres" onClick={() => setModal('settings')} />
        <RailButton icon={<LogOut size={18} />} label="Menu principal" onClick={toMenu} />
      </div>
    </nav>
  );
}

const CONTACTS: { name: string; role: string; tone: Tone; status: string }[] = [
  { name: 'Noor Haddad', role: 'Forensique · Académie', tone: 'trace', status: 'en ligne' },
  { name: 'Mara Okonkwo-Lind', role: 'Coordination', tone: 'warn', status: 'en réunion' },
  { name: 'Iris Calder', role: 'ECHO-0', tone: 'neutral', status: 'hors ligne' },
];

function LeftColumn() {
  const engine = useGame((s) => s.engine);
  const setDraft = useGame((s) => s.setDraft);
  const setComms = useGame((s) => s.setComms);
  useGame((s) => s.rev);
  if (!engine) return null;
  const mission = engine.mission?.spec;
  const inbox = engine.mission?.inbox() ?? [];
  const hosts = Object.entries(engine.state.knowledge)
    .filter(([, k]) => k.discovered)
    .map(([id, k]) => ({ host: engine.state.world.hosts[id], k }))
    .filter((h) => h.host);

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <Panel eyebrow="Opération">
        <div className="px-4 py-3">
          <div className="text-lg font-medium text-fg">{mission?.title ?? '—'}</div>
          <p className="mt-1 text-xs text-fg-muted">{mission?.summary}</p>
        </div>
      </Panel>

      <Panel eyebrow="Comms">
        <ul className="px-2 py-2">
          {CONTACTS.map((c) => {
            const unread = inbox.filter((m) => m.from === c.name && !m.read).length;
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => setComms(true)}
                  className="flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left hover:bg-raised"
                >
                  <StatusDot tone={c.tone} pulse={c.tone === 'trace'} />
                  <span className="min-w-0 flex-1">
                    <span className={cx('block truncate text-sm', c.tone === 'neutral' ? 'text-fg-subtle' : 'text-fg')}>
                      {c.name}
                    </span>
                    <span className="block truncate text-xs text-fg-subtle">{c.role}</span>
                  </span>
                  {unread > 0 ? (
                    <span className="rounded-full bg-signal-soft px-1.5 font-mono text-[11px] text-signal-strong">
                      {unread}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-fg-subtle">{c.status}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel eyebrow="Réseau connu" className="min-h-0 flex-1" bodyClassName="overflow-y-auto">
        <ul className="px-2 py-2">
          {hosts.map(({ host, k }) => {
            if (!host) return null;
            const here = host.id === engine.state.session.hostId;
            const tone: Tone = k.accessed ? 'echo' : 'signal';
            return (
              <li key={host.id}>
                <button
                  type="button"
                  onClick={() => setDraft(here ? 'ifconfig' : `nmap -sV ${host.hostname}`)}
                  title={here ? 'Tu es ici' : `Préparer : nmap -sV ${host.hostname}`}
                  className="flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left hover:bg-raised"
                >
                  <StatusDot tone={tone} pulse={here} />
                  <span className="flex-1 truncate font-mono text-sm text-fg">{host.hostname}</span>
                  <span className="tabular font-mono text-xs text-fg-subtle">{host.ip}</span>
                </button>
                {k.ports.length > 0 && (
                  <div className="pb-1 pl-6 font-mono text-[11px] text-fg-subtle">ports {k.ports.join(' · ')}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function RightColumn() {
  const engine = useGame((s) => s.engine);
  const showConcept = useGame((s) => s.showConcept);
  const setModal = useGame((s) => s.setModal);
  useGame((s) => s.rev);
  if (!engine) return null;
  const recent = Object.entries(engine.journal)
    .filter(([id]) => conceptById.has(id))
    .sort(([, a], [, b]) => b.firstSeen - a.firstSeen)
    .slice(0, 6);
  const completed = engine.mission?.progress.status === 'completed';

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <Panel
        eyebrow="Objectifs"
        actions={
          completed && (
            <Button size="sm" variant="ghost" onClick={() => setModal('debrief')}>
              Débrief
            </Button>
          )
        }
      >
        <ObjectivesList />
      </Panel>
      <Panel eyebrow="Fiches récentes" className="min-h-0 flex-1" bodyClassName="overflow-y-auto">
        {recent.length === 0 ? (
          <p className="px-4 py-3 text-xs text-fg-subtle">Les concepts que tu croises apparaîtront ici.</p>
        ) : (
          <ul className="px-2 py-2">
            {recent.map(([id, entry]) => {
              const c = conceptById.get(id);
              if (!c) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => showConcept(id)}
                    className="group w-full rounded-sm px-2 py-2 text-left hover:bg-raised"
                  >
                    <span className="flex items-center gap-2">
                      <span className="eyebrow text-echo!">{CATEGORY_TITLES[c.category]}</span>
                      <MasteryMeter value={mastery(entry)} className="ml-auto" />
                    </span>
                    <span className="mt-0.5 block text-sm text-fg group-hover:text-echo-strong">{c.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Meter({ value, tone }: { value: number; tone: Tone }) {
  const color = {
    neutral: 'bg-fg-subtle',
    signal: 'bg-signal',
    trace: 'bg-trace',
    echo: 'bg-echo',
    warn: 'bg-warn',
    danger: 'bg-danger',
  }[tone];
  return (
    <span className="inline-block h-1 w-16 overflow-hidden rounded-full bg-line-strong">
      <span
        className={cx('block h-full rounded-full transition-[width] duration-(--duration-slow)', color)}
        style={{ width: `${Math.max(3, value)}%` }}
      />
    </span>
  );
}

function StatusBar() {
  const engine = useGame((s) => s.engine);
  const lastSavedAt = useGame((s) => s.lastSavedAt);
  useGame((s) => s.rev);
  if (!engine) return null;
  const { exposure, clock, session } = engine.state;
  const host = engine.host();
  const expTone: Tone = exposure >= 60 ? 'danger' : exposure >= 30 ? 'warn' : 'trace';
  const expLabel = exposure >= 60 ? 'élevée' : exposure >= 30 ? 'modérée' : 'faible';

  return (
    <footer className="col-span-3 flex h-7 items-center gap-5 border-t border-line bg-void px-4 font-mono text-[11px] text-fg-subtle">
      <span className="flex items-center gap-2">
        <StatusDot tone={session.stack.length ? 'echo' : 'trace'} pulse />
        <span className="text-fg-muted">{session.stack.length ? 'SESSION DISTANTE' : 'CONNECTÉ'}</span> {host.hostname}
      </span>
      <span className="flex items-center gap-2">
        EXPOSITION <Meter value={exposure} tone={expTone} />{' '}
        <span className={cx(expTone === 'danger' ? 'text-danger' : expTone === 'warn' ? 'text-warn' : 'text-trace')}>
          {expLabel}
        </span>
      </span>
      <span className="ml-auto hidden md:inline">
        {lastSavedAt ? `sauvegardé ${new Date(lastSavedAt).toLocaleTimeString('fr-FR')}` : 'non sauvegardé'}
      </span>
      <span className="tabular text-fg-muted">{new Date(clock).toISOString().slice(0, 19).replace('T', ' ')} UTC</span>
    </footer>
  );
}

export function Operator() {
  const engine = useGame((s) => s.engine);
  useGame((s) => s.rev);
  if (!engine) return null;
  const { user } = engine.state.session;

  return (
    <div className="grid h-full grid-cols-[56px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_28px] bg-void">
      <Rail />
      <main className="grid min-h-0 grid-cols-1 gap-3 p-3 lg:grid-cols-[260px_minmax(0,1fr)_320px] xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <div className="hidden min-h-0 lg:flex lg:flex-col">
          <LeftColumn />
        </div>
        <Panel
          eyebrow="Terminal"
          title={
            <span className="font-mono text-xs font-normal text-fg-muted">
              {user}@{engine.host().hostname}
            </span>
          }
          actions={<span className="font-mono text-[11px] text-fg-faint">Tab · ↑↓ · Ctrl+C · Ctrl+L</span>}
          className="min-h-0"
        >
          <EchoTerm />
        </Panel>
        <div className="hidden min-h-0 lg:flex lg:flex-col">
          <RightColumn />
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
