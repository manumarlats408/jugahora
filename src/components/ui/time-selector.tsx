// components/ui/time-selector.tsx
"use client"
import React from "react"

interface TimeSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
}

export function TimeSelector({ id, value, onChange }: TimeSelectorProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]

  const [hour, minute] = value.split(":").length === 2 ? value.split(":") : ["", ""]

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <div className="col-span-3 flex space-x-2">
        <select
          id={`${id}-hour`}
          value={hour}
          onChange={(e) => onChange(`${e.target.value}:${minute || "00"}`)}
          className="border rounded px-2 py-1"
        >
          <option value="">Hora</option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-gray-500 self-center">:</span>
        <select
          id={`${id}-minute`}
          value={minute}
          onChange={(e) => onChange(`${hour || "00"}:${e.target.value}`)}
          className="border rounded px-2 py-1"
        >
          <option value="">Min</option>
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
