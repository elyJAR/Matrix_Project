import { openDB } from 'idb';

const DB_NAME = 'MatrixML_DB';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('projects')) {
                const store = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
                store.createIndex('updatedAt', 'updatedAt');
            }
        },
    });
};

export const getProjects = async () => {
    const db = await initDB();
    return db.getAllFromIndex('projects', 'updatedAt');
};

export const getProject = async (id) => {
    const db = await initDB();
    return db.get('projects', id);
};

export const saveProject = async (project) => {
    const db = await initDB();
    const p = {
        ...project,
        updatedAt: new Date().getTime()
    };
    if (!p.createdAt) p.createdAt = new Date().getTime();

    // If it's a new project ensuring it has an ID if valid, or autoIncrement will handle it if null
    // But we usually want to know the ID after save.
    const id = await db.put('projects', p);
    return { ...p, id };
};

export const deleteProject = async (id) => {
    const db = await initDB();
    await db.delete('projects', id);
};

export const clearAllData = async () => {
    const db = await initDB();
    await db.clear('projects');
};

export const restoreProjects = async (projects) => {
    const db = await initDB();
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    for (const p of projects) {
        await store.put(p);
    }
    await tx.done;
};
