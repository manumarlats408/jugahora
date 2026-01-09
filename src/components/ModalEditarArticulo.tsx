"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { Articulo } from "@/lib/tipos"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"

type ArticuloForm = {
  id: number
  codigo: string
  nombre: string
  tipo: Articulo["tipo"]
  clubId: number
  precioCompra: string
  precioVenta: string
  cantidadStock: string
}

interface ModalEditarArticuloProps {
  articulo: Articulo | null
  abierto: boolean
  onClose: () => void
  onGuardado: (actualizado: Articulo) => void
}

export function ModalEditarArticulo({
  articulo,
  abierto,
  onClose,
  onGuardado,
}: ModalEditarArticuloProps) {
  const [form, setForm] = useState<ArticuloForm | null>(null)

  useEffect(() => {
    if (!articulo) return
    setForm({
      id: articulo.id,
      codigo: articulo.codigo,
      nombre: articulo.nombre,
      tipo: articulo.tipo,
      clubId: articulo.clubId,
      precioCompra: articulo.precioCompra?.toString() ?? "",
      precioVenta: articulo.precioVenta?.toString() ?? "",
      cantidadStock: articulo.cantidadStock?.toString() ?? "",
    })
  }, [articulo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleTipoChange = (nuevoTipo: Articulo["tipo"]) => {
    if (!form) return
    setForm({ ...form, tipo: nuevoTipo })
  }

  const handleSubmit = async () => {
    if (!form) return

    if (
      isNaN(Number(form.precioCompra)) ||
      isNaN(Number(form.precioVenta)) ||
      isNaN(Number(form.cantidadStock))
    ) {
      alert("Precio y stock deben ser números válidos.")
      return
    }

    const body = {
      id: form.id,
      codigo: form.codigo,
      nombre: form.nombre,
      tipo: form.tipo,
      clubId: form.clubId,
      precioCompra: parseFloat(form.precioCompra),
      precioVenta: parseFloat(form.precioVenta),
      cantidadStock: parseInt(form.cantidadStock),
    }

    const res = await fetch(`/api/articulos/${form.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const actualizado = await res.json()
      onGuardado(actualizado)
      onClose()
    } else {
      const err = await res.json()
      console.error("Error al guardar:", err)
      alert("Error al guardar")
    }
  }

  if (!form) return null

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar artículo</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input name="codigo" value={form.codigo} onChange={handleChange} placeholder="Código" />
          <Input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
          <Input name="precioCompra" value={form.precioCompra} onChange={handleChange} placeholder="Precio Compra" />
          <Input name="precioVenta" value={form.precioVenta} onChange={handleChange} placeholder="Precio Venta" />
          <Select value={form.tipo} onValueChange={handleTipoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Venta">Venta</SelectItem>
              <SelectItem value="Uso Interno">Uso Interno</SelectItem>
              <SelectItem value="Alquiler">Alquiler</SelectItem>
              <SelectItem value="Ambos">Ambos</SelectItem>
              <SelectItem value="Servicio">Servicio</SelectItem>
            </SelectContent>
          </Select>
          <Input name="cantidadStock" value={form.cantidadStock} onChange={handleChange} placeholder="Stock" />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
