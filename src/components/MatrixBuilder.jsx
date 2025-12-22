import React, { useState, useEffect } from 'react';
import { useMatrix } from '../context/MatrixContext';

const MatrixBuilder = ({ onBack }) => {
    const { matrices, editingMatrixId, updateMatrix, setEditingMatrixId } = useMatrix();

    // Default state
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [matrix, setMatrix] = useState([]);
    const [matrixName, setMatrixName] = useState("New Matrix");

    // Load from context if editing
    useEffect(() => {
        if (editingMatrixId) {
            const m = matrices.find(mat => mat.id === editingMatrixId);
            if (m) {
                setRows(m.rows);
                setCols(m.cols);
                setMatrix(m.data);
                setMatrixName(m.name);
            }
        } else {
            // New Matrix
            const newMatrix = Array(3).fill().map(() => Array(3).fill('0'));
            setMatrix(newMatrix);
            setMatrixName("New Matrix");
        }
    }, [editingMatrixId, matrices]);

    const updateMatrixSize = (newRows, newCols) => {
        setMatrix(prev => {
            const newMatrix = Array(newRows).fill().map((_, r) => {
                return Array(newCols).fill().map((_, c) => {
                    if (prev[r] && prev[r][c] !== undefined) {
                        return prev[r][c];
                    }
                    return '0';
                });
            });
            return newMatrix;
        });
    };

    const handleRowsChange = (val) => {
        const newRows = Math.max(1, Math.min(6, parseInt(val) || 1));
        setRows(newRows);
        updateMatrixSize(newRows, cols);
    };

    const handleColsChange = (val) => {
        const newCols = Math.max(1, Math.min(6, parseInt(val) || 1));
        setCols(newCols);
        updateMatrixSize(rows, newCols);
    };

    const handleCellChange = (r, c, value) => {
        const newMatrix = [...matrix];
        newMatrix[r] = [...newMatrix[r]];
        newMatrix[r][c] = value;
        setMatrix(newMatrix);
    };

    const handleSave = () => {
        if (editingMatrixId) {
            updateMatrix(editingMatrixId, {
                rows,
                cols,
                data: matrix,
                name: matrixName
            });
        }
        setEditingMatrixId(null); // Clear editing state
        onBack();
    };

    const handleCancel = () => {
        setEditingMatrixId(null);
        onBack();
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display mx-auto max-w-md md:max-w-2xl lg:max-w-4xl shadow-2xl border-x border-slate-200 dark:border-slate-800">
            {/* TopAppBar */}
            <header className="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                <button
                    onClick={handleCancel}
                    className="text-base font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">{editingMatrixId ? 'Edit Matrix' : 'New Matrix'}</h2>
                <div className="w-[50px] flex justify-end">
                    <button
                        className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">restart_alt</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-6 p-4">
                {/* Section 1: Matrix Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Matrix Name</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-500">edit</span>
                        </div>
                        <input
                            className="form-input block w-full rounded-lg border-0 py-3.5 pl-10 bg-white dark:bg-[#1c1f27] text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-[#3b4354] placeholder:text-slate-400 dark:placeholder:text-[#9da6b9] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-base sm:leading-6 font-display"
                            placeholder="e.g., Transformation Matrix"
                            type="text"
                            value={matrixName}
                            onChange={(e) => setMatrixName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Section 2: Dimensions */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Dimensions</h3>
                    <div className="flex gap-4">
                        {/* Rows Stepper */}
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Rows</label>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleRowsChange(rows - 1)}
                                    className="shrink-0 flex items-center justify-center w-12 h-12 rounded-l-lg bg-slate-200 dark:bg-[#1c1f27] border-y border-l border-slate-300 dark:border-[#3b4354] text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-[#2a2f3a] active:bg-primary active:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">remove</span>
                                </button>
                                <input
                                    className="form-input flex-1 h-12 w-full min-w-0 text-center border-y border-slate-300 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] text-slate-900 dark:text-white focus:ring-0 focus:border-primary z-10 font-bold text-lg p-0"
                                    readOnly
                                    type="number"
                                    value={rows}
                                />
                                <button
                                    onClick={() => handleRowsChange(rows + 1)}
                                    className="shrink-0 flex items-center justify-center w-12 h-12 rounded-r-lg bg-slate-200 dark:bg-[#1c1f27] border-y border-r border-slate-300 dark:border-[#3b4354] text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-[#2a2f3a] active:bg-primary active:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </div>
                        </div>
                        {/* Columns Stepper */}
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Columns</label>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleColsChange(cols - 1)}
                                    className="shrink-0 flex items-center justify-center w-12 h-12 rounded-l-lg bg-slate-200 dark:bg-[#1c1f27] border-y border-l border-slate-300 dark:border-[#3b4354] text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-[#2a2f3a] active:bg-primary active:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">remove</span>
                                </button>
                                <input
                                    className="form-input flex-1 h-12 w-full min-w-0 text-center border-y border-slate-300 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] text-slate-900 dark:text-white focus:ring-0 focus:border-primary z-10 font-bold text-lg p-0"
                                    readOnly
                                    type="number"
                                    value={cols}
                                />
                                <button
                                    onClick={() => handleColsChange(cols + 1)}
                                    className="shrink-0 flex items-center justify-center w-12 h-12 rounded-r-lg bg-slate-200 dark:bg-[#1c1f27] border-y border-r border-slate-300 dark:border-[#3b4354] text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-[#2a2f3a] active:bg-primary active:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-[#2a2f3a] w-full my-1"></div>

                {/* Section 3: Values Grid */}
                <div className="flex flex-col gap-3 flex-1 min-h-[300px]">
                    <div className="flex justify-between items-end">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Matrix Values</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-200 dark:bg-[#1c1f27] px-2 py-1 rounded">{rows} × {cols}</span>
                    </div>
                    {/* Matrix Container */}
                    <div className="bg-white dark:bg-[#0f131a] border border-slate-200 dark:border-[#2a2f3a] rounded-xl p-4 flex-1 overflow-auto no-scrollbar shadow-inner flex items-center justify-center">
                        {/* The Grid itself */}
                        <div
                            className="grid gap-3 mx-auto"
                            style={{ gridTemplateColumns: `repeat(${cols}, minmax(70px, 100px))` }}
                        >
                            {matrix.map((row, rIndex) => (
                                row && row.map((cell, cIndex) => (
                                    <div key={`${rIndex}-${cIndex}`} className="relative aspect-square w-full">
                                        <input
                                            className="w-full h-full text-center rounded-lg bg-slate-50 dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-xl font-medium outline-none transition-all p-0"
                                            inputMode="decimal"
                                            placeholder="0"
                                            type="number"
                                            value={cell}
                                            onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                                        />
                                        <span className="absolute top-1 left-2 text-[10px] text-slate-400 pointer-events-none hidden sm:block">{rIndex + 1},{cIndex + 1}</span>
                                    </div>
                                ))
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 w-full z-50 p-4 pb-8 flex flex-col gap-3 pointer-events-none">
                <div className="bg-background-light/95 dark:bg-background-dark/95 border-t border-slate-200 dark:border-[#2a2f3a] backdrop-blur-md p-4 pb-8 mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] pointer-events-auto rounded-t-2xl">
                    <button onClick={handleSave} className="w-full bg-primary hover:bg-blue-600 text-white font-bold h-14 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">save</span>
                        Save Matrix
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatrixBuilder;
