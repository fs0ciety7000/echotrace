import { cx } from '../../ui/cx.ts';

/** Three segments: encountered · studied · quiz passed. */
export function MasteryMeter({ value, className }: { value: number; className?: string }) {
  const labels = ['rencontrée', 'étudiée', 'validée'];
  return (
    <span
      role="img"
      className={cx('inline-flex gap-0.5', className)}
      title={`Maîtrise ${value}/3`}
      aria-label={`Maîtrise ${value} sur 3`}
    >
      {labels.map((l, i) => (
        <span
          key={l}
          className={cx('h-1 w-3 rounded-full', i < value ? 'bg-(image:--gradient-echo)' : 'bg-line-strong')}
        />
      ))}
    </span>
  );
}
