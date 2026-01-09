import type { Metadata } from "next";
import localFont from "next/font/local";
import 'react-day-picker/dist/style.css'; // <- ✅ Importante para estilos base del calendario
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "JugáHora - Reserva y Únete a Partidos de Pádel",
  description: "Reserva canchas de pádel o únete a partidos existentes en tu área con JugáHora. Juega cuando quieras, donde quieras.",
  verification: {
    google: '1Cq72fol-031V-8akJf5Q5y93beVuAV4l-zxyXXZzk0',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
