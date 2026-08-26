import { useEffect, useState, type ChangeEvent } from 'react'
import { DayPicker, type DropdownProps } from 'react-day-picker'
import { Popover } from 'radix-ui'
import { Calendar } from 'lucide-react'
import { format, parse, isValid, type Locale } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Select } from './Select'
import { cn } from '@/lib/utils'
import 'react-day-picker/dist/style.css'

const DEFAULT_FROM_YEAR = 1900
const DEFAULT_FUTURE_YEARS = 20

function CalendarDropdown({
  children,
  className,
  name,
  onChange,
  style,
  value,
  'aria-label': ariaLabel,
}: DropdownProps) {
  function handleValueChange(nextValue: string) {
    onChange?.({ target: { value: nextValue } } as ChangeEvent<HTMLSelectElement>)
  }

  return (
    <div className={className} style={style}>
      <Select
        name={name}
        ariaLabel={ariaLabel}
        className="rogym-date-picker__select"
        value={String(value ?? '')}
        onValueChange={handleValueChange}
      >
        {children}
      </Select>
    </div>
  )
}

export interface DatePickerInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  min?: string
  max?: string
  'aria-label'?: string
  required?: boolean
  className?: string
  error?: boolean | string
  locale?: Locale
  buttonAriaLabel?: string
}

function tryParseUserInput(text: string): Date | null {
  for (const fmt of ['dd/MM/yyyy', 'd/M/yyyy', 'dd-MM-yyyy', 'dd/MM/yy', 'yyyy-MM-dd', 'yyyy/MM/dd']) {
    const d = parse(text, fmt, new Date())
    if (isValid(d)) return d
  }
  return null
}

export function DatePickerInput({
  id,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  disabled = false,
  min,
  max,
  'aria-label': ariaLabel,
  required = false,
  className,
  error,
  locale = vi,
  buttonAriaLabel = 'Open calendar',
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inputText, setInputText] = useState('')

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const validSelected = selected && isValid(selected) ? selected : undefined

  const parsedMin = min ? parse(min, 'yyyy-MM-dd', new Date()) : undefined
  const parsedMax = max ? parse(max, 'yyyy-MM-dd', new Date()) : undefined
  const fromDate = parsedMin && isValid(parsedMin) ? parsedMin : undefined
  const toDate = parsedMax && isValid(parsedMax) ? parsedMax : undefined
  const currentYear = new Date().getFullYear()
  const calendarFromDate = fromDate ?? new Date(DEFAULT_FROM_YEAR, 0, 1)
  const calendarToDate =
    toDate ??
    new Date(
      fromDate
        ? Math.max(
            currentYear + DEFAULT_FUTURE_YEARS,
            fromDate.getFullYear() + DEFAULT_FUTURE_YEARS
          )
        : currentYear + DEFAULT_FUTURE_YEARS,
      11,
      31
    )

  // Sync display text from external value when not actively typing
  useEffect(() => {
    if (!focused) {
      setInputText(validSelected ? format(validSelected, 'dd/MM/yyyy') : '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function handleSelect(date: Date | undefined) {
    if (!date) return
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setInputText(text)

    if (text === '') {
      onChange('')
      return
    }

    const parsed = tryParseUserInput(text)
    if (parsed) {
      onChange(format(parsed, 'yyyy-MM-dd'))
    }
  }

  function handleFocus() {
    setFocused(true)
    setOpen(true)
  }

  function handleBlur() {
    setFocused(false)
    setInputText(validSelected ? format(validSelected, 'dd/MM/yyyy') : '')
  }

  const displayText = focused ? inputText : (validSelected ? format(validSelected, 'dd/MM/yyyy') : '')

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Anchor asChild>
        <div className={cn('relative', className)}>
          <input
            id={id}
            type="text"
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-invalid={!!error}
            value={displayText}
            onChange={handleTextChange}
            onFocus={handleFocus}
            onClick={() => setOpen(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              'rogym-input pr-10',
              !displayText && 'placeholder:text-white/20',
              error && 'border-red-500/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/30'
            )}
          />
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rogym-text-muted hover:text-white transition-colors"
            aria-label={buttonAriaLabel}
          >
            <Calendar size={16} className="shrink-0" />
          </button>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="rogym-date-picker__popover rogym-date-picker__popover--compact"
        >
          <DayPicker
            mode="single"
            selected={validSelected}
            onSelect={handleSelect}
            locale={locale}
            fromDate={calendarFromDate}
            toDate={calendarToDate}
            captionLayout="dropdown"
            components={{ Dropdown: CalendarDropdown }}
            formatters={{
              formatMonthCaption: (date: Date) => `Tháng ${date.getMonth() + 1}`,
            }}
            showOutsideDays
            classNames={{
              root: 'rdp rogym-date-picker w-full',
              months: 'flex flex-col w-full',
              month: 'space-y-2 w-full',
              caption: 'rogym-date-picker__caption',
              caption_dropdowns: 'rogym-date-picker__caption-dropdowns',
              caption_label: 'rogym-date-picker__caption-label',
              dropdown_month: 'rogym-date-picker__dropdown is-month',
              dropdown_year: 'rogym-date-picker__dropdown is-year',
              table: 'w-full border-collapse',
              head_row: 'grid grid-cols-7 w-full mb-1',
              head_cell: 'rogym-text-muted w-full text-center text-xs font-semibold py-1',
              row: 'grid grid-cols-7 w-full mt-1',
              cell: 'w-full text-center text-sm relative p-0 flex items-center justify-center',
              day: cn(
                'h-8 w-8 p-0 font-medium rounded-xl flex items-center justify-center',
                'text-[var(--rogym-text-secondary)]',
                'hover:bg-[var(--rogym-green)] hover:text-[var(--rogym-green-dark)] hover:font-bold',
                'transition-colors'
              ),
              day_selected: cn(
                'bg-[var(--rogym-green)] text-[var(--rogym-green-dark)] font-bold shadow-[var(--rogym-shadow-tone-sm)]',
                'hover:bg-[var(--rogym-green-hover)] hover:text-[var(--rogym-green-dark)]'
              ),
              day_today: 'border border-[var(--rogym-teal)] text-[var(--rogym-teal)] font-semibold',
              day_outside: 'text-white/20',
              day_disabled: 'text-white/15 cursor-not-allowed',
              day_hidden: 'invisible',
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
