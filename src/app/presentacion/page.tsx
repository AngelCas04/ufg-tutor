'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Slide, childVariants } from '@/components/presentation/Slide';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, ChevronRight, Maximize, Minimize, FileDown, Rocket, Terminal, Database, Cpu, Shield, Zap } from 'lucide-react';

export default function PresentationPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [isEntering, setIsEntering] = useState(true);
    const router = useRouter();
    const presentationRef = useRef<HTMLDivElement>(null);

    const totalSlides = 10;

    // Fade in effect on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsEntering(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const exportToPDF = async () => {
        if (!presentationRef.current) return;

        try {
            // Inyectar estilos que sobreescriban colores oklab
            const styleOverride = document.createElement('style');
            styleOverride.id = 'pdf-color-override';
            styleOverride.textContent = `
                * {
                    --tw-ring-color: rgb(99, 102, 241) !important;
                    --tw-shadow-color: rgb(0, 0, 0) !important;
                }
                .text-gray-300 { color: rgb(209, 213, 219) !important; }
                .text-gray-400 { color: rgb(156, 163, 175) !important; }
                .text-gray-500 { color: rgb(107, 114, 128) !important; }
                .text-white { color: rgb(255, 255, 255) !important; }
                .text-indigo-300 { color: rgb(165, 180, 252) !important; }
                .text-indigo-400 { color: rgb(129, 140, 248) !important; }
                .text-red-400 { color: rgb(248, 113, 113) !important; }
                .text-green-400 { color: rgb(74, 222, 128) !important; }
                .text-yellow-400 { color: rgb(250, 204, 21) !important; }
                .text-yellow-500 { color: rgb(234, 179, 8) !important; }
                .text-blue-400 { color: rgb(96, 165, 250) !important; }
                .text-purple-200 { color: rgb(233, 213, 255) !important; }
                .text-cyan-200 { color: rgb(165, 243, 252) !important; }
                .bg-black { background-color: rgb(0, 0, 0) !important; }
                .bg-indigo-500\\/20 { background-color: rgba(99, 102, 241, 0.2) !important; }
                .bg-purple-500 { background-color: rgb(168, 85, 247) !important; }
                .bg-yellow-500 { background-color: rgb(234, 179, 8) !important; }
                .bg-pink-500 { background-color: rgb(236, 72, 153) !important; }
                .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05) !important; }
                .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1) !important; }
                .bg-red-500\\/10 { background-color: rgba(239, 68, 68, 0.1) !important; }
                .border-indigo-500\\/30 { border-color: rgba(99, 102, 241, 0.3) !important; }
                .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1) !important; }
                .border-white\\/20 { border-color: rgba(255, 255, 255, 0.2) !important; }
                .border-red-500\\/30 { border-color: rgba(239, 68, 68, 0.3) !important; }
                .from-blue-400 { --tw-gradient-from: rgb(96, 165, 250) !important; }
                .to-purple-600 { --tw-gradient-to: rgb(147, 51, 234) !important; }
                .from-indigo-600 { --tw-gradient-from: rgb(79, 70, 229) !important; }
                .from-indigo-500 { --tw-gradient-from: rgb(99, 102, 241) !important; }
                .to-purple-500 { --tw-gradient-to: rgb(168, 85, 247) !important; }
            `;
            document.head.appendChild(styleOverride);

            // Pequeña espera para que los estilos se apliquen
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(presentationRef.current, {
                useCORS: true,
                logging: false,
                allowTaint: true,
                background: '#000000',
                ignoreElements: (element: HTMLElement) => {
                    return element.classList.contains('animate-blob');
                }
            } as any);

            // Remover los estilos inyectados
            styleOverride.remove();

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('ufg-tutor-presentacion.pdf');
        } catch (error) {
            // Limpiar estilos si hay error
            const existingStyle = document.getElementById('pdf-color-override');
            if (existingStyle) existingStyle.remove();

            console.error("PDF Export failed:", error);
            alert("Hubo un error al generar el PDF. Por favor intenta de nuevo.");
        }
    };

    const handleExit = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.push('/');
        }, 1000);
    };

    // Preloading logic
    useEffect(() => {
        if (currentSlide === 8) {
            console.log("Preloading main app resources...");
            router.prefetch('/');
        }
    }, [currentSlide, router]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setCurrentSlide(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
            }
            if (e.key === 'ArrowLeft') {
                setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className={`min-h-screen bg-black text-white overflow-hidden relative transition-opacity duration-1000 ${isEntering ? 'opacity-0' : 'opacity-100'} ${isExiting ? 'opacity-0' : ''}`}>
            {/* Background Animation */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <Button variant="ghost" onClick={exportToPDF} title="Exportar PDF">
                    <FileDown className="w-6 h-6" />
                </Button>
                <Button variant="ghost" onClick={toggleFullscreen} title="Pantalla Completa">
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </Button>
            </div>

            {/* Main Content Area */}
            <div ref={presentationRef} className="relative z-10 w-full h-screen flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {/* Slide 1: Intro */}
                    {currentSlide === 0 && (
                        <Slide key="slide1" isActive={currentSlide === 0}>
                            <motion.div variants={childVariants}>
                                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-mono mb-4">
                                    v1.0.0 • Versión Final
                                </span>
                            </motion.div>
                            <motion.h1 variants={childVariants} className="text-4xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4 md:mb-6">
                                UFG Tutor
                            </motion.h1>
                            <motion.p variants={childVariants} className="text-lg md:text-3xl text-gray-300 max-w-4xl leading-relaxed">
                                Revolucionando el aprendizaje universitario mediante la integración de Inteligencia Artificial, tecnologías web de última generación y arquitecturas orientadas al usuario. Una plataforma completa diseñada para empoderar a los estudiantes de la Universidad Francisco Gavidia con herramientas modernas, accesibles e inteligentes que transforman la experiencia educativa en el siglo XXI.
                            </motion.p>
                        </Slide>
                    )}

                    {/* Slide 2: Problem */}
                    {currentSlide === 1 && (
                        <Slide key="slide2" isActive={currentSlide === 1}>
                            <motion.div variants={childVariants} className="flex items-center justify-center gap-3 mb-4 md:mb-6 text-red-400">
                                <Zap className="w-8 h-8 md:w-10 md:h-10" />
                                <h3 className="text-xl md:text-2xl font-mono uppercase tracking-wider">La Problemática</h3>
                            </motion.div>
                            <motion.h2 variants={childVariants} className="text-3xl md:text-6xl font-bold mb-6 md:mb-8 text-white">
                                Fragmentación del Ecosistema Académico Digital
                            </motion.h2>
                            <motion.p variants={childVariants} className="text-base md:text-xl max-w-4xl leading-relaxed text-gray-300 mb-6">
                                Los estudiantes universitarios enfrentan un panorama digital fragmentado: sistemas académicos obsoletos con tiempos de respuesta lentos, recursos educativos dispersos en múltiples plataformas desconectadas, falta de asistencia académica fuera del horario de clases, y ausencia de herramientas inteligentes que se adapten a sus necesidades individuales. Esta desconexión genera frustración, pérdida de tiempo valioso y afecta directamente el rendimiento académico.
                            </motion.p>
                            <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm w-full">
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <span className="text-red-400 font-bold block text-lg">40%</span>
                                    <p className="text-gray-400 mt-1">Tiempo perdido navegando sistemas</p>
                                </div>
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <span className="text-red-400 font-bold block text-lg">65%</span>
                                    <p className="text-gray-400 mt-1">Estudiantes sin acceso a tutorías</p>
                                </div>
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <span className="text-red-400 font-bold block text-lg">48h</span>
                                    <p className="text-gray-400 mt-1">Promedio respuesta email</p>
                                </div>
                            </motion.div>
                        </Slide>
                    )}

                    {/* Slide 3: Solution */}
                    {currentSlide === 2 && (
                        <Slide key="slide3" isActive={currentSlide === 2}>
                            <motion.div variants={childVariants} className="flex items-center justify-center gap-3 mb-4 md:mb-6 text-green-400">
                                <Cpu className="w-8 h-8 md:w-10 md:h-10" />
                                <h3 className="text-xl md:text-2xl font-mono uppercase tracking-wider">La Solución Integral</h3>
                            </motion.div>
                            <motion.h2 variants={childVariants} className="text-3xl md:text-6xl font-bold mb-6 md:mb-8 text-white">
                                UFG Tutor: Ecosistema Educativo Unificado
                            </motion.h2>
                            <motion.div variants={childVariants} className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-300 text-left">
                                <p className="leading-relaxed">
                                    UFG Tutor es una Progressive Web App diseñada específicamente para resolver la fragmentación académica. Integramos tres componentes esenciales en una sola plataforma: un asistente de IA conversacional disponible 24/7, un sistema de gestión de progreso académico con visualizaciones interactivas, y un repositorio centralizado de recursos educativos. Todo funciona de manera fluida tanto online como offline gracias a nuestra arquitectura de almacenamiento local.
                                </p>
                                <ul className="space-y-3 md:space-y-4">
                                    <li className="flex items-start gap-3 md:gap-4">
                                        <span className="text-green-400 text-xl md:text-2xl flex-shrink-0">✓</span>
                                        <span><strong className="text-white">Centralización Total:</strong> Chat inteligente, seguimiento de progreso académico y biblioteca de recursos unificados en una interfaz coherente y moderna.</span>
                                    </li>
                                    <li className="flex items-start gap-3 md:gap-4">
                                        <span className="text-green-400 text-xl md:text-2xl flex-shrink-0">✓</span>
                                        <span><strong className="text-white">Disponibilidad Continua:</strong> Asistente de IA disponible las 24 horas del día, los 7 días de la semana, respuestas instantáneas sin tiempos de espera.</span>
                                    </li>
                                    <li className="flex items-start gap-3 md:gap-4">
                                        <span className="text-green-400 text-xl md:text-2xl flex-shrink-0">✓</span>
                                        <span><strong className="text-white">Offline-First:</strong> Arquitectura que garantiza acceso a datos críticos incluso sin conexión a internet mediante almacenamiento local avanzado.</span>
                                    </li>
                                </ul>
                            </motion.div>
                        </Slide>
                    )}

                    {/* Slide 4: JavaScript */}
                    {currentSlide === 3 && (
                        <Slide
                            key="slide4"
                            isActive={currentSlide === 3}
                            image="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
                            imageAlt="Logo de JavaScript"
                        >
                            <motion.div variants={childVariants} className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6 text-yellow-400">
                                <Terminal className="w-8 h-8 md:w-10 md:h-10" />
                                <h3 className="text-xl md:text-2xl font-mono uppercase tracking-wider">Tecnología Principal</h3>
                            </motion.div>
                            <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white">
                                JavaScript & Next.js 15
                            </motion.h2>
                            <motion.div variants={childVariants} className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-300">
                                <p className="leading-relaxed">
                                    Construido sobre el ecosistema más vibrante y maduro de la web moderna. Utilizamos <strong className="text-white">React 19</strong> con Server Components para un rendimiento óptimo, aprovechando la capacidad de renderizar componentes directamente en el servidor reduciendo el tamaño del bundle enviado al cliente. La aplicación explota el event loop no bloqueante de JavaScript para manejar múltiples flujos de datos de forma asíncrona y concurrente.
                                </p>
                                <p className="leading-relaxed">
                                    <strong className="text-white">Next.js 15</strong> nos proporciona características avanzadas como App Router con rutas paralelas e interceptadas, optimización automática de imágenes, font optimization, y code splitting inteligente que divide la aplicación en chunks pequeños que se cargan bajo demanda, mejorando dramáticamente los tiempos de carga inicial.
                                </p>
                            </motion.div>
                        </Slide>
                    )}

                    {/* Slide 5: IndexedDB */}
                    {currentSlide === 4 && (
                        <Slide
                            key="slide5"
                            isActive={currentSlide === 4}
                            image="https://cdn-icons-png.flaticon.com/512/2906/2906274.png"
                            imageAlt="Icono de Base de Datos"
                        >
                            <motion.div variants={childVariants} className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6 text-blue-400">
                                <Database className="w-8 h-8 md:w-10 md:h-10" />
                                <h3 className="text-xl md:text-2xl font-mono uppercase tracking-wider">Almacenamiento Local</h3>
                            </motion.div>
                            <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white">
                                IndexedDB: Base de Datos NoSQL del Cliente
                            </motion.h2>
                            <motion.div variants={childVariants} className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-300">
                                <p className="leading-relaxed">
                                    Implementamos <strong className="text-white">Dexie.js</strong> como capa de abstracción sobre IndexedDB, proporcionando una API moderna y basada en Promises para el manejo transaccional de datos. IndexedDB es una base de datos NoSQL de bajo nivel que permite almacenar cantidades significativas de datos estructurados (incluyendo archivos/blobs) directamente en el navegador del usuario con persistencia garantizada.
                                </p>
                                <p className="leading-relaxed">
                                    Esta arquitectura permite que UFG Tutor almacene todo el perfil académico del estudiante, historial completo de conversaciones con el asistente IA, progreso en materias, y recursos descargados localmente. Los datos nunca salen del dispositivo del usuario a menos que sea explícitamente necesario, garantizando privacidad absoluta y tiempos de acceso prácticamente instantáneos.
                                </p>
                            </motion.div>
                        </Slide>
                    )}

                    {/* Slide 6: Hugging Face */}
                    {currentSlide === 5 && (
                        <Slide
                            key="slide6"
                            isActive={currentSlide === 5}
                            image="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
                            imageAlt="Logo de Hugging Face"
                        >
                            <motion.div variants={childVariants} className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6 text-yellow-500">
                                <span className="text-3xl md:text-4xl">🤗</span>
                                <h3 className="text-xl md:text-2xl font-mono uppercase tracking-wider">Inteligencia Artificial</h3>
                            </motion.div>
                            <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white">
                                API de Inferencia Serverless de Hugging Face
                            </motion.h2>
                            <motion.div variants={childVariants} className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-300">
                                <p className="leading-relaxed">
                                    Integración directa con la poderosa <strong className="text-white">Inference API</strong> de Hugging Face, la plataforma líder en modelos de lenguaje de código abierto. Accedemos a modelos Transformer de última generación como Mistral-7B, Llama-3 o Qwen, especializados en procesamiento de lenguaje natural y optimizados para tareas conversacionales y de comprensión contextual profunda.
                                </p>
                                <p className="leading-relaxed">
                                    La arquitectura serverless elimina la necesidad de gestionar infraestructura compleja. Los modelos están pre-cargados en servidores de alto rendimiento con GPUs dedicadas, permitiendo respuestas en milisegundos. Utilizamos streaming de tokens para mostrar respuestas progresivamente mientras se generan, creando una experiencia conversacional natural y fluida similar a ChatGPT pero completamente gratuita y de código abierto.
                                </p>
                            </motion.div>
                        </Slide>
                    )}

                    {/* Slide 7: Architecture */}
                    {currentSlide === 6 && (
                        <Slide key="slide7" isActive={currentSlide === 6}>
                            <motion.h2 variants={childVariants} className="text-3xl md:text-6xl font-bold mb-6 md:mb-8 text-center text-white">
                                Arquitectura Modular Avanzada
                            </motion.h2>
                            <motion.p variants={childVariants} className="text-base md:text-lg text-gray-300 mb-8 md:mb-12 text-center max-w-3xl">
                                UFG Tutor está construido siguiendo principios de Clean Architecture y separación de responsabilidades, permitiendo escalabilidad, mantenibilidad y extensibilidad del proyecto a largo plazo.
                            </motion.p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-6xl">
                                <motion.div variants={childVariants} className="p-4 md:p-6 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-105 duration-300">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3 md:mb-4 text-2xl md:text-3xl">🤖</div>
                                    <h3 className="text-lg md:text-xl font-bold text-indigo-200 mb-2 md:mb-3">Sistema RAG Inteligente</h3>
                                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">Retrieval-Augmented Generation: combina búsqueda semántica en recursos académicos con generación de respuestas contextualizadas.</p>
                                </motion.div>
                                <motion.div variants={childVariants} className="p-4 md:p-6 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-105 duration-300">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 md:mb-4 text-2xl md:text-3xl">📊</div>
                                    <h3 className="text-lg md:text-xl font-bold text-purple-200 mb-2 md:mb-3">Visualización de Datos</h3>
                                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">Gráficos interactivos renderizados en el cliente mostrando progreso académico y estadísticas de uso.</p>
                                </motion.div>
                                <motion.div variants={childVariants} className="p-4 md:p-6 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-105 duration-300">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3 md:mb-4 text-2xl md:text-3xl">📚</div>
                                    <h3 className="text-lg md:text-xl font-bold text-cyan-200 mb-2 md:mb-3">Caché con Service Workers</h3>
                                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">Service Workers interceptan peticiones de red y aplican estrategias de caché agresivo para acceso offline.</p>
                                </motion.div>
                            </div>
                        </Slide>
                    )}

                    {/* Slide 8: Security */}
                    {currentSlide === 7 && (
                        <Slide
                            key="slide8"
                            isActive={currentSlide === 7}
                            image="https://cdn-icons-png.flaticon.com/512/2438/2438078.png"
                            imageAlt="Icono de Seguridad"
                        >
                            <motion.div variants={childVariants} className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6 text-gray-300">
                                <Shield className="w-8 h-8 md:w-10 md:h-10" />
                                <h3 className="text-xl md:text-2xl font-mono uppercase tracking-wider">Seguridad & Privacidad</h3>
                            </motion.div>
                            <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white">
                                Arquitectura Client-Side con Privacidad por Diseño
                            </motion.h2>
                            <motion.div variants={childVariants} className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-300">
                                <p className="leading-relaxed">
                                    Al implementar una arquitectura completamente client-side sin base de datos centralizada para información de usuarios, eliminamos vectores de ataque críticos. Los datos personales del estudiante nunca abandonan su dispositivo a menos que sea estrictamente necesario para una funcionalidad específica.
                                </p>
                                <p className="leading-relaxed">
                                    Esto reduce la superficie de ataque: no hay servidores que hackear, no hay bases de datos centralizadas que filtrar, no hay riesgo de brechas de datos masivas. Implementamos encriptación a nivel de navegador para datos sensibles utilizando la Web Crypto API nativa.
                                </p>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    <div className="px-4 py-2 md:px-5 md:py-3 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs md:text-sm font-semibold">
                                        ✓ Cumplimiento GDPR
                                    </div>
                                    <div className="px-4 py-2 md:px-5 md:py-3 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs md:text-sm font-semibold">
                                        🔐 Encriptación AES-256
                                    </div>
                                </div>
                            </motion.div>
                        </Slide>
                    )}

                    {/* Slide 9: Preloading */}
                    {currentSlide === 8 && (
                        <Slide key="slide9" isActive={currentSlide === 8}>
                            <div className="flex flex-col items-center justify-center h-full space-y-8">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                                    <div className="relative w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                                        <Zap className="w-16 h-16 text-indigo-400" />
                                    </div>
                                </motion.div>
                                <motion.h2 variants={childVariants} className="text-3xl md:text-7xl font-bold text-white text-center">
                                    Inicializando Sistema
                                </motion.h2>
                                <motion.div variants={childVariants} className="text-center space-y-4">
                                    <p className="text-base md:text-xl text-gray-400">
                                        Optimizando recursos y estableciendo conexiones seguras...
                                    </p>
                                </motion.div>
                            </div>
                        </Slide>
                    )}

                    {/* Slide 10: Launch */}
                    {currentSlide === 9 && (
                        <Slide key="slide10" isActive={currentSlide === 9}>
                            <div className="flex flex-col items-center gap-12">
                                <motion.div
                                    animate={{
                                        y: [0, -20, 0],
                                        rotateZ: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Rocket className="w-40 h-40 text-indigo-500 drop-shadow-[0_0_40px_rgba(99,102,241,0.7)]" />
                                </motion.div>

                                <motion.div variants={childVariants} className="text-center space-y-6 md:space-y-8">
                                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                                        Sistema Listo para Iniciar
                                    </h2>
                                    <p className="text-base md:text-xl text-gray-400 max-w-2xl">
                                        Todos los sistemas operativos. Recursos precargados. Conexiones establecidas.
                                    </p>
                                    <Button
                                        onClick={handleExit}
                                        className="text-lg md:text-2xl px-8 py-6 md:px-16 md:py-10 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 transform hover:scale-110 transition-all duration-300 shadow-2xl shadow-indigo-500/50 font-bold"
                                    >
                                        Bienvenidos a UFG Tutor
                                    </Button>
                                </motion.div>
                            </div>
                        </Slide>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8 z-50">
                <Button
                    variant="ghost"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className={`rounded-full p-4 ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                >
                    <ChevronLeft className="w-8 h-8" />
                </Button>

                <div className="flex gap-2">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/30'
                                }`}
                        />
                    ))}
                </div>

                <Button
                    variant="ghost"
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className={`rounded-full p-4 ${currentSlide === totalSlides - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                >
                    <ChevronRight className="w-8 h-8" />
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            />
        </div>
    );
}
