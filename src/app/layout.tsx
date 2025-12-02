import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import BackgroundVideo from "@/components/ui/BackgroundVideo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "UFG Tutor",
    description: "Asistente académico para estudiantes de la UFG",
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <BackgroundVideo />
                <UserProvider>
                    {children}
                </UserProvider>
            </body>
        </html>
    );
}
