"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Articulo } from "@/lib/tipos"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface Props {
  abierto: boolean
  onClose: () => void
  onGuardado: (nuevoArticulo: Articulo) => void
}

export function ModalAgregarArticulo({ abierto, onClose, onGuardado }: Props) {
  const { toast } = useToast()

  const [codigo, setCodigo] = useState("")
  const [nombre, setNombre] = useState("")
  const [precioCompra, setPrecioCompra] = useState("")
  const [precioVenta, setPrecioVenta] = useState("")
  const [cantidadStock, setCantidadStock] = useState("")
  const [tipo, setTipo] = useState<Articulo["tipo"]>("Venta")


  const [cargando, setCargando] = useState(false)

  const handleGuardar = async () => {
    if (!codigo || !nombre || !precioCompra || !precioVenta || !cantidadStock || !tipo) {
      toast({
        title: "Campos requeridos",
        description: "Completá todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setCargando(true)

      const respuesta = await fetch("/api/articulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          nombre,
          precioCompra: parseFloat(precioCompra),
          precioVenta: parseFloat(precioVenta),
          cantidadStock: parseInt(cantidadStock),
          tipo,
        }),
        credentials: "include",
      })

      if (!respuesta.ok) throw new Error("Error al guardar el artículo")

      const nuevo = await respuesta.json()
      onGuardado(nuevo)
      toast({ title: "Artículo creado", description: "Se agregó el nuevo artículo" })
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo crear el artículo",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar nuevo artículo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <Input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            placeholder="Precio Compra"
            type="number"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
          />
          <Input
            placeholder="Precio Venta"
            type="number"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
          />
          <Input
            placeholder="Stock"
            type="number"
            value={cantidadStock}
            onChange={(e) => setCantidadStock(e.target.value)}
          />
          <Select value={tipo} onValueChange={(v) => setTipo(v as Articulo["tipo"])}>
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

        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleGuardar} disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
