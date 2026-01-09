"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Articulo } from "@/lib/tipos"

interface TablaArticulosProps {
  articulos: Articulo[]
  cargando: boolean
  onActualizar: (articulos: Articulo[]) => void
  onEditar: (articulo: Articulo) => void
  onEliminar: (articuloId: number) => void
}

export function TablaArticulos({ articulos, cargando, onEditar, onEliminar }: TablaArticulosProps) {
  if (cargando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (articulos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No se encontraron artículos</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio Compra</TableHead>
            <TableHead className="text-right">Precio Venta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articulos.map((articulo) => (
            <TableRow key={articulo.id}>
              <TableCell className="font-medium">{articulo.codigo}</TableCell>
              <TableCell>{articulo.nombre}</TableCell>
              <TableCell className="text-right">${articulo.precioCompra.toFixed(2)}</TableCell>
              <TableCell className="text-right">${articulo.precioVenta.toFixed(2)}</TableCell>
              <TableCell>{articulo.tipo}</TableCell>
              <TableCell className="text-right">{articulo.cantidadStock}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onEditar(articulo)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => onEliminar(articulo.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
