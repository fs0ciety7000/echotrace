import '@xyflow/react/dist/base.css';
import type { Engine, Host } from '@echotrace/engine';
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from '@xyflow/react';
import { Monitor, Network as NetworkIcon, Server } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGame } from '../../state/game.ts';
import { Button } from '../../ui/Button.tsx';
import { cx } from '../../ui/cx.ts';
import { Panel } from '../../ui/Panel.tsx';

type HostState = 'home' | 'current' | 'accessed' | 'discovered';

type HostNodeData = { host: Host; state: HostState; ports: number[] };
type NetNodeData = { label: string; cidr: string };
type HostNodeT = Node<HostNodeData, 'host'>;
type NetNodeT = Node<NetNodeData, 'net'>;

const BORDER: Record<HostState, string> = {
  home: 'border-trace-line',
  current: 'border-signal shadow-[0_0_0_3px_var(--color-signal-soft)]',
  accessed: 'border-echo-line',
  discovered: 'border-signal-line',
};

const handle = '!size-1.5 !min-h-0 !min-w-0 !border-0 !bg-line-strong';

function HostNode({ data, selected }: NodeProps<HostNodeT>) {
  const { host, state, ports } = data;
  const Icon = state === 'home' ? Monitor : Server;
  return (
    <div
      className={cx(
        'w-[200px] rounded-md border bg-raised px-3 py-2 shadow-inset transition-colors',
        BORDER[state],
        selected && 'bg-overlay',
      )}
    >
      <Handle type="target" position={Position.Left} className={handle} />
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className={state === 'accessed' ? 'text-echo' : state === 'home' ? 'text-trace' : 'text-signal'}
        />
        <span className="truncate font-mono text-xs text-fg">{host.hostname}</span>
      </div>
      <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-fg-subtle tabular">
        {host.ip}
        {ports.length > 0 && <span className="truncate text-fg-subtle">· {ports.join(' ')}</span>}
      </div>
      <Handle type="source" position={Position.Right} className={handle} />
    </div>
  );
}

function NetNode({ data }: NodeProps<NetNodeT>) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1.5">
      <Handle type="target" position={Position.Left} className={handle} />
      <NetworkIcon size={12} className="text-fg-subtle" />
      <span className="text-xs text-fg-muted">{data.label}</span>
      <span className="font-mono text-[10px] text-fg-subtle">{data.cidr}</span>
      <Handle type="source" position={Position.Right} className={handle} />
    </div>
  );
}

const nodeTypes = { host: HostNode, net: NetNode };

/**
 * Deterministic layout: the player's workstation on the left, one band per
 * network (hub + its discovered hosts). Hosts appear only once discovered.
 */
function layout(engine: Engine): { nodes: (HostNodeT | NetNodeT)[]; edges: Edge[] } {
  const { world, knowledge, session } = engine.state;
  const homeId = session.stack[0]?.hostId ?? session.hostId;
  const known = Object.values(world.hosts).filter((h) => knowledge[h.id]?.discovered || h.id === homeId);
  const home = world.hosts[homeId];
  const stateOf = (h: Host): HostState =>
    h.id === session.hostId
      ? 'current'
      : h.id === homeId
        ? 'home'
        : knowledge[h.id]?.accessed
          ? 'accessed'
          : 'discovered';

  const nodes: (HostNodeT | NetNodeT)[] = [];
  const edges: Edge[] = [];
  const placed = new Set<string>();
  const edgeStyle = { stroke: 'var(--color-line-strong)', strokeWidth: 1 };

  let y = 0;
  for (const net of Object.values(world.networks)) {
    const members = known.filter((h) => h.id !== homeId && h.networks.includes(net.id));
    if (members.length === 0) continue;
    const hubId = `net:${net.id}`;
    const toPlace = members.filter((h) => !placed.has(h.id));
    const rows = Math.max(1, toPlace.length);
    nodes.push({
      id: hubId,
      type: 'net',
      position: { x: 300, y: y + ((rows - 1) * 72) / 2 + 14 },
      data: { label: net.label ?? net.id, cidr: net.cidr },
    });
    if (home?.networks.includes(net.id))
      edges.push({ id: `e:home:${net.id}`, source: homeId, target: hubId, style: edgeStyle });
    toPlace.forEach((h, i) => {
      placed.add(h.id);
      nodes.push({
        id: h.id,
        type: 'host',
        position: { x: 600, y: y + i * 72 },
        data: { host: h, state: stateOf(h), ports: knowledge[h.id]?.ports ?? [] },
      });
    });
    for (const h of members) {
      const reached = session.hostId === h.id || knowledge[h.id]?.accessed;
      edges.push({
        id: `e:${net.id}:${h.id}`,
        source: hubId,
        target: h.id,
        animated: Boolean(reached),
        style: reached ? { stroke: 'var(--color-echo-line)', strokeWidth: 1.5 } : edgeStyle,
      });
    }
    y += rows * 72 + 48;
  }
  if (home) {
    nodes.push({
      id: home.id,
      type: 'host',
      position: { x: 0, y: Math.max(0, y / 2 - 60) },
      data: { host: home, state: stateOf(home), ports: [] },
    });
  }
  return { nodes, edges };
}

function Inspector({ engine, hostId }: { engine: Engine; hostId: string | null }) {
  const setDraft = useGame((s) => s.setDraft);
  const setView = useGame((s) => s.setView);
  const host = hostId ? engine.state.world.hosts[hostId] : undefined;
  if (!host) {
    return (
      <p className="p-4 text-sm text-fg-subtle">
        Sélectionne un hôte. Le réseau se dévoile au fil de tes découvertes : rien n'apparaît sans que tu l'aies trouvé.
      </p>
    );
  }
  const k = engine.state.knowledge[host.id];
  const ports = k?.ports ?? [];
  const services = host.services.filter((s) => ports.includes(s.port));
  const prepare = (cmd: string) => {
    setDraft(cmd);
    setView('terminal');
  };
  const actions: string[] = [`nmap -sV ${host.hostname}`];
  if (ports.includes(22)) actions.push(`ssh <compte>@${host.hostname}`);
  for (const s of services) {
    if (s.tls) actions.push(`cert ${host.hostname}${s.port === 443 ? '' : `:${s.port}`}`);
    if (s.http)
      actions.push(
        `curl -I ${s.tls || s.port === 443 ? 'https' : 'http'}://${host.hostname}${[80, 443].includes(s.port) ? '' : `:${s.port}`}`,
      );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <div className="font-mono text-sm text-fg">{host.hostname}</div>
        <div className="font-mono text-xs text-fg-subtle tabular">{host.ip}</div>
        {k?.accessed && <div className="mt-1 text-xs text-fg-muted">{host.os}</div>}
      </div>
      <div>
        <div className="eyebrow mb-1.5">Services observés</div>
        {services.length === 0 ? (
          <p className="text-xs text-fg-subtle">Aucun scan pour l'instant.</p>
        ) : (
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {services.map((s) => (
              <li key={`${s.port}/${s.proto}`} className="flex gap-2">
                <span className="w-16 text-fg">{`${s.port}/${s.proto}`}</span>
                <span className="text-signal">{s.name}</span>
                {k?.fingerprinted && (
                  <span className="truncate text-fg-muted">{[s.product, s.version].filter(Boolean).join(' ')}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <div className="eyebrow mb-1.5">Préparer dans le terminal</div>
        <div className="flex flex-col gap-1.5">
          {actions.map((a) => (
            <Button
              key={a}
              size="sm"
              variant="secondary"
              className="h-auto min-h-7 justify-start py-1.5 text-left font-mono break-all whitespace-normal"
              onClick={() => prepare(a)}
            >
              {a}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NetworkView() {
  const engine = useGame((s) => s.engine);
  const rev = useGame((s) => s.rev);
  const [selected, setSelected] = useState<string | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the engine is mutable; rev signals changes
  const graph = useMemo(() => (engine ? layout(engine) : { nodes: [], edges: [] }), [engine, rev]);
  if (!engine) return null;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_300px]">
      <Panel
        eyebrow="Vue réseau"
        title={<span className="text-xs font-normal text-fg-subtle">ce que tu as découvert</span>}
        className="min-h-0"
      >
        <div className="h-full min-h-[320px]" style={{ background: 'var(--color-deep)' }}>
          <ReactFlow
            nodes={graph.nodes.map((n) => ({ ...n, selected: n.id === selected }))}
            edges={graph.edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSelected(n.type === 'host' ? n.id : null)}
            onPaneClick={() => setSelected(null)}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
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
      <Panel eyebrow="Inspecteur" className="min-h-0" bodyClassName="overflow-y-auto">
        <Inspector engine={engine} hostId={selected} />
      </Panel>
    </div>
  );
}
