import React, { createContext, useContext, useState } from 'react'

interface TooltipContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </TooltipContext.Provider>
  )
}

export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(TooltipContext)
  if (!context) throw new Error('TooltipTrigger must be used within a TooltipProvider')

  return (
    <div
      onMouseEnter={() => context.setIsOpen(true)}
      onMouseLeave={() => context.setIsOpen(false)}
    >
      {children}
    </div>
  )
}

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(TooltipContext)
  if (!context) throw new Error('TooltipContent must be used within a TooltipProvider')

  if (!context.isOpen) return null

  return (
    <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
      {children}
      <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
    </div>
  )
}

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TooltipProvider>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipProvider>
  )
}