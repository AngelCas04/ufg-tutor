'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, type Student } from '@/lib/db';
import { useRouter } from 'next/navigation';

interface UserContextType {
    user: Student | null;
    login: (carnet: string) => Promise<boolean>;
    register: (student: Student) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const storedCarnet = localStorage.getItem('ufg_tutor_user');
            if (storedCarnet) {
                const student = await db.students.get(storedCarnet);
                if (student) {
                    setUser(student);
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    const login = async (carnet: string) => {
        const student = await db.students.get(carnet);
        if (student) {
            setUser(student);
            localStorage.setItem('ufg_tutor_user', carnet);
            return true;
        }
        return false;
    };

    const register = async (student: Student) => {
        await db.students.add(student);
        setUser(student);
        localStorage.setItem('ufg_tutor_user', student.id);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ufg_tutor_user');
        router.push('/login');
    };

    return (
        <UserContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
