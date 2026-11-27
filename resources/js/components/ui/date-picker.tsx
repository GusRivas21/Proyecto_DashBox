import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    DateInput,
    DatePicker as AriaDatePicker,
    DateSegment,
    Dialog,
    FieldError,
    Group,
    Heading,
    I18nProvider,
    Label,
    Popover,
} from 'react-aria-components';

type DatePickerProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    error?: string;
};

const calendarButton =
    'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const footerButton = 'rounded-md px-2.5 py-1.5 text-sm font-medium outline-hidden hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring';

export function DatePicker({ label, value, onChange, invalid, error }: DatePickerProps) {
    return (
        <I18nProvider locale="es-SV">
            <AriaDatePicker
                className="grid gap-1.5"
                isInvalid={invalid || Boolean(error)}
                onChange={(selected) => onChange(selected?.toString() ?? '')}
                shouldForceLeadingZeros
                value={value ? parseDate(value) : null}
            >
                <Label className="text-xs font-medium">{label}</Label>
                <Group className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background data-[invalid]:border-destructive">
                    <DateInput className="flex items-center text-base tabular-nums md:text-sm">
                        {(segment) => (
                            <DateSegment
                                segment={segment}
                                className="rounded-sm outline-hidden focus:bg-brand focus:text-white data-[placeholder]:text-muted-foreground data-[placeholder]:focus:text-white"
                            />
                        )}
                    </DateInput>
                    <Button aria-label={`Abrir calendario: ${label.toLowerCase()}`} className={`${calendarButton} -mr-2`}>
                        <CalendarDays aria-hidden="true" className="size-4" />
                    </Button>
                </Group>

                <Popover placement="bottom start" offset={6} className="z-50 max-w-[calc(100vw-1rem)] rounded-xl border bg-popover text-popover-foreground shadow-lg">
                    <Dialog className="p-3 outline-hidden">
                        {({ close }) => (
                            <>
                                <Calendar className="w-fit max-w-full">
                                    <header className="mb-2 flex items-center justify-between gap-2">
                                        <Button slot="previous" className={calendarButton}>
                                            <ChevronLeft aria-hidden="true" className="size-4" />
                                        </Button>
                                        <Heading className="text-center text-sm font-semibold first-letter:uppercase" />
                                        <Button slot="next" className={calendarButton}>
                                            <ChevronRight aria-hidden="true" className="size-4" />
                                        </Button>
                                    </header>
                                    <CalendarGrid className="border-separate border-spacing-[2px] text-center [&_th]:pb-1 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground">
                                        {(cellDate) => (
                                            <CalendarCell
                                                date={cellDate}
                                                className="grid size-8 cursor-pointer place-items-center rounded-md border border-transparent text-sm tabular-nums outline-hidden hover:bg-accent data-[outside-month]:text-muted-foreground data-[today]:border-brand data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[selected]:bg-brand data-[selected]:text-white"
                                            />
                                        )}
                                    </CalendarGrid>
                                </Calendar>
                                <div className="mt-2 flex justify-between gap-2 border-t pt-2">
                                    <Button
                                        className={`${footerButton} text-muted-foreground disabled:opacity-50`}
                                        isDisabled={!value}
                                        onPress={() => {
                                            onChange('');
                                            close();
                                        }}
                                    >
                                        Limpiar
                                    </Button>
                                    <Button
                                        className={`${footerButton} text-brand dark:text-brand-light`}
                                        onPress={() => {
                                            onChange(today(getLocalTimeZone()).toString());
                                            close();
                                        }}
                                    >
                                        Hoy
                                    </Button>
                                </div>
                            </>
                        )}
                    </Dialog>
                </Popover>
                {error && <FieldError className="text-sm text-red-600 dark:text-red-400">{error}</FieldError>}
            </AriaDatePicker>
        </I18nProvider>
    );
}
