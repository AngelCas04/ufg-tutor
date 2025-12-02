'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { chatWithAI, type UserContext } from '@/lib/ai';
import { type Student } from '@/lib/db';
import { FileAttachmentComponent, type FileAttachment } from '@/components/FileAttachment';
import { fileToBase64, isImageFile } from '@/lib/utils';
import { extractTextFromFile, canExtractText } from '@/lib/fileExtractor';
import Link from 'next/link';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    isTyping?: boolean;
    attachments?: FileAttachment[];
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<Student | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Auth check and load user data
        const session = localStorage.getItem('user_session');
        if (!session) {
            router.push('/login');
        } else {
            try {
                const userData = JSON.parse(session) as Student;
                setUser(userData);
            } catch (error) {
                console.error('Error parsing user session:', error);
                router.push('/login');
            }
        }
    }, [router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        await processFiles(Array.from(files));
    };

    const processFiles = async (files: File[]) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const MAX_FILES = 3;

        if (selectedFiles.length + files.length > MAX_FILES) {
            alert(`Solo puedes adjuntar un máximo de ${MAX_FILES} archivos por mensaje.`);
            return;
        }

        const newAttachments: FileAttachment[] = [];

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`El archivo "${file.name}" es muy grande. Tamaño máximo: 5MB`);
                continue;
            }

            try {
                const base64 = await fileToBase64(file);
                const attachment: FileAttachment = {
                    id: `${Date.now()}-${Math.random()}`,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    base64Data: base64
                };

                // Intentar extraer texto si es posible
                if (canExtractText(file.type, file.name)) {
                    try {
                        console.log(`Extrayendo texto de: ${file.name}`);
                        const extractedText = await extractTextFromFile(file, base64);
                        if (extractedText) {
                            attachment.extractedText = extractedText;
                            console.log(`✓ Texto extraído de ${file.name}: ${extractedText.length} caracteres`);
                        }
                    } catch (extractError) {
                        console.warn(`No se pudo extraer texto de ${file.name}:`, extractError);
                        // Continuar sin texto extraído
                    }
                }

                newAttachments.push(attachment);
            } catch (error) {
                console.error('Error processing file:', error);
                alert(`Error al procesar el archivo "${file.name}"`);
            }
        }

        setSelectedFiles(prev => [...prev, ...newAttachments]);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        await processFiles(files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeFile = (id: string) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && selectedFiles.length === 0) || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input || '(Archivos adjuntos)',
            attachments: selectedFiles.length > 0 ? [...selectedFiles] : undefined
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setSelectedFiles([]);
        setLoading(true);

        try {
            // Prepare user context if available
            const userContext: UserContext | undefined = user
                ? { name: user.name, career: user.career }
                : undefined;

            const aiResponse = await chatWithAI([...messages, userMessage], userContext);

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
                            {user ? `Hola, ${user.name.split(' ')[0]} • ${user.career}` : 'Potenciado por IA • UFG'}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMessages([])}>
                    Limpiar Chat
                </Button>
            </header>

            {/* Chat Area */}
            <Card
                className={`flex-1 flex flex-col overflow-hidden glass border-white/5 animate-fade-in animate-delay-100 ${isDragging ? 'ring-2 ring-primary/50' : ''
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
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
                                    <>
                                        <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                                            {msg.content}
                                        </p>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {msg.attachments.map((attachment) => (
                                                    <FileAttachmentComponent
                                                        key={attachment.id}
                                                        attachment={attachment}
                                                        showRemove={false}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-secondary/80 backdrop-blur-md border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background/40 backdrop-blur-md border-t border-white/5">
                    {/* File Preview Area */}
                    {selectedFiles.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {selectedFiles.map((file) => (
                                <FileAttachmentComponent
                                    key={file.id}
                                    attachment={file}
                                    onRemove={() => removeFile(file.id)}
                                    showRemove={true}
                                />
                            ))}
                        </div>
                    )}

                    {/* Drag & Drop Indicator */}
                    {isDragging && (
                        <div className="mb-3 p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 text-center">
                            <p className="text-sm text-primary">Suelta los archivos aquí</p>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                            className="shrink-0"
                        >
                            📎
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu pregunta aquí..."
                            className="flex-1 bg-secondary/50 border-white/10 focus:bg-secondary/80"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={loading || (!input.trim() && selectedFiles.length === 0)}
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
// Typing animation component for the message content
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

// Telegram-style typing indicator
function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 h-5">
            {[0, 1, 2].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-2 h-2 bg-primary/70 rounded-full"
                    initial={{ y: 0 }}
                    animate={{ y: -5 }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: dot * 0.15
                    }}
                />
            ))}
        </div>
    );
}
