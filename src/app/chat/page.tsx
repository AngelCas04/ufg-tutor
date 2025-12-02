'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { chatWithAI } from '@/lib/ai';
import Link from 'next/link';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    isTyping?: boolean;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Auth check
        const session = localStorage.getItem('user_session');
        if (!session) {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const aiResponse = await chatWithAI([...messages, userMessage]);

            // Add message with typing effect
            const assistantMessage: Message = {
                role: 'assistant',
                content: aiResponse || 'Lo siento, no pude generar una respuesta.',
                isTyping: true
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Remove typing flag after animation
            setTimeout(() => {
                setMessages(prev =>
                    prev.map((msg, idx) =>
                        idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
                    )
                );
            }, 100);
        } catch (error) {
            console.error('Error al chatear:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el tutor.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto p-4 md:p-6 h-screen">
            {/* Header */}
            <header className="flex items-center justify-between mb-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="glass" size="icon" className="rounded-full">
                            ←
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Tutor Virtual
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Potenciado por IA • UFG
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMessages([])}>
                    Limpiar Chat
                </Button>
            </header>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden glass border-white/5 animate-fade-in animate-delay-100">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground opacity-50">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <span className="text-4xl">💬</span>
                            </div>
                            <h3 className="text-xl font-medium mb-2">¡Hola! Soy tu tutor virtual</h3>
                            <p className="max-w-xs">
                                Pregúntame sobre tus materias, tareas o cualquier duda académica que tengas.
                            </p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none animate-slide-in-right'
                                        : 'bg-secondary/80 text-secondary-foreground rounded-bl-none backdrop-blur-md border border-white/5 animate-slide-in-left'
                                    }`}
                            >
                                {msg.isTyping && msg.role === 'assistant' ? (
                                    <TypingText text={msg.content} />
                                ) : (
                                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                                        {msg.content}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-bounce-in">
                            <div className="bg-secondary/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce animate-delay-100" />
                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce animate-delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background/40 backdrop-blur-md border-t border-white/5">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu pregunta aquí..."
                            className="flex-1 bg-secondary/50 border-white/10 focus:bg-secondary/80"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20"
                        >
                            Enviar
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}

// Typing animation component
function TypingText({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 15); // Speed of typing (milliseconds per character)

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text]);

    return (
        <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
            {displayedText}
            {currentIndex < text.length && (
                <span className="inline-block w-[2px] h-4 bg-current ml-1 animate-pulse" />
            )}
        </p>
    );
}
