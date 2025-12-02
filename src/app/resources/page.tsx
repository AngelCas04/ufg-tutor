'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function ResourcesPage() {
    const [student, setStudent] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (session) {
            setStudent(JSON.parse(session));
        } else {
            router.push('/login');
        }
    }, [router]);

    if (!student) return null;

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <header className="flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="glass" size="icon" className="rounded-full">
                            ←
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Portal UFG
                        </h1>
                        <p className="text-muted-foreground">
                            Acceso al portal web de la Universidad Francisco Gavidia
                        </p>
                    </div>
                </div>
            </header>

            {/* Iframe Container */}
            <Card className="glass border-white/5 animate-fade-in animate-delay-100 overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🌐</span>
                        Portal Web UFG
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full" style={{ height: 'calc(100vh - 250px)' }}>
                        <iframe
                            src="https://webdesktop.ufg.edu.sv/"
                            className="w-full h-full border-0 rounded-b-lg"
                            title="Portal UFG"
                            allow="fullscreen"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="glass border-white/5 animate-fade-in animate-delay-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="text-xl">ℹ️</span>
                        <div>
                            <p className="font-medium text-foreground mb-1">Acceso al Portal Web</p>
                            <p>
                                Desde aquí puedes acceder a todos los servicios del portal web de la UFG,
                                incluyendo correo institucional, campus virtual, biblioteca digital, y más.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
