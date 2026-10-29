"use client"

import * as React from "react"

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Lightweight popover replacement to avoid heavy Radix dependency.
const PopoverContext = React.createContext<PopoverContextType | null>(null)

function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>
}

function PopoverTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) return null
  return (
    <button onClick={() => ctx.setOpen(!ctx.open)} className="inline-flex items-center">
      {children}
    </button>
  )
}

function PopoverContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) return null
  if (!ctx.open) return null
  return (
    <div className="absolute z-50 mt-2 w-64 rounded-md border border-white/10 bg-zinc-950/95 p-3 text-zinc-100 shadow-lg">
      {children}
    </div>
  )
}

export { Popover, PopoverTrigger, PopoverContent }