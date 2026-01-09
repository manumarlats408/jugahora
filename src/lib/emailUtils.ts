// lib/emailUtils.ts

/**
 * Formatea una fecha en formato dd-mm-yyyy
 */
export function formatearFechaDDMMYYYY(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const año = d.getFullYear();
    return `${dia}-${mes}-${año}`;
  }
  
  /**
   * Devuelve el HTML con diseño unificado para los mails
   */
  export function generarEmailHTML({
    titulo,
    saludo,
    descripcion,
    detalles,
    footer = "Nos vemos en la cancha 🏆",
  }: {
    titulo: string;
    saludo: string;
    descripcion: string;
    detalles: { label: string; valor: string }[];
    footer?: string;
  }) {
    const listaDetalles = detalles
      .map((d) => `<li><strong>${d.label}:</strong> ${d.valor}</li>`)
      .join("");
  
    return `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #1e88e5; text-align: center;">${titulo}</h2>
        <p>${saludo}</p>
        <p>${descripcion}</p>
  
        <div style="background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <h3 style="color: #43a047; text-align: center;">📅 Detalles</h3>
          <ul style="list-style: none; padding: 0; text-align: center;">
            ${listaDetalles}
          </ul>
        </div>
  
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 14px; color: #666;">${footer}</p>
          <p style="font-size: 12px; color: #999;">⚡ Powered by JugáHora</p>
        </div>
      </div>
    `;
  }
  