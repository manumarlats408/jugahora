import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatearPrecio(precio: number): string {
  return `$ ${precio.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatearFecha(fecha: string, incluirHora = false): string {
  const date = new Date(fecha)
  const dia = date.getDate()
  const mes = date.toLocaleString("es", { month: "short" })
  const año = date.getFullYear()

  if (!incluirHora) {
    return `${dia} ${mes} ${año}`
  }

  const hora = date.getHours().toString().padStart(2, "0")
  const minutos = date.getMinutes().toString().padStart(2, "0")
  const segundos = date.getSeconds().toString().padStart(2, "0")

  return `${dia} ${mes} ${año}, ${hora}:${minutos}:${segundos}`
}
