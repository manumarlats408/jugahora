"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CalendarIcon, Package, DollarSign, LayoutDashboard } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/dashboard",
    },
    {
      name: "Partidos",
      href: "/partidos",
      icon: <CalendarIcon className="h-5 w-5" />,
      active: pathname === "/dashboard/partidos",
    },
    {
      name: "Inventario",
      href: "/inventario",
      icon: <Package className="h-5 w-5" />,
      active: pathname === "/dashboard/inventario",
    },
    {
      name: "Finanzas",
      href: "/finanzas",
      icon: <DollarSign className="h-5 w-5" />,
      active: pathname === "/dashboard/finanzas",
    },
  ]

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex -mb-px">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                item.active
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-500 hover:text-brand-hover hover:border-brand-border",
              )}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

