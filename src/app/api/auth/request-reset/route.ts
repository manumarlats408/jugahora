import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configurar el transporter de nodemailer (usa tus propias credenciales)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Buscar al usuario por email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // No revelar si el email existe o no
      return NextResponse.json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });
    }

    // Generar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Enviar email
    await transporter.sendMail({
      from: '"JugáHora" <noreply@jugahora.com>',
      to: email,
      subject: 'Restablecimiento de contraseña',
      html: `
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/restablecer-contrasena?token=${token}">Restablecer contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
      `,
    });

    return NextResponse.json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    return NextResponse.json({ error: 'Ocurrió un error al procesar tu solicitud' }, { status: 500 });
  }
}