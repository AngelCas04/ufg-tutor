import Dexie, { type EntityTable } from 'dexie';

interface Student {
    id: string; // Carnet
    name: string;
    career: string;
    subjects: string[];
    history: string[]; // Chat history IDs or summaries
    points: number;
}

const db = new Dexie('UFGTutorDB') as Dexie & {
    students: EntityTable<Student, 'id'>;
};

db.version(1).stores({
    students: 'id, name, career, points'
});

export type { Student };
export { db };
