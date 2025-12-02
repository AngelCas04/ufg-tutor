import { InferenceClient } from "@huggingface/inference";

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

const client = new InferenceClient(HF_TOKEN);

// Lista de modelos con proveedores específicos que soportan chatCompletion
const AI_MODELS = [
    'meta-llama/Llama-3.1-8B-Instruct:novita',
    'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai',
    'HuggingFaceH4/zephyr-7b-beta:featherless-ai',
];

export async function chatWithAI(messages: { role: string; content: string }[]) {
    if (!HF_TOKEN) {
        console.error('No se encontró el token de Hugging Face');
        return 'Error: No se ha configurado el token de Hugging Face.';
    }

    // Agregar mensaje de sistema si no existe
    const systemMessage = {
        role: 'system',
        content: 'Eres un tutor académico útil y amigable de la Universidad Francisco Gavidia (UFG). Ayudas a los estudiantes con sus dudas académicas de manera clara y concisa.'
    };

    const messagesWithSystem = messages[0]?.role === 'system'
        ? messages
        : [systemMessage, ...messages];

    // Intentar con cada modelo en orden
    for (const model of AI_MODELS) {
        try {
            console.log(`Intentando con modelo: ${model}`);

            const chatCompletion = await client.chatCompletion({
                model: model,
                messages: messagesWithSystem as any,
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
