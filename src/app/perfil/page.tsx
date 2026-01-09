'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menu, X, Home, User, Calendar, Users, LogOut, Mail, Phone, MapPin, Clock, Plus, Loader2, Trophy} from 'lucide-react'
import Image from 'next/image'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);
import { Line } from 'react-chartjs-2';
import CollapsibleSection from '@/components/CollapsibleSection'


interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  address?: string
  age?: number
  nivel?: string
  preferredSide?: string
  strengths?: string[]
  weaknesses?: string[]
  progress: number
  partidosAgregar: number
}

interface Partido {
  id: number
  fecha: string
  jugadores: string
  resultado: string
  ganado: boolean
  procesado: boolean
}

interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nivel?: string;
  progress?: number;
  phoneNumber?: string;
  age?: number
  preferredSide?: string
  strengths?: string[]
  weaknesses?: string[]
}


const menuItems = [
  { href: '/menu', label: 'Menu', icon: Home },
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/reserva', label: 'Reservar', icon: Calendar },
  { href: '/jugar', label: 'Unirme a un partido', icon: Users },
  { href: "/crear-partido", label: "Crear un partido", icon: Plus },
  { href: '/eventos/unirse', label: 'Unirme a un evento', icon: Trophy },
]


export default function PerfilPage() {
  const [userData, setUserData] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [fecha, setFecha] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [jugadores, setJugadores] = useState<string[]>([])
  const [numSets, setNumSets] = useState('2')
  const [isAddingPartido, setIsAddingPartido] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [ganado, setGanado] = useState<boolean>(false);
  const [eficaciaCompañeros, setEficaciaCompañeros] = useState<{ [key: string]: number }>({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [scores, setScores] = useState([
    [0, 0],
    [0, 0],
    [0, 0]
  ])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const authResponse = await fetch('/api/auth', {
                method: 'GET',
                credentials: 'include',
            });

            if (authResponse.ok) {
                const data = await authResponse.json();
                const user = data.entity;
                console.log('User:', user);
                setUserData(user);
                setJugadores([user.firstName || 'Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']);

                const partidosResponse = await fetch(`/api/partidos?userId=${user.id}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (partidosResponse.ok) {
                    const partidosData = await partidosResponse.json();
                    setPartidos(partidosData);

                    // Filtrar partidos no procesados
                    const partidosNoProcesados = partidosData.filter(
                        (partido: Partido) => !partido.procesado
                    );

                    if (partidosNoProcesados.length > 0) {
                        // Calcular incrementos y decrementos
                        const ganados = partidosNoProcesados.filter((partido: Partido) => partido.ganado).length;
                        const perdidos = partidosNoProcesados.filter((partido: Partido) => !partido.ganado).length;

                        let updatedProgress = user.progress + ganados * 10 - perdidos * 10;
                        let updatedCategoria = parseInt(user.nivel || '8'); // Categoría inicial (8 es la peor)

                        // Manejar descenso de categoría
                        if (updatedProgress >= 100) {
                            updatedProgress = 0;
                            if (updatedCategoria > 1) {
                                updatedCategoria -= 1; // Bajas a una mejor categoría
                            }
                        }

                        // Manejar ascenso de categoría
                        if (updatedProgress < 0) {
                            if (updatedCategoria < 8) {
                                updatedProgress = 90; // Restablecer progreso al subir de categoría
                                updatedCategoria += 1; // Subes a una peor categoría
                            } else {
                                updatedProgress = 0; // No puedes subir más allá de la categoría 8
                            }
                        }

                        // Actualizar el estado de userData
                        setUserData((prev) => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                progress: updatedProgress,
                                nivel: updatedCategoria.toString(), // Guardar como número en formato string
                            };
                        });

                        // Enviar al backend para guardar los cambios
                        await fetch(`/api/update-progress`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                userId: user.id,
                                progress: updatedProgress,
                                nivel: updatedCategoria.toString(),
                            }),
                        }).catch((error) => {
                            console.error('Error al actualizar el progreso en la base de datos:', error);
                        });

                        // Marcar los partidos como procesados en el backend
                        await fetch(`/api/marcar-partidos-procesados`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: user.id }),
                        });
                    }
                } else {
                    console.error('Error al obtener los partidos del usuario');
                }
            } else {
                throw new Error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error al obtener el perfil del usuario:', error);
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    fetchUserProfile();

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [router]);

useEffect(() => {
  const calcularEficaciaCompañeros = () => {
    const compañerosStats: { [key: string]: { ganados: number; total: number } } = {};

    partidos.forEach((partido) => {
      const jugadores = partido.jugadores.split(', ');
      const yo = userData?.firstName || 'Yo';
      const compañero = jugadores.find((j) => j !== yo && !j.includes('Rival'));

      if (compañero) {
        if (!compañerosStats[compañero]) {
          compañerosStats[compañero] = { ganados: 0, total: 0 };
        }

        compañerosStats[compañero].total += 1;
        if (partido.ganado) {
          compañerosStats[compañero].ganados += 1;
        }
      }
    });

    // Calcular eficacia por compañero (en %)
    const eficacia = Object.keys(compañerosStats).reduce((acc, compañero) => {
      const { ganados, total } = compañerosStats[compañero];
      acc[compañero] = (ganados / total) * 100;
      return acc;
    }, {} as { [key: string]: number });

    setEficaciaCompañeros(eficacia);
  };

  if (partidos.length > 0) {
    calcularEficaciaCompañeros();
  }
}, [partidos, userData]);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (detailRef.current && !detailRef.current.contains(event.target as Node)) {
      setSelectedFriend(null);
    }
  }
  if (selectedFriend) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [selectedFriend]);

const formatearFechaDDMMYYYY = (fechaString: string): string => {
  const partes = fechaString.split('T')[0].split('-');
  if (partes.length !== 3) return fechaString;

  const año = partes[0];
  const mes = partes[1];
  const dia = partes[2];

  return `${dia}/${mes}/${año}`;
};

// Procesar los datos para acumular partidos jugados y ganados
const procesarHistorial = (partidos: Partido[]) => {
  const acumulados: { [key: string]: { jugados: number; ganados: number } } = {};

  // Ordenar partidos por fecha
  const partidosOrdenados = partidos.sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  let jugadosAcumulados = 0;
  let ganadosAcumulados = 0;

  partidosOrdenados.forEach((partido) => {
    const fecha = formatearFechaDDMMYYYY(partido.fecha);

    jugadosAcumulados++;
    if (partido.ganado) ganadosAcumulados++;

    acumulados[fecha] = { jugados: jugadosAcumulados, ganados: ganadosAcumulados };
  });

  return acumulados;
};

const historialNivel = (() => {
  if (!userData) return [];

  const partidosOrdenados = [...partidos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime() // del más reciente al más antiguo
  );

  let nivel = parseInt(userData.nivel || '8');
  let progreso = userData.progress || 0;

  const historial: { fecha: string; nivel: number; progreso: number }[] = [];

  for (const partido of partidosOrdenados) {
    historial.unshift({
      fecha: formatearFechaDDMMYYYY(partido.fecha),
      nivel,
      progreso,
    });

    // deshacer la evolución de este partido
    if (partido.ganado) {
      progreso -= 10;
      if (progreso < 0) {
        if (nivel < 8) {
          nivel += 1;
          progreso = 90;
        } else {
          progreso = 0;
        }
      }
    } else {
      progreso += 10;
      if (progreso >= 100) {
        progreso = 0;
        if (nivel > 1) {
          nivel -= 1;
        }
      }
    }
  }

  return historial;
})();



// Procesar los datos
const historial = procesarHistorial(partidos);
const fechas = Object.keys(historial);
const partidosJugados = fechas.map((fecha) => historial[fecha].jugados);
const partidosGanados = fechas.map((fecha) => historial[fecha].ganados);

// Datos para el gráfico
const dataHistorial = {
  labels: fechas,
  datasets: [
    {
      label: 'Partidos Jugados',
      data: partidosJugados,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: false,
      tension: 0.4,
    },
    {
      label: 'Partidos Ganados',
      data: partidosGanados,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: false,
      tension: 0.4,
    },
  ],
};

const dataNivel = {
  labels: historialNivel.map((p) => p.fecha),
  datasets: [
    {
      label: 'Evolución de Nivel',
      data: historialNivel.map(p => p.nivel - (p.progreso / 100)), // ✅ // ✅ Ahora sí refleja tu idea
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      fill: false,
      tension: 0.4,
    },
  ],
};

const opcionesNivel = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      reverse: true,  // ✅ Invertido
      min: 1,
      max: 8,
      title: {
        display: true,
        text: 'Nivel (categoría)',
      },
      ticks: {
        stepSize: 1,
        callback: function (value: string | number) {
          return `Nivel ${value}`;
        },
      },
    },
    x: {
      title: {
        display: true,
        text: 'Fecha',
      },
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};



// Opciones del gráfico
const opciones = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Fecha',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Cantidad Acumulada',
      },
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

// Preparar datos de eficiencia total
const totalJugados = partidos.length;
const totalGanados = partidos.filter((p) => p.ganado).length;
const totalPerdidos = totalJugados - totalGanados;

const dataEficienciaTotal = {
  labels: ['Ganados', 'Perdidos'],
  datasets: [
    {
      label: 'Eficiencia Total',
      data: [totalGanados, totalPerdidos],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      hoverBackgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
    },
  ],
};
  // Calcular rachas de victorias y derrotas con fechas
const calcularRachas = (partidos: Partido[]) => {
  let maxGanadas = 0,
    maxPerdidas = 0,
    tempGanadas = 0,
    tempPerdidas = 0,
    inicioGanadas = '',
    finGanadas = '',
    inicioPerdidas = '',
    finPerdidas = '',
    tempInicioGanadas = '',
    tempInicioPerdidas = '';

  partidos.forEach((partido) => {
    const fecha = formatearFechaDDMMYYYY(partido.fecha);


    if (partido.ganado) {
      if (tempGanadas === 0) tempInicioGanadas = fecha;
      tempGanadas++;
      tempPerdidas = 0;
    } else {
      if (tempPerdidas === 0) tempInicioPerdidas = fecha;
      tempPerdidas++;
      tempGanadas = 0;
    }

    if (tempGanadas > maxGanadas) {
      maxGanadas = tempGanadas;
      inicioGanadas = tempInicioGanadas;
      finGanadas = fecha;
    }
    if (tempPerdidas > maxPerdidas) {
      maxPerdidas = tempPerdidas;
      inicioPerdidas = tempInicioPerdidas;
      finPerdidas = fecha;
    }
  });

  return {
    maxGanadas,
    inicioGanadas,
    finGanadas,
    maxPerdidas,
    inicioPerdidas,
    finPerdidas,
  };
};

const rachas = calcularRachas(partidos);


  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleScoreClick = (setIndex: number, teamIndex: number) => {
    const newScores = [...scores]
    newScores[setIndex][teamIndex] = (newScores[setIndex][teamIndex] + 1) % 8
    setScores(newScores)
  }

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends/list-friends', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      } else {
        console.error('Error al obtener la lista de amigos.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAddPartido = async () => {
  // Validación: el usuario no tiene partidos disponibles para registrar
  if ((userData?.partidosAgregar ?? 0) <= 0) {
    alert("No tenés partidos disponibles para registrar. Jugá desde la app para poder registrar tus partidos.");
    return;
  }

  setIsAddingPartido(true);

  const resultado = scores
    .slice(0, parseInt(numSets))
    .map(set => set.join('-'))
    .join(' - ');

  const partidoData = {
    userId: userData?.id,
    fecha,
    jugadores: jugadores.join(', '),
    resultado,
    ganado
  };

  try {
    const response = await fetch('/api/partidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partidoData),
    });

    if (response.ok) {
      const newPartido = await response.json();
      setPartidos([newPartido, ...partidos]);
      setFecha('');
      setScores([[0, 0], [0, 0], [0, 0]]);
      setIsDialogOpen(false);

      // 🔽 Reducir también localmente el contador para feedback inmediato
      setUserData((prev) =>
        prev ? { ...prev, partidosAgregar: prev.partidosAgregar - 1 } : prev
      );
    } else if (response.status === 403) {
      alert("No tenés partidos disponibles para registrar.");
    } else {
      console.error('Error al añadir el partido');
    }
  } catch (error) {
    console.error('Error al añadir el partido:', error);
  } finally {
    setIsAddingPartido(false);
  }
};


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">No se pudo cargar el perfil. Por favor, inténtalo de nuevo.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-page">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
              href={item.href}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Link>
          ))}
          <button
            className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto text-gray-600 hover:text-brand-primary"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden absolute top-16 right-0 left-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out"
        >
          <nav className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}

    <main className="flex-1 container mx-auto px-4 py-8 bg-brand-page max-w-6xl">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                {userData.firstName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="text-gray-600">Nivel: {userData.nivel} | Progreso: {userData.progress}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-brand-border">
            <CollapsibleSection title="Datos Personales" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-gray-500" />
                  <p><strong>Email:</strong> {userData.email}</p>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  <p><strong>Nombre:</strong> {userData.firstName} {userData.lastName}</p>
                </div>
                {userData.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-gray-500" />
                    <p><strong>Teléfono:</strong> {userData.phoneNumber}</p>
                  </div>
                )}
                {userData.address && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                    <p><strong>Dirección:</strong> {userData.address}</p>
                  </div>
                )}
                {userData.age && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-500" />
                    <p><strong>Edad:</strong> {userData.age}</p>
                  </div>
                )}
                {userData.nivel && (
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    <p><strong>Categoría:</strong> {userData.nivel}</p>
                  </div>
                )}
                {userData.preferredSide && (
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    <p><strong>Lado preferido:</strong> {userData.preferredSide}</p>
                  </div>
                )}
                {userData.strengths && userData.strengths.length > 0 && (
                  <div className="flex items-start">
                    <User className="w-5 h-5 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p><strong>Fortalezas:</strong></p>
                      <ul className="list-disc pl-5">
                        {userData.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {userData.weaknesses && userData.weaknesses.length > 0 && (
                  <div className="flex items-start">
                    <User className="w-5 h-5 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p><strong>Debilidades:</strong></p>
                      <ul className="list-disc pl-5">
                        {userData.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              <Button
                className="w-full mt-4 bg-brand-primary hover:bg-brand-hover text-white"
                onClick={() => router.push('/editar-perfil')}
              >
                Editar perfil
              </Button>
          </div>
        </CollapsibleSection>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-brand-border">
        <CollapsibleSection title="Amigos" defaultOpen={false}>
            <p className="text-gray-600 mb-2">
              Aquí puedes ver tu lista de amigos y también explorar nuevos perfiles.
            </p>
            <Button
              onClick={() => router.push('/explore')}
              className="bg-brand-primary hover:bg-brand-hover text-white"
            >
              Explorar Nuevos Perfiles
            </Button>

            {/* Lista de Amigos */}
            <div>
              {friends.length > 0 ? (
                <ul className="space-y-2 mt-4">
                  {Array.from(new Map(friends.map((f) => [f.email, f])).values()).map((friend) => (
                    <li key={friend.id} className="relative">
                      {/* Nombre + Email (clickable) */}
                      <div
                        className="border-b py-2 flex justify-between items-center text-gray-800 cursor-pointer hover:bg-brand-bg px-2 rounded"
                        onClick={() =>
                          setSelectedFriend((prev) => (prev?.id === friend.id ? null : friend))
                        }
                      >
                        <span>
                          <strong>{friend.firstName} {friend.lastName}</strong> ({friend.email})
                        </span>
                      </div>

                      {/* Detalles si está seleccionado */}
                      {selectedFriend?.id === friend.id && (
                        <div
                          ref={detailRef}
                          className="relative mt-2 p-4 bg-white border border-brand-border rounded shadow transition-all duration-300 ease-in-out"
                        >
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setSelectedFriend(null)}
                          >
                            <X size={20} />
                          </button>

                          {selectedFriend.phoneNumber && (
                            <div className="flex items-center mb-2">
                              <Phone className="w-4 h-4 mr-2 text-gray-500" />
                              <span>{selectedFriend.phoneNumber}</span>
                            </div>
                          )}

                          {selectedFriend.age && (
                            <div className="flex items-center mb-2">
                              <Clock className="w-4 h-4 mr-2 text-gray-500" />
                              <span>{selectedFriend.age} años</span>
                            </div>
                          )}

                          {selectedFriend.preferredSide && (
                            <div className="flex items-center mb-2">
                              <User className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Lado preferido: {selectedFriend.preferredSide}</span>
                            </div>
                          )}

                          {selectedFriend.strengths && selectedFriend.strengths.length > 0 && (
                            <div className="mb-2">
                              <p className="font-semibold text-gray-700">Fortalezas:</p>
                              <ul className="list-disc pl-6 text-sm text-gray-600">
                                {selectedFriend.strengths.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedFriend.weaknesses && selectedFriend.weaknesses.length > 0 && (
                            <div className="mb-2">
                              <p className="font-semibold text-gray-700">Debilidades:</p>
                              <ul className="list-disc pl-6 text-sm text-gray-600">
                                {selectedFriend.weaknesses.map((w, i) => (
                                  <li key={i}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-4">No tienes amigos agregados.</p>
              )}
            </div>
        </CollapsibleSection>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-brand-border">
        <CollapsibleSection title="Ranking de Amigos"  defaultOpen={false}>
            {friends.length > 0 ? (
              <ul className="space-y-3">
                {Array.from(
                  new Map(
                    friends
                      .filter((f) => f.nivel !== undefined && f.progress !== undefined)
                      .map((f) => [f.email, f])
                  ).values()
                )
                  .sort((a, b) => {
                    const nivelA = parseInt(a.nivel ?? '8');
                    const nivelB = parseInt(b.nivel ?? '8');
                    if (nivelA !== nivelB) return nivelA - nivelB; // menor nivel es mejor
                    return (b.progress ?? 0) - (a.progress ?? 0); // más progreso es mejor
                  })
                  .map((friend, index) => (
                    <li
                      key={friend.id}
                      className="bg-white rounded-lg shadow p-3 flex justify-between items-center border border-brand-border"
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          #{index + 1} - {friend.firstName} {friend.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Nivel: {friend.nivel ?? '-'} | Progreso: {friend.progress ?? 0}%
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500">Agrega amigos para ver el ranking.</p>
            )}
        </CollapsibleSection>
        </div> 

        <div className="bg-white rounded-lg shadow-sm border border-brand-border">
        <CollapsibleSection title="Estadísticas de Partidos" defaultOpen={false}>
            <div>
              <p className="text-gray-600 mb-2">
                A medida que anotes tus partidos, tus estadisticas comenzaran a crecer!
              </p>
            </div>
            {/* <div>
              <p><strong>Total de Partidos Jugados:</strong> {partidos.length}</p>
              <p><strong>Total de Partidos Ganados:</strong> {partidos.filter((p) => p.ganado).length}</p>
              <p><strong>Total de Partidos Perdidos:</strong> {partidos.filter((p) => !p.ganado).length}</p>
            </div> */}

            {/* Gráfico de Eficiencia Total */}
            <div className="flex flex-col mb-8">
              <p className="font-bold text-brand-primary text-left w-full mb-4">Eficiencia Total:</p>
              <p className="text-gray-600 text-sm mb-4">
                Este gráfico de torta muestra el porcentaje de partidos ganados y perdidos en relación al total de partidos jugados.
              </p>
              <div className="flex justify-center">
                <div style={{ width: '250px', height: '250px' }}>
                  <Doughnut 
                    data={dataEficienciaTotal} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                              const value = context.raw as number;
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: ${percentage}% (${value})`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Gráfico de Eficiencia con Compañeros */}
            <div className="flex flex-col mb-8">
              <p className="font-bold text-brand-primary text-left w-full mb-4">Eficiencia con Compañeros:</p>
              <p className="text-gray-600 text-sm mb-4">
                Este gráfico de barras muestra el porcentaje de victorias alcanzado con los 5 compañeros más frecuentes.
              </p>
              <div className="flex justify-center">
                <div style={{ width: '100%', height: '250px', maxWidth: '600px' }}>
                  <Bar
                    data={{
                      labels: Object.keys(eficaciaCompañeros).slice(0, 5), // Top 5 compañeros
                      datasets: [
                        {
                          label: 'Eficiencia (%)',
                          data: Object.values(eficaciaCompañeros).slice(0, 5),
                          backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: '% de Victorias',
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Compañeros',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p className="font-bold text-brand-primary mb-4">Evolución de Nivel</p>
              <p className="text-gray-600 text-sm mb-4">
                Este gráfico muestra cómo ha evolucionado tu nivel a lo largo del tiempo. El eje vertical refleja la categoría (del 8 al 1, siendo 1 la mejor). 
                A medida que ganás partidos, tu progreso dentro de la categoría se acumula y te acercas a la siguiente categoria.
              </p>
              <div style={{ width: '100%', height: '400px' }}>
                <Line data={dataNivel} options={opcionesNivel} />
              </div>
            </div>

            
            {/* Gráfico de lineas */}
            <div className="mb-8">
              <p className="font-bold text-brand-primary mb-4">Historial de Victorias Acumuladas</p>
              <p className="text-gray-600 text-sm mb-4">
                Este gráfico de líneas muestra cómo evolucionaron tus partidos jugados/ganados a lo largo del tiempo.
              </p>
              <div style={{ width: '100%', height: '400px' }}>
                <Line data={dataHistorial} options={opciones} />
              </div>
            </div>
            
            {/* Rachas de Partidos con Fechas */}
            <div className="mb-8">
              <p className="font-bold text-brand-primary mb-4">Rachas de Partidos</p>
              <p className="text-gray-600 text-sm mb-4">
                Aquí puedes ver tus rachas más largas de partidos ganados y perdidos, con las fechas de inicio y fin de cada una.
              </p>
              <div className="mb-4">
                <p className="text-green-600 font-bold">
                  🟢 Racha más larga de victorias: {rachas.maxGanadas} partidos
                </p>
                {rachas.maxGanadas > 0 && (
                  <p className="text-gray-700">
                    Desde <strong>{rachas.inicioGanadas}</strong> hasta <strong>{rachas.finGanadas}</strong>
                  </p>
                )}
              </div>
              <div>
                <p className="text-red-600 font-bold">
                  🔴 Racha más larga de derrotas: {rachas.maxPerdidas} partidos
                </p>
                {rachas.maxPerdidas > 0 && (
                  <p className="text-gray-700">
                    Desde <strong>{rachas.inicioPerdidas}</strong> hasta <strong>{rachas.finPerdidas}</strong>
                  </p>
                )}
              </div>
            </div>

          </CollapsibleSection>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-brand-border">
            <CollapsibleSection title="Historial de Partidos" defaultOpen={false}>
              <div>
                <p className="text-gray-600 mb-2">
                  Registrá tus partidos con honestidad. Así, tus estadísticas van a reflejar tu perfil con precisión.
                </p>

                {typeof userData?.partidosAgregar === 'number' && (
                  <p className="text-sm text-gray-700 font-medium mb-4">
                    {userData.partidosAgregar > 0 ? (
                      <>🎾 Tenés <span className="text-brand-primary">{userData.partidosAgregar}</span> partidos disponibles para registrar.</>
                    ) : userData.partidosAgregar === 0 ? (
                      <span className="text-red-600">⚠️ No tenés partidos disponibles para registrar. Jugá desde la app para desbloquear uno.</span>
                    ) : null}
                  </p>
                )}
              </div>

              {partidos.length > 0 ? (
                partidos.map((partido) => (
                  <div key={partido.id} className="border-b border-gray-200 pb-2">
                    <p><strong>Fecha:</strong> {formatearFechaDDMMYYYY(partido.fecha)}</p>
                    <p><strong>Jugadores:</strong> {partido.jugadores}</p>
                    <p><strong>Resultado:</strong> {partido.resultado}</p>
                    <p><strong>Estado:</strong> {partido.ganado ? 'Ganado' : 'Perdido'}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay partidos registrados aún.</p>
              )}

              <div className="mt-4 flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Agregar Partido"
                      disabled={(userData?.partidosAgregar ?? 0) <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Añadir Nuevo Partido</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fecha" className="text-right">Fecha</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      {jugadores.map((jugador, index) => (
                        <div key={index} className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor={`jugador${index + 1}`} className="text-right">Jugador {index + 1}</Label>
                          <Input
                            id={`jugador${index + 1}`}
                            value={jugador}
                            onChange={(e) => {
                              const newJugadores = [...jugadores];
                              newJugadores[index] = e.target.value;
                              setJugadores(newJugadores);
                            }}
                            placeholder={index === 0 ? userData.firstName : `Jugador ${index + 1}`}
                            className="col-span-3"
                          />
                        </div>
                      ))}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="numSets" className="text-right">Número de Sets</Label>
                        <Select value={numSets} onValueChange={setNumSets}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar número de sets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Sets</SelectItem>
                            <SelectItem value="3">3 Sets</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ganado" className="text-right">Resultado</Label>
                        <Select value={ganado.toString()} onValueChange={(value) => setGanado(value === 'true')}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar resultado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Ganado</SelectItem>
                            <SelectItem value="false">Perdido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-center">Puntuación</Label>
                        {scores.slice(0, parseInt(numSets)).map((set, setIndex) => (
                          <div key={setIndex} className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Set {setIndex + 1}</span>
                            <div className="flex justify-between items-center">
                              <span className="text-xs">{jugadores[0]} / {jugadores[1]}</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleScoreClick(setIndex, 0)}
                                >
                                  {set[0]}
                                </Button>
                                <span className="text-sm font-medium">-</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleScoreClick(setIndex, 1)}
                                >
                                  {set[1]}
                                </Button>
                              </div>
                              <span className="text-xs">{jugadores[2]} / {jugadores[3]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={handleAddPartido}
                      className="w-full"
                      disabled={isAddingPartido}
                    >
                      {isAddingPartido ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Añadiendo...
                        </>
                      ) : (
                        'Añadir Partido'
                      )}
                    </Button>
                    <DialogClose asChild>
                      <button className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full p-2 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                        <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
            </CollapsibleSection>
          </div>
        </div>              
        </main>

        <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 mb-2 sm:mb-0">
              © 2024 JugáHora. Todos los derechos reservados.
            </p>
            <nav className="flex gap-4">
              <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/perfil">
                Términos de Servicio
              </Link>
              <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/perfil">
                Privacidad
              </Link>
            </nav>
          </div>
        </footer>
        </div>
        )
        }