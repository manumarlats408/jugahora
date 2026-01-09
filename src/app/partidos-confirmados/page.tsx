import dynamic from "next/dynamic"

const PartidosConfirmados = dynamic(() => import("@/components/partidos-confirmados"), { ssr: false })
export default PartidosConfirmados
