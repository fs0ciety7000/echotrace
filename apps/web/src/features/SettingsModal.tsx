import { play } from '../audio/sound.ts';
import { useGame } from '../state/game.ts';
import { useSettings } from '../state/settings.ts';
import { cx } from '../ui/cx.ts';
import { Modal } from '../ui/Modal.tsx';

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-md border border-line bg-raised/50 px-4 py-3 hover:border-line-strong">
      <span className="flex-1">
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="block text-xs text-fg-muted">{hint}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={cx(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-signal',
          checked ? 'border-signal-line bg-signal-soft' : 'border-line-strong bg-deep',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-3.5 rounded-full transition-all',
            checked ? 'left-[18px] bg-signal' : 'left-0.5 bg-fg-subtle',
          )}
        />
      </span>
    </label>
  );
}

export function SettingsModal() {
  const modal = useGame((s) => s.modal);
  const setModal = useGame((s) => s.setModal);
  const {
    legible,
    reducedMotion,
    sound,
    volume,
    keySounds,
    setLegible,
    setReducedMotion,
    setSound,
    setVolume,
    setKeySounds,
  } = useSettings();
  return (
    <Modal
      open={modal === 'settings'}
      onClose={() => setModal(null)}
      eyebrow="Poste opérateur"
      title="Paramètres"
      width="max-w-lg"
    >
      <div className="space-y-2">
        <Toggle
          label="Haute lisibilité"
          hint="Texte plus grand, contrastes renforcés, sans effets de verre. Idéal pour les longues sessions."
          checked={legible}
          onChange={setLegible}
        />
        <Toggle
          label="Mouvement réduit"
          hint="Désactive animations et clignotements. Suit aussi la préférence de ton système."
          checked={reducedMotion}
          onChange={setReducedMotion}
        />
      </div>

      <h3 className="eyebrow mt-6 mb-2">Son</h3>
      <div className="space-y-2">
        <Toggle
          label="Sons d'interface"
          hint="Brefs signaux pour les objectifs, messages, décisions et erreurs. Toujours accompagnés d'un message à l'écran."
          checked={sound}
          onChange={(v) => {
            setSound(v);
            if (v) play('objective');
          }}
        />
        <div className={cx('rounded-md border border-line bg-raised/50 px-4 py-3', !sound && 'opacity-50')}>
          <label htmlFor="settings-volume" className="flex items-center text-sm font-medium text-fg">
            Volume
            <span className="ml-auto font-mono text-xs text-fg-muted tabular">{volume} %</span>
          </label>
          <input
            id="settings-volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={volume}
            disabled={!sound}
            onChange={(e) => setVolume(Number(e.target.value))}
            onPointerUp={() => play('message')}
            onKeyUp={(e) => (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') && play('message')}
            className="mt-2 w-full accent-signal"
          />
        </div>
        <Toggle
          label="Frappe au clavier"
          hint="Un léger cliquetis à chaque touche dans le terminal."
          checked={keySounds}
          onChange={(v) => {
            setKeySounds(v);
            if (v) play('key');
          }}
        />
      </div>
      <p className="mt-5 text-xs text-fg-subtle">
        Sauvegarde automatique locale (IndexedDB). Rien ne quitte ton navigateur.
      </p>
    </Modal>
  );
}
