"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const customEsLocale = {
  ...es,
  options: {
    ...es.options,
    weekStartsOn: 1 as const,
  },
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={customEsLocale}
      className={cn("p-3", className)}
      classNames={{
        caption_label: "text-center text-sm font-medium text-gray-800",
        nav_button: "text-gray-500 hover:text-black",
        day_selected: "bg-brand-primary text-white hover:bg-brand-hover",
        day_today: "border border-brand-primary text-brand-primary font-bold",
        day_outside: "text-gray-400",
        ...classNames, // ⚠️ Esto deja intacto el layout nativo
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
