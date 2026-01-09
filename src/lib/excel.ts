export async function subirArchivoExcel(file: File): Promise<void> {
  const formData = new FormData()
  formData.append("archivo", file)

  const res = await fetch("/api/importar-articulo", {
    method: "POST",
    body: formData,
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("Error al importar artículos:", data.error)
    throw new Error(data.error)
  }
}
