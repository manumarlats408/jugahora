export type Articulo = {
  id: number
  codigo: string
  nombre: string
  precioCompra: number
  precioVenta: number
  tipo: "Venta" | "Uso Interno" | "Alquiler" | "Ambos" | "Servicio"
  cantidadStock: number
  updatedAt: string
  clubId: number
}



  export interface Partido {
    id: string
    court: string
    date: string
    startTime: string
    endTime: string
    price: number
  }
  
  export type MovimientoFinanciero = {
    id: number
    concepto: string
    jugador: string | null
    cancha: string | null
    fechaTurno: string | null
    fechaMovimiento: string
    metodoPago: "Efectivo" | "Transferencia" | "Tarjeta"
    egreso: number | null
    ingreso: number | null
    clubId: number
  }
  
  
  
  
  export interface Club {
    id: string
    name: string
  }

  export interface Evento {
    id: number
    nombre: string
    date: string
    startTime: string
    endTime: string
    categoria: string
    genero: string
    tipo: string
    maxParejas: number
    formato: string
    clubId: number
  }
  
  
  
  