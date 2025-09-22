import {
  component$,
  type QwikIntrinsicElements,
  useSignal,
  useTask$,
  $,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addDays,
  type Locale,
} from "date-fns";

type CalendarProps = QwikIntrinsicElements["div"] & {
  value?: Date;
  onValueChange$?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  defaultMonth?: Date;
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  locale?: string;
};

export const Calendar = component$<CalendarProps>(
  ({
    value,
    onValueChange$,
    disabled,
    defaultMonth,
    showOutsideDays = true,
    fixedWeeks = false,
    locale = "en-US",
    class: className,
    ...props
  }) => {
    const selectedDate = useSignal(value || null);
    const currentMonth = useSignal(defaultMonth || new Date());

    useTask$(({ track }) => {
      track(() => value);
      if (value) {
        selectedDate.value = value;
      }
    });

    const navigateMonth = $((direction: "prev" | "next") => {
      if (direction === "prev") {
        currentMonth.value = subMonths(currentMonth.value, 1);
      } else {
        currentMonth.value = addMonths(currentMonth.value, 1);
      }
    });

    const selectDate = $((date: Date) => {
      if (disabled?.(date)) return;

      selectedDate.value = date;
      onValueChange$?.(date);
    });

    const getDaysInMonth = (month: Date) => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);

      const calendarStart = startOfWeek(start, { weekStartsOn: 0 });
      let calendarEnd = endOfWeek(end, { weekStartsOn: 0 });

      if (fixedWeeks) {
        // Ensure we show 6 weeks (42 days) for consistent layout
        calendarEnd = addDays(calendarStart, 41);
      }

      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    };

    const days = getDaysInMonth(currentMonth.value);
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
      <div class={cn("p-3", className)} {...props}>
        {/* Header */}
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick$={() => navigateMonth("prev")}
            class="h-7 w-7 rounded-md border p-0 opacity-50 hover:opacity-100"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 class="text-sm font-semibold">
            {format(currentMonth.value, "MMMM yyyy", { locale: locale as unknown as Locale })}
          </h2>

          <button
            type="button"
            onClick$={() => navigateMonth("next")}
            class="h-7 w-7 rounded-md border p-0 opacity-50 hover:opacity-100"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Week days header */}
        <div class="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              class="h-9 w-9 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div class="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth.value);
            const isSelected =
              selectedDate.value && isSameDay(day, selectedDate.value);
            const isTodayDate = isToday(day);
            const isDisabled = disabled?.(day) || false;
            const isPastDate =
              isBefore(day, new Date()) && !isSameDay(day, new Date());

            return (
              <button
                key={index}
                type="button"
                disabled={isDisabled}
                onClick$={() => selectDate(day)}
                class={cn(
                  "h-9 w-9 text-center text-sm relative flex items-center justify-center rounded-md transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "hover:bg-accent hover:text-accent-foreground",
                  {
                    "text-muted-foreground": !isCurrentMonth && showOutsideDays,
                    invisible: !isCurrentMonth && !showOutsideDays,
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground":
                      isSelected,
                    "bg-accent text-accent-foreground":
                      isTodayDate && !isSelected,
                    "text-muted-foreground opacity-50 cursor-not-allowed":
                      isDisabled || isPastDate,
                    "hover:bg-transparent hover:text-muted-foreground":
                      isPastDate,
                  }
                )}
              >
                {format(day, "d")}
                {isTodayDate && (
                  <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

type CalendarWithInputProps = CalendarProps & {
  placeholder?: string;
  dateFormat?: string;
};

export const CalendarWithInput = component$<CalendarWithInputProps>(
  ({ placeholder = "Pick a date", dateFormat = "PPP", ...calendarProps }) => {
    const showCalendar = useSignal(false);
    const inputRef = useSignal<HTMLInputElement>();

    const toggleCalendar = $(() => {
      showCalendar.value = !showCalendar.value;
    });

    const handleDateSelect = $((date: Date) => {
      calendarProps.onValueChange$?.(date);
      showCalendar.value = false;
    });

    const handleInputClick = $(() => {
      showCalendar.value = true;
    });

    const handleInputChange = $(() => {
      // For now, just close calendar on manual input
      showCalendar.value = false;
    });

    useTask$(({ track }) => {
      track(() => calendarProps.value);
      if (inputRef.value && calendarProps.value) {
        inputRef.value.value = format(calendarProps.value, dateFormat, {
          locale: calendarProps.locale as unknown as Locale,
        });
      }
    });

    return (
      <div class="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          readOnly
          onClick$={handleInputClick}
          onChange$={handleInputChange}
          class={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />

        <button
          type="button"
          onClick$={toggleCalendar}
          class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 hover:opacity-100"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {showCalendar.value && (
          <div class="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md">
            <Calendar
              {...calendarProps}
              onValueChange$={handleDateSelect}
              class="w-full"
            />
          </div>
        )}
      </div>
    );
  }
);
