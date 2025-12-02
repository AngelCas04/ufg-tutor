import { InferenceClient } from "@huggingface/inference";

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

const client = new InferenceClient(HF_TOKEN);

// Lista de modelos con proveedores específicos que soportan chatCompletion
const AI_MODELS = [
    'deepseek-ai/DeepSeek-V3.2-Exp:novita',
    'meta-llama/Llama-3.1-8B-Instruct:novita',
    'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai',
    'HuggingFaceH4/zephyr-7b-beta:featherless-ai',
];

// Modelos con soporte multimodal (visión) - para referencia futura
const VISION_MODELS = [
    'Qwen/Qwen2-VL-7B-Instruct',
    'llava-hf/llava-1.5-7b-hf',
];

export interface UserContext {
    name: string;
    career: string;
}

export interface FileAttachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    base64Data: string;
    extractedText?: string;
}

export interface MessageWithAttachments {
    role: string;
    content: string;
    attachments?: FileAttachment[];
}

export async function chatWithAI(
    messages: MessageWithAttachments[],
    userContext?: UserContext
) {
    if (!HF_TOKEN) {
        console.error('No se encontró el token de Hugging Face');
        return 'Error: No se ha configurado el token de Hugging Face.';
    }

    // Detectar si hay imágenes en los mensajes
    const hasImages = messages.some(msg =>
        msg.attachments?.some(att => att.fileType.startsWith('image/'))
    );

    // Agregar mensaje de sistema si no existe
    let systemContent = 'Eres un tutor académico útil y amigable de la Universidad Francisco Gavidia (UFG). Ayudas a los estudiantes con sus dudas académicas de manera clara y concisa.';

    // Agregar contexto del usuario si está disponible
    if (userContext) {
        systemContent += `\n\nEstás ayudando a ${userContext.name}, estudiante de ${userContext.career}. Personaliza tus respuestas considerando su área de estudio.`;
    }

    if (hasImages) {
        systemContent += '\n\nEl usuario ha compartido imágenes. Aunque no puedo ver las imágenes directamente, puedo ayudarte con preguntas sobre el contexto o el tema relacionado.';
    }

    const systemMessage: MessageWithAttachments = {
        role: 'system',
        content: systemContent
    };

    const messagesWithSystem = messages[0]?.role === 'system'
        ? messages
        : [systemMessage, ...messages];

    // Preparar mensajes para el modelo incluyendo texto extraído
    const textMessages = messagesWithSystem.map((msg: MessageWithAttachments) => {
        let content = msg.content;

        if (msg.attachments && msg.attachments.length > 0) {
            // Agregar texto extraído de archivos
            msg.attachments.forEach((att: FileAttachment) => {
                if (att.extractedText) {
                    // Limitar texto extraído a 2000 caracteres para no exceder límites
                    const truncatedText = att.extractedText.length > 2000
                        ? att.extractedText.substring(0, 2000) + '...[texto truncado]'
                        : att.extractedText;

                    content += `\n\n[Contenido de "${att.fileName}":\n${truncatedText}]`;
                } else {
                    // Si no hay texto extraído, solo mencionar el archivo
                    const fileType = att.fileType.startsWith('image/') ? 'imagen' : 'archivo';
                    content += `\n\n[El usuario ha adjuntado ${fileType}: ${att.fileName}]`;
                }
            });
        }

        return {
            role: msg.role,
            content: content
        };
    });

    // Intentar con cada modelo en orden
    for (const model of AI_MODELS) {
        try {
            console.log(`Intentando con modelo: ${model}`);

            const chatCompletion = await client.chatCompletion({
                model: model,
                messages: textMessages as any,
                max_tokens: 500,
                temperature: 0.7,
            });

            const response = chatCompletion.choices[0]?.message?.content;

            if (response) {
                console.log(`✓ Éxito con modelo: ${model}`);
                return response;
            } else {
                throw new Error('Respuesta vacía del modelo');
            }

        } catch (error: any) {
            console.error(`✗ Error con modelo ${model}:`, error.message);
            continue;
        }
    }

    // Si todos los modelos fallan
    console.error('Todos los modelos fallaron');
    return 'Lo siento, el servicio de IA no está disponible en este momento. Por favor intenta más tarde.';
}
