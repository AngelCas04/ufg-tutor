'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export default function ResourcesPage() {
    const [student, setStudent] = useState<any>(null);
    const [iframeError, setIframeError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (session) {
            setStudent(JSON.parse(session));
        } else {
            router.push('/login');
        }
    }, [router]);

    // Removed cross-origin check that causes SecurityError

    if (!student) return null;

    return (
        <div className="fixed inset-0 flex flex-col bg-background">
            {/* Compact Header */}
            <header className="flex items-center justify-between p-3 bg-background/95 backdrop-blur-sm border-b border-white/5 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button variant="glass" size="icon" className="rounded-full h-9 w-9">
                            ←
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Portal UFG
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground hidden md:block">
                        {student.name} • {student.career}
                    </p>
                    <a
                        href="https://webdesktop.ufg.edu.sv/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                    >
                        Abrir en nueva pestaña ↗
                    </a>
                </div>
            </header>

            {/* Fullscreen Iframe */}
            <div className="flex-1 relative">
                {iframeError ? (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <Card className="glass border-white/5 max-w-md">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="text-6xl">🔒</div>
                                <h2 className="text-xl font-bold">No se puede cargar en iframe</h2>
                                <p className="text-muted-foreground">
                                    El portal UFG no permite ser cargado dentro de esta aplicación por razones de seguridad.
                                </p>
                                <a
                                    href="https://webdesktop.ufg.edu.sv/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="w-full bg-gradient-to-r from-primary to-accent">
                                        Abrir Portal UFG en nueva pestaña ↗
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <iframe
                        src="https://webdesktop.ufg.edu.sv/"
                        className="absolute inset-0 w-full h-full border-0"
                        title="Portal UFG"
                        allow="fullscreen"
                        referrerPolicy="no-referrer"
                        onError={() => setIframeError(true)}
                    />
                )}
            </div>
        </div>
    );
}
