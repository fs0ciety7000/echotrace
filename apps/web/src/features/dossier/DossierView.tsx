import '@xyflow/react/dist/base.css';
import { type DossierItem, dossierProgressOf, type ProposeResult, solidity, unlockedItems } from '@echotrace/engine';
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from '@xyflow/react';
import { Boxes, Building2, FileText, Server, User, Users, Zap } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { dossier as spec } from '../../content/index.ts';
import { useGame } from '../../state/game.ts';
import { Button } from '../../ui/Button.tsx';
import { cx } from '../../ui/cx.ts';
import { Panel } from '../../ui/Panel.tsx';

const TYPE: Record<DossierItem['type'], { label: string; icon: ReactNode; column: number }> = {
  personne: { label: 'Personne', icon: <User size={13} />, column: 0 },
  groupe: { label: 'Groupe', icon: <Users size={13} />, column: 0 },
  organisation: { label: 'Organisation', icon: <Building2 size={13} />, column: 1 },
  infrastructure: { label: 'Infrastructure', icon: <Server size={13} />, column: 2 },
  artefact: { label: 'Artefact', icon: <FileText size={13} />, column: 3 },
  evenement: { label: 'Événement', icon: <Zap size={13} />, column: 3 },
};

type PieceData = { item: DossierItem; pick: 'a' | 'b' | null; linked: boolean };
type PieceNode = Node<PieceData, 'piece'>;

// Links are drawn centre to centre (straight), so pieces in the same column connect cleanly.
const handle = '!top-1/2 !left-1/2 !size-px !min-h-0 !min-w-0 !-translate-x-1/2 !-translate-y-1/2 !border-0 !opacity-0';

function Piece({ data }: NodeProps<PieceNode>) {
  const { item, pick, linked } = data;
  return (
    <div
      className={cx(
        'w-[190px] rounded-md border bg-raised px-3 py-2 shadow-inset transition-colors',
        pick
          ? 'border-echo bg-overlay shadow-[0_0_0_3px_var(--color-echo-soft)]'
          : linked
            ? 'border-echo-line'
            : 'border-line-strong',
      )}
    >
      <Handle type="target" position={Position.Left} className={handle} />
      <div className="flex items-center gap-1.5 text-fg-subtle">
        {TYPE[item.type].icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{TYPE[item.type].label}</span>
        {pick && <span className="ml-auto font-mono text-[10px] text-echo-strong">{pick.toUpperCase()}</span>}
      </div>
      <div className="mt-1 text-sm leading-tight text-fg">{item.label}</div>
      <Handle type="source" position={Position.Right} className={handle} />
    </div>
  );
}

const nodeTypes = { piece: Piece };

const FEEDBACK: Record<Exclude<ProposeResult, { ok: true }>['reason'], string> = {
  unknown: 'Pièce indisponible.',
  same: 'Choisis deux pièces différentes.',
  relation: 'Relation inconnue.',
  unsupported: 'Rien dans tes preuves n’établit ce lien. Une intuition n’est pas une preuve.',
};

export function DossierView() {
  const engine = useGame((s) => s.engine);
  const rev = useGame((s) => s.rev);
  const linkDossier = useGame((s) => s.linkDossier);
  const [a, setA] = useState<string>('');
  const [b, setB] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; evidence?: string } | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: engine state is mutable; rev signals changes
  const model = useMemo(() => {
    if (!engine) return null;
    const ctx = engine.dossierContext();
    const progress = dossierProgressOf(engine.campaign);
    const items = unlockedItems(spec, ctx);
    const confirmed = spec.links.filter((l) => progress.links.includes(l.id));
    return { items, confirmed, solidity: solidity(spec, progress, ctx) };
  }, [engine, rev]);
  if (!engine || !model) return null;

  const linkedIds = new Set(model.confirmed.flatMap((l) => [l.from, l.to]));
  const perColumn = [0, 0, 0, 0];
  const nodes: PieceNode[] = model.items.map((item) => {
    const col = TYPE[item.type].column;
    const row = perColumn[col] ?? 0;
    perColumn[col] = row + 1;
    return {
      id: item.id,
      type: 'piece',
      position: { x: col * 260, y: row * 92 },
      data: { item, pick: item.id === a ? 'a' : item.id === b ? 'b' : null, linked: linkedIds.has(item.id) },
    };
  });
  const edges: Edge[] = model.confirmed.map((l) => ({
    id: l.id,
    source: l.from,
    target: l.to,
    type: 'straight',
    label: l.relation,
    labelStyle: { fill: 'var(--color-fg-muted)', fontSize: 11 },
    labelBgStyle: { fill: 'var(--color-surface)' },
    style: {
      stroke: l.admissible ? 'var(--color-echo)' : 'var(--color-warn)',
      strokeWidth: 1.5,
      ...(l.admissible ? {} : { strokeDasharray: '4 4' }),
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: l.admissible ? 'var(--color-echo)' : 'var(--color-warn)' },
  }));

  const pickNode = (id: string) => {
    setFeedback(null);
    if (!a || (a && b)) {
      setA(id);
      setB('');
    } else if (id !== a) setB(id);
  };

  const submit = () => {
    const r = linkDossier(a, b, relation);
    if (!r) return;
    if (r.ok) {
      setFeedback({ ok: true, text: r.already ? 'Lien déjà établi.' : 'Lien établi.', evidence: r.link.evidence });
      setA('');
      setB('');
      setRelation('');
    } else setFeedback({ ok: false, text: FEEDBACK[r.reason] });
  };

  const s = model.solidity;
  const label = (id: string) => model.items.find((i) => i.id === id)?.label ?? '—';

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_340px]">
      <Panel
        eyebrow="Dossier"
        title={<span className="text-xs font-normal text-fg-subtle">clique deux pièces pour proposer un lien</span>}
        className="min-h-0"
      >
        <div className="h-full min-h-[320px]" style={{ background: 'var(--color-deep)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => pickNode(n.id)}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.35}
            maxZoom={1.6}
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
            className="[--xy-background-color:transparent]"
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--color-line-strong)" />
            <Controls
              showInteractive={false}
              className="!shadow-none [&>button]:!border-line [&>button]:!bg-raised [&>button]:!fill-fg-muted"
            />
          </ReactFlow>
        </div>
      </Panel>

      <div className="flex min-h-0 flex-col gap-3">
        <Panel eyebrow="Solidité du dossier">
          <div className="px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl text-fg tabular">{s.score} %</span>
              <span className="text-xs text-fg-subtle">
                {s.confirmed}/{s.available} liens établis
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line-strong">
              <div className="h-full rounded-full bg-(image:--gradient-echo)" style={{ width: `${s.score}%` }} />
            </div>
            <p className="mt-2 text-xs text-fg-subtle">
              Part des liens établis par des moyens recevables.
              {s.inadmissible > 0 && <span className="text-warn"> {s.inadmissible} lien(s) non recevable(s).</span>}
            </p>
          </div>
        </Panel>

        <Panel eyebrow="Relier deux pièces">
          <div className="flex flex-col gap-2 px-4 py-3 text-sm">
            {(['A', 'B'] as const).map((slot) => {
              const value = slot === 'A' ? a : b;
              const setter = slot === 'A' ? setA : setB;
              return (
                <label key={slot} className="flex items-center gap-2">
                  <span className="w-4 font-mono text-xs text-echo-strong">{slot}</span>
                  <select
                    value={value}
                    onChange={(e) => {
                      setter(e.target.value);
                      setFeedback(null);
                    }}
                    className="h-8 flex-1 rounded-sm border border-line-strong bg-raised px-2 text-fg"
                  >
                    <option value="">— pièce —</option>
                    {model.items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              aria-label="Relation"
              className="h-8 rounded-sm border border-line-strong bg-raised px-2 text-fg"
            >
              <option value="">— relation —</option>
              {spec.relations.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm" disabled={!a || !b || !relation} onClick={submit}>
              Proposer le lien
            </Button>
            {a && b && (
              <p className="text-xs text-fg-subtle">
                {label(a)} — {relation || '…'} → {label(b)}
              </p>
            )}
            {feedback && (
              <div
                role="status"
                className={cx(
                  'rounded-sm border px-3 py-2 text-xs',
                  feedback.ok ? 'border-echo-line bg-echo-soft text-fg' : 'border-warn-line bg-warn-soft text-fg',
                )}
              >
                <p className="font-medium">{feedback.text}</p>
                {feedback.evidence && <p className="mt-1 text-fg-muted">Preuve : {feedback.evidence}</p>}
              </div>
            )}
          </div>
        </Panel>

        <Panel eyebrow="Liens établis" className="min-h-0 flex-1" bodyClassName="overflow-y-auto">
          {model.confirmed.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-3 text-xs text-fg-subtle">
              <Boxes size={14} /> Aucun lien pour l’instant.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 px-4 py-3">
              {model.confirmed.map((l) => (
                <li
                  key={l.id}
                  className={cx('border-l-2 pl-3', l.admissible ? 'border-echo-line' : 'border-warn-line')}
                >
                  <p className="text-xs text-fg">
                    {label(l.from)} — <span className="text-echo-strong">{l.relation}</span> → {label(l.to)}
                  </p>
                  <p className="text-[11px] text-fg-subtle">{l.evidence}</p>
                  {!l.admissible && <p className="text-[11px] text-warn">non recevable</p>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
