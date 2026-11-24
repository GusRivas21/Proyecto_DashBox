import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Option = {
    value: string;
    label: string;
    description: string;
    icon: LucideIcon;
    iconClass?: string;
};

export default function OptionPicker({
    label,
    options,
    value,
    onChange,
    invalid = false,
}: {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
}) {
    return (
        <div role="radiogroup" aria-label={label} className="grid gap-4 sm:grid-cols-3">
            {options.map((o) => {
                const Icon = o.icon;
                const selected = value === o.value;

                return (
                    <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(o.value)}
                        className={`relative flex h-28 flex-col items-center justify-center gap-1.5 rounded-lg border px-3 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                            selected
                                ? 'border-brand bg-brand/10 ring-1 ring-brand dark:border-brand-light dark:bg-brand-light/10 dark:ring-brand-light'
                                : invalid
                                  ? 'border-destructive/60 hover:bg-muted/50'
                                  : 'border-border hover:border-brand/40 hover:bg-muted/50 dark:hover:border-brand-light/40'
                        }`}
                    >
                        {selected && (
                            <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white dark:bg-brand-light dark:text-[#10242F]">
                                <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                        )}

                        <Icon
                            className={`${o.iconClass ?? 'h-6 w-6'} ${
                                selected ? 'text-brand dark:text-brand-light' : 'text-muted-foreground'
                            }`}
                        />

                        <span className="mt-1 text-sm font-medium">{o.label}</span>
                        <span className="text-xs text-muted-foreground">{o.description}</span>
                    </button>
                );
            })}
        </div>
    );
}