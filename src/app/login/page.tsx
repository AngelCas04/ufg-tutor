'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { db } from '@/lib/db';

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
            if (isLogin) {
                // Login Logic
                const student = await db.students.get(formData.carnet);
                if (student) {
                    // Simular sesión con localStorage
                    localStorage.setItem('user_session', JSON.stringify(student));
                    // Disparar evento de almacenamiento para actualizar otros componentes si es necesario
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[100px] animate-pulse animate-delay-200" />
            </div>

            <Card className="w-full max-w-md animate-fade-in glass border-white/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                        <span className="text-3xl">🎓</span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">UFG Tutor</CardTitle>
                    <CardDescription className="text-lg">
                        {isLogin ? 'Ingresa tu carnet para continuar' : 'Crea tu cuenta de estudiante'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="carnet"
                                type="text"
                                placeholder="Carnet (Ej: AB123456)"
                                value={formData.carnet}
                                onChange={handleChange}
                                className="text-center text-lg tracking-widest uppercase h-12"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-4 animate-accordion-down">
                                <Input
                                    name="nombre"
                                    type="text"
                                    placeholder="Nombre Completo"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="h-12"
                                    required={!isLogin}
                                />
                                <Input
                                    name="carrera"
                                    type="text"
                                    placeholder="Carrera (Ej: Ing. Sistemas)"
                                    value={formData.carrera}
                                    onChange={handleChange}
                                    className="h-12"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center animate-fade-in">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                            isLoading={loading}
                        >
                            {isLogin ? 'Ingresar' : 'Registrarse'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 justify-center">
                    <div className="text-sm text-center">
                        <span className="text-muted-foreground">
                            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setFormData({ carnet: '', nombre: '', carrera: '' });
                            }}
                            className="text-primary hover:underline font-medium"
                        >
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Al ingresar aceptas los términos y condiciones de uso del tutor virtual.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
