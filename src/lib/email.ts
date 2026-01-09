import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const transporter = nodemailer.createTransport({
    // Configura aquí tu servicio de email
  });

  const resetUrl = `https://jugahora.com.ar/restablecer-contrasena?token=${resetToken}`;

  await transporter.sendMail({
    from: '"JugáHora" <noreply@jugahora.com>',
    to: email,
    subject: 'Restablecimiento de contraseña',
    html: `
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetUrl}">Restablecer contraseña</a>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    `,
  });
}