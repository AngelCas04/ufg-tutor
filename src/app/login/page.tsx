'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { db } from '@/lib/db';
import { User, CreditCard, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        carnet: '',
        nombre: '',
        carrera: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Reset error when switching modes
    useEffect(() => {
        setError('');
    }, [isLogin]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'carnet' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Simulate network delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));

            if (isLogin) {
                // Login Logic
                const student = await db.students.get(formData.carnet);
                if (student) {
                    localStorage.setItem('user_session', JSON.stringify(student));
                    window.dispatchEvent(new Event('storage'));
                    router.push('/');
                } else {
                    setError('Carnet no encontrado. Por favor regístrate.');
                }
            } else {
                // Register Logic
                const existing = await db.students.get(formData.carnet);
                if (existing) {
                    setError('Este carnet ya está registrado.');
                } else {
                    const newStudent = {
                        id: formData.carnet,
                        name: formData.nombre,
                        career: formData.carrera,
                        subjects: [],
                        history: [],
                        points: 0
                    };
                    await db.students.add(newStudent);
                    localStorage.setItem('user_session', JSON.stringify(newStudent));
                    window.dispatchEvent(new Event('storage'));
                    router.push('/');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black text-white selection:bg-indigo-500/30">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="relative z-10 w-full max-w-md p-1"
            >
                {/* Glass Container */}
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

                    {/* Header Section */}
                    <div className="p-8 pb-0 text-center relative">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/25"
                        >
                            <div className="w-full h-full rounded-2xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-indigo-300" />
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-2"
                        >
                            UFG Tutor
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-indigo-200/60 text-sm"
                        >
                            Tu asistente académico inteligente
                        </motion.p>

                        {/* Toggle Switch */}
                        <div className="mt-8 p-1 bg-white/5 rounded-xl flex relative">
                            <motion.div
                                className="absolute top-1 bottom-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 shadow-sm"
                                initial={false}
                                animate={{
                                    x: isLogin ? 0 : "100%",
                                    width: "50%"
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-200 ${isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-200 ${!isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'login' : 'register'}
                                    initial={{ x: isLogin ? -20 : 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: isLogin ? 20 : -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-5"
                                >
                                    {/* Carnet Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-indigo-200/70 ml-1">Carnet de Estudiante</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <CreditCard className="h-5 w-5 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                            </div>
                                            <Input
                                                name="carnet"
                                                placeholder="Ej: AB123456"
                                                value={formData.carnet}
                                                onChange={handleChange}
                                                className="pl-12 bg-white/5 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-12 text-lg tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Register Fields */}
                                    {!isLogin && (
                                        <>
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-5 overflow-hidden"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-indigo-200/70 ml-1">Nombre Completo</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <User className="h-5 w-5 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                                        </div>
                                                        <Input
                                                            name="nombre"
                                                            placeholder="Tu nombre completo"
                                                            value={formData.nombre}
                                                            onChange={handleChange}
                                                            className="pl-12 bg-white/5 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-12"
                                                            required={!isLogin}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-indigo-200/70 ml-1">Carrera</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <GraduationCap className="h-5 w-5 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                                        </div>
                                                        <Input
                                                            name="carrera"
                                                            placeholder="Ej: Ingeniería en Sistemas"
                                                            value={formData.carrera}
                                                            onChange={handleChange}
                                                            className="pl-12 bg-white/5 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-12"
                                                            required={!isLogin}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/30 border border-white/10 rounded-xl group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLogin ? 'Ingresar al Portal' : 'Crear Cuenta'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-black/20 border-t border-white/5 text-center">
                        <p className="text-xs text-indigo-200/40">
                            © 2024 Universidad Francisco Gavidia
                            <br />
                            Potenciado por Inteligencia Artificial
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
