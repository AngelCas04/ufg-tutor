'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { db } from '@/lib/db';
import Link from 'next/link';

interface Subject {
    name: string;
    progress: number;
    grade?: number;
}

export default function ProgressPage() {
    const [student, setStudent] = useState<any>(null);
    const [subjects] = useState<Subject[]>([
        { name: 'Programación I', progress: 100, grade: 8.5 },
        { name: 'Matemática Discreta', progress: 100, grade: 7.8 },
        { name: 'Base de Datos', progress: 75, grade: 8.2 },
        { name: 'Redes', progress: 60 },
        { name: 'Inteligencia Artificial', progress: 30 },
    ]);
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

    const overallProgress = Math.round(
        subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length
    );

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
            <header className="flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="glass" size="icon" className="rounded-full">
                            ←
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Mi Progreso
                        </h1>
                        <p className="text-muted-foreground">
                            {student.career}
                        </p>
                    </div>
                </div>
            </header>

            {/* Overall Progress Card */}
            <Card className="animate-fade-in glass">
                <CardHeader>
                    <CardTitle>Avance General</CardTitle>
                    <CardDescription>Tu progreso en la carrera</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {overallProgress}%
                        </span>
                        <div className="text-right text-sm text-muted-foreground">
                            <div>{subjects.length} materias</div>
                            <div>{subjects.filter(s => s.progress === 100).length} completadas</div>
                        </div>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Subjects List */}
            <div className="space-y-4 animate-fade-in animate-delay-100">
                <h2 className="text-2xl font-semibold">Materias</h2>
                {subjects.map((subject, index) => (
                    <Card key={index} className="glass hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                                    {subject.grade && (
                                        <p className="text-sm text-muted-foreground">
                                            Nota: <span className="text-accent font-bold">{subject.grade}</span>
                                        </p>
                                    )}
                                </div>
                                <span className="text-2xl font-bold text-primary">
                                    {subject.progress}%
                                </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${subject.progress === 100
                                            ? 'bg-green-500'
                                            : 'bg-gradient-to-r from-primary to-accent'
                                        }`}
                                    style={{ width: `${subject.progress}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
