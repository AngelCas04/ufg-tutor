'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import CalendarCarousel from '@/components/CalendarCarousel';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Student {
    id: string;
    name: string;
    career: string;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function HomePage() {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const router = useRouter();

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        function checkAuth() {
            try {
                const session = localStorage.getItem('user_session');
                if (session) {
                    setStudent(JSON.parse(session));
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Auth check failed', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!student) return null;

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="min-h-screen p-4 md:p-8 space-y-12 max-w-7xl mx-auto relative z-10"
        >
            {/* Header Section */}
            <motion.header variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent drop-shadow-lg">
                        Hola, {student.name.split(' ')[0]}
                    </h1>
                    <p className="text-slate-300 text-lg mt-2 font-light tracking-wide">
                        {student.career} • <span className="font-mono text-indigo-300">{student.id}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="glass"
                        onClick={toggleFullscreen}
                        className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300"
                        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                        {isFullscreen ? '🗗' : '⛶'}
                    </Button>
                    <Button
                        variant="glass"
                        onClick={() => {
                            localStorage.removeItem('user_session');
                            router.push('/login');
                        }}
                        className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </motion.header>

            {/* Main Actions Grid */}
            <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Chat Tutor Card */}
                <Link href="/chat" className="group block h-full">
                    <GlassCard
                        intensity="high"
                        hoverEffect
                        className="h-full border-indigo-500/20 bg-indigo-500/5 group-hover:bg-indigo-500/10"
                    >
                        <CardHeader>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <CardTitle className="text-indigo-100">Tutor IA</CardTitle>
                            <CardDescription className="text-indigo-200/70">
                                Resuelve tus dudas académicas al instante con nuestro asistente inteligente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="liquid" className="w-full">
                                Iniciar Chat
                            </Button>
                        </CardContent>
                    </GlassCard>
                </Link>

                {/* Progress Card */}
                <Link href="/progress" className="group block h-full">
                    <GlassCard
                        intensity="medium"
                        hoverEffect
                        className="h-full border-purple-500/20 bg-purple-500/5 group-hover:bg-purple-500/10"
                    >
                        <CardHeader>
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                                <span className="text-3xl">📊</span>
                            </div>
                            <CardTitle className="text-purple-100">Mi Progreso</CardTitle>
                            <CardDescription className="text-purple-200/70">
                                Visualiza tu avance en la carrera y materias cursadas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-purple-100">
                                    <span>Avance General</span>
                                    <span className="font-bold">45%</span>
                                </div>
                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "45%" }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    />
                                </div>
                                <Button variant="outline" className="w-full mt-4 border-purple-500/30 hover:bg-purple-500/20 text-purple-100">
                                    Ver Detalles
                                </Button>
                            </div>
                        </CardContent>
                    </GlassCard>
                </Link>

                {/* Resources Card */}
                <div className="group block h-full">
                    <GlassCard
                        intensity="medium"
                        hoverEffect
                        className="h-full border-cyan-500/20 bg-cyan-500/5 group-hover:bg-cyan-500/10"
                    >
                        <CardHeader>
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                                <span className="text-3xl">📚</span>
                            </div>
                            <CardTitle className="text-cyan-100">Recursos</CardTitle>
                            <CardDescription className="text-cyan-200/70">
                                Accede a bibliotecas, documentos y guías de estudio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-cyan-100/80 mb-4">
                                <li className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                    <span>📄</span> Guía del Estudiante
                                </li>
                                <li
                                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => setIsCalendarOpen(true)}
                                >
                                    <span>📅</span> Calendario Académico
                                </li>
                            </ul>
                            <a
                                href="https://webdesktop.ufg.edu.sv/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button variant="outline" className="w-full border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-100">
                                    Ir al Portal Web ↗
                                </Button>
                            </a>
                        </CardContent>
                    </GlassCard>
                </div>
            </motion.div>

            {/* Calendar Overlay */}
            <CalendarCarousel
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />
        </motion.div>
    );
}


