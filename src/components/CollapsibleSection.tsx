"use client"

import { type ReactNode, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Props {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export default function CollapsibleSection({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="w-full shadow-lg border-brand-border mb-6">
      <div
        className="bg-brand-bg border-b border-brand-border flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-2xl font-bold text-brand-primary">{title}</h2>
        {open ? (
          <ChevronUp className="w-5 h-5 text-brand-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-brand-primary" />
        )}
      </div>

      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  )
}
