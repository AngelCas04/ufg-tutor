import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';

/**
 * Extrae texto de una imagen usando OCR (Tesseract.js)
 */
export async function extractTextFromImage(base64Data: string): Promise<string> {
    try {
        console.log('Iniciando OCR de imagen...');
        const worker = await createWorker('spa'); // Español

        const { data: { text } } = await worker.recognize(base64Data);
        await worker.terminate();

        console.log('OCR completado');
        return text.trim();
    } catch (error) {
        console.error('Error en OCR:', error);
        throw new Error('No se pudo extraer texto de la imagen');
    }
}

/**
 * Extrae texto de un archivo .docx
 */
export async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
        console.log('Extrayendo texto de .docx...');
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log('Extracción de .docx completada');
        return result.value.trim();
    } catch (error) {
        console.error('Error extrayendo .docx:', error);
        throw new Error('No se pudo extraer texto del documento Word');
    }
}

/**
 * Extrae texto de un archivo PDF
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
        console.log('Extrayendo texto de PDF...');

        // Importación dinámica para evitar errores de SSR
        const pdfjsLib = await import('pdfjs-dist');

        // Configurar worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        console.log('Extracción de PDF completada');
        return fullText.trim();
    } catch (error) {
        console.error('Error extrayendo PDF:', error);
        throw new Error('No se pudo extraer texto del PDF');
    }
}

/**
 * Extrae texto de un archivo .txt
 */
export function extractTextFromTxt(arrayBuffer: ArrayBuffer): string {
    try {
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(arrayBuffer).trim();
    } catch (error) {
        console.error('Error extrayendo .txt:', error);
        throw new Error('No se pudo leer el archivo de texto');
    }
}

/**
 * Convierte File a ArrayBuffer
 */
async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Función principal que detecta el tipo de archivo y extrae el texto apropiadamente
 */
export async function extractTextFromFile(file: File, base64Data?: string): Promise<string> {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    try {
        // Imágenes - usar OCR
        if (fileType.startsWith('image/')) {
            if (!base64Data) {
                throw new Error('Se requiere base64Data para imágenes');
            }
            return await extractTextFromImage(base64Data);
        }

        // Convertir a ArrayBuffer para otros tipos
        const arrayBuffer = await fileToArrayBuffer(file);

        // Documentos Word
        if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
            return await extractTextFromDocx(arrayBuffer);
        }

        // PDFs
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            return await extractTextFromPdf(arrayBuffer);
        }

        // Archivos de texto
        if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
            return extractTextFromTxt(arrayBuffer);
        }

        // Tipo no soportado
        return '';
    } catch (error) {
        console.error('Error extrayendo texto:', error);
        throw error;
    }
}

/**
 * Verifica si un archivo puede tener texto extraído
 */
export function canExtractText(fileType: string, fileName: string): boolean {
    const type = fileType.toLowerCase();
    const name = fileName.toLowerCase();

    return (
        type.startsWith('image/') ||
        type.includes('wordprocessingml') ||
        name.endsWith('.docx') ||
        type === 'application/pdf' ||
        name.endsWith('.pdf') ||
        type.startsWith('text/') ||
        name.endsWith('.txt')
    );
}
