'use client';

import { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Book, MessageCircle, LogOut, User } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading, logout } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900">Hola, {user.name.split(' ')[0]}</h1>
                    <p className="text-gray-600">{user.career}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-blue-900 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Tu Perfil
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-blue-100">Carnet: {user.id}</p>
                        <p className="text-blue-100">Puntos: {user.points} 🏆</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                            <Book className="h-5 w-5" />
                            Materias Inscritas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {user.subjects.map((subject, index) => (
                                <li key={index} className="p-2 bg-gray-100 rounded-md text-gray-800 text-sm">
                                    {subject}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg text-blue-900">Recomendaciones de Estudio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {user.subjects.map((subject, idx) => (
                                <div key={idx} className="p-3 border rounded-md bg-white shadow-sm">
                                    <h4 className="font-medium text-blue-800">{subject}</h4>
                                    <p className="text-sm text-gray-600">
                                        Recuerda repasar los conceptos clave de {subject}.
                                        {idx % 2 === 0 ? " Prueba hacer mapas mentales." : " Intenta explicar el tema a alguien más."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <h3 className="text-xl font-semibold text-blue-900 mb-2">¿Necesitas ayuda con tus estudios?</h3>
                        <p className="text-gray-600 mb-4">Tu tutor virtual está listo para resolver tus dudas.</p>
                        <Button size="lg" onClick={() => router.push('/chat')} className="w-full md:w-auto gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Hablar con el Tutor
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
