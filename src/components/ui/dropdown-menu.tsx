"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface DropdownMenuContentProps {
  align?: "start" | "end" | "center"
  sideOffset?: number
  className?: string
  children: React.ReactNode
}

interface DropdownMenuItemProps {
  className?: string
  inset?: boolean
  children: React.ReactNode
  onClick?: () => void
}

type DropdownContextType = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  registerTriggerElement: (element: HTMLElement | null) => void
  registerContentElement: (element: HTMLElement | null) => void
}

const DropdownMenuContext = React.createContext<DropdownContextType>({
  isOpen: false,
  setIsOpen: () => {},
  registerTriggerElement: () => {},
  registerContentElement: () => {},
})

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerElementRef = useRef<HTMLElement | null>(null)
  const contentElementRef = useRef<HTMLElement | null>(null)

  const registerTriggerElement = (element: HTMLElement | null) => {
    triggerElementRef.current = element
  }

  const registerContentElement = (element: HTMLElement | null) => {
    contentElementRef.current = element
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerElementRef.current &&
        contentElementRef.current &&
        !triggerElementRef.current.contains(event.target as Node) &&
        !contentElementRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <DropdownMenuContext.Provider
      value={{
        isOpen,
        setIsOpen,
        registerTriggerElement,
        registerContentElement,
      }}
    >
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild = false }) => {
  const { isOpen, setIsOpen, registerTriggerElement } = React.useContext(DropdownMenuContext)
  const triggerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (asChild && triggerRef.current) {
      registerTriggerElement(triggerRef.current)
    } else if (buttonRef.current) {
      registerTriggerElement(buttonRef.current)
    }
  }, [asChild, registerTriggerElement])

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  if (asChild) {
    return (
      <div ref={triggerRef} onClick={handleClick}>
        {children}
      </div>
    )
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      type="button"
      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
    >
      {children}
    </button>
  )
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = "end",
  sideOffset = 4,
  className,
}) => {
  const { isOpen, registerContentElement } = React.useContext(DropdownMenuContext)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      registerContentElement(contentRef.current)
    }
    return () => {
      registerContentElement(null)
    }
  }, [registerContentElement])

  if (!isOpen) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-80",
        align === "end" ? "origin-top-right right-0 absolute" : "origin-top-left left-0 absolute",
        className,
      )}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  )
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, className, inset, onClick }) => {
  const { setIsOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    setIsOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-gray-100 hover:text-gray-900",
        inset && "pl-8",
        className,
      )}
      role="menuitem"
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("-mx-1 my-1 h-px bg-gray-200", className)} />
)

export const DropdownMenuLabel: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>

// Componentes adicionales para mantener compatibilidad con la versión anterior
export const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => <>{children}</>

