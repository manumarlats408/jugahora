import MovimientosFinancieros from "@/components/movimientos-financieros"
import { Sidebar } from "@/components/layout/sidebar"

export default function MovimientosPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <MovimientosFinancieros />
      </main>
    </div>
  )
}