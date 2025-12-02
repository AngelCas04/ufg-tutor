import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const directoryPath = path.join(process.cwd(), 'public', 'calendario');

        if (!fs.existsSync(directoryPath)) {
            return NextResponse.json({ images: [] });
        }

        const files = fs.readdirSync(directoryPath);

        const images = files
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
            .sort((a, b) => {
                // Sort numerically (1.jpg before 10.jpg)
                const numA = parseInt(a.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.replace(/\D/g, '')) || 0;
                return numA - numB;
            })
            .map(file => `/calendario/${file}`);

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Error reading calendar directory:', error);
        return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
    }
}
