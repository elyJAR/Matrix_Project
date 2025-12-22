import React, { createContext, useContext, useState, useEffect } from 'react';
import * as db from '../services/db';

const MatrixContext = createContext();

export const useMatrix = () => {
    return useContext(MatrixContext);
};

export const MatrixProvider = ({ children }) => {
    // Global Project State
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Editor/Operation State (Transient)
    const [editingMatrixId, setEditingMatrixId] = useState(null);
    const [currentResult, setCurrentResult] = useState(null);
    const [currentResultType, setCurrentResultType] = useState('matrix');
    const [lastOperation, setLastOperation] = useState(null);

    // Load projects on startup
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const list = await db.getProjects();
            setProjects(list.sort((a, b) => b.updatedAt - a.updatedAt));
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (name, initialMatrices = null) => {
        const defaultMatrices = [
            {
                id: 'mat_a_' + Date.now(),
                name: 'Matrix A',
                rows: 3,
                cols: 3,
                data: [['1', '0', '0'], ['0', '1', '0'], ['0', '0', '1']]
            },
            {
                id: 'mat_b_' + Date.now(),
                name: 'Matrix B',
                rows: 3,
                cols: 3,
                data: [['4', '-2', '1'], ['0', '5', '3'], ['1', '1', '9']]
            }
        ];

        const newProject = {
            name,
            matrices: initialMatrices || defaultMatrices,
            history: []
        };
        const saved = await db.saveProject(newProject);
        setProjects(prev => [saved, ...prev]);
        setCurrentProject(saved);
        return saved;
    };

    const loadProject = async (id) => {
        const p = await db.getProject(id);
        if (p) setCurrentProject(p);
    };

    const deleteProject = async (id) => {
        await db.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
        if (currentProject?.id === id) setCurrentProject(null);
    };

    const renameProject = async (id, newName) => {
        const project = projects.find(p => p.id === id);
        if (project) {
            const updated = { ...project, name: newName };
            await db.saveProject(updated);
            setProjects(prev => prev.map(p => p.id === id ? updated : p));
            if (currentProject?.id === id) setCurrentProject(updated);
        }
    };

    // Proxies for current project modification
    // We assume these are called only when currentProject is valid

    const saveProjectChanges = async (updatedProject) => {
        // Optimistic update
        setCurrentProject(updatedProject);
        // Persist
        await db.saveProject(updatedProject);
        // Update list reflection
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    };

    const setMatrices = (newMatricesOrFn) => {
        if (!currentProject) return;

        let newMatrices;
        if (typeof newMatricesOrFn === 'function') {
            newMatrices = newMatricesOrFn(currentProject.matrices);
        } else {
            newMatrices = newMatricesOrFn;
        }

        const updated = { ...currentProject, matrices: newMatrices };
        saveProjectChanges(updated);
    };

    const updateMatrix = (id, newData) => {
        if (!currentProject) return;
        const newMatrices = currentProject.matrices.map(m => m.id === id ? { ...m, ...newData } : m);
        const updated = { ...currentProject, matrices: newMatrices };
        saveProjectChanges(updated);
    };

    const addMatrix = (matrix) => {
        if (!currentProject) return;
        const newMatrices = [...currentProject.matrices, { ...matrix, id: matrix.id || `mat_${Date.now()}` }];
        saveProjectChanges({ ...currentProject, matrices: newMatrices });
    };

    const deleteMatrix = (id) => {
        if (!currentProject) return;
        const newMatrices = currentProject.matrices.filter(m => m.id !== id);
        saveProjectChanges({ ...currentProject, matrices: newMatrices });
    };

    const addHistoryItem = (item) => {
        if (!currentProject) return;
        const newHistory = [item, ...currentProject.history];
        saveProjectChanges({ ...currentProject, history: newHistory });
    };

    const setOperationResult = (result, type, opName) => {
        setCurrentResult(result);
        setCurrentResultType(type);
        setLastOperation(opName);
    };

    const clearData = async () => {
        await db.clearAllData();
        setProjects([]);
        setCurrentProject(null);
        setEditingMatrixId(null);
        setCurrentResult(null);
    };

    const importData = async (data) => {
        if (!Array.isArray(data)) throw new Error("Invalid data format");
        await db.restoreProjects(data);
        await loadProjects();
    };

    const deleteHistoryItem = (id) => {
        if (!currentProject) return;
        const newHistory = currentProject.history.filter(h => h.id !== id);
        saveProjectChanges({ ...currentProject, history: newHistory });
    };

    return (
        <MatrixContext.Provider value={{
            loading,
            projects,
            currentProject,
            createProject,
            loadProject,
            deleteProject,
            renameProject,
            clearData,
            importData,

            // Current Project Helpers (Mapped to currentProject)
            matrices: currentProject?.matrices || [],
            history: currentProject?.history || [],
            setMatrices,
            updateMatrix,
            addMatrix,
            deleteMatrix,
            addHistoryItem,
            deleteHistoryItem,

            // Editor State
            editingMatrixId,
            setEditingMatrixId,

            // Results
            currentResult,
            currentResultType,
            lastOperation,
            setOperationResult
        }}>
            {children}
        </MatrixContext.Provider>
    );
};
