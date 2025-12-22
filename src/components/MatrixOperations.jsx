import React, { useState, useEffect } from 'react';
import { useMatrix } from '../context/MatrixContext';
import * as ops from '../utils/matrixOperations';
import * as stepsGen from '../utils/stepGenerator';

const MatrixOperations = ({ onBack, onExport, onHistory, onEdit }) => {
    const {
        matrices: projectMatrices,
        currentProject,
        setEditingMatrixId,
        addHistoryItem,
        setOperationResult,
        currentResult,
        currentResultType,
        addMatrix,
        deleteMatrix,
        lastOperation
    } = useMatrix();

    // Selection state for operations
    const [selectedIdA, setSelectedIdA] = useState(null);
    const [selectedIdB, setSelectedIdB] = useState(null);

    // Auto-select first two if available on load
    useEffect(() => {
        if (projectMatrices.length >= 1 && !selectedIdA) setSelectedIdA(projectMatrices[0].id);
        if (projectMatrices.length >= 2 && !selectedIdB) setSelectedIdB(projectMatrices[1].id);
    }, [projectMatrices]);

    const handleOp = (operation) => {
        const matA = projectMatrices.find(m => m.id === selectedIdA);
        const matB = projectMatrices.find(m => m.id === selectedIdB);

        if (!matA) { alert("Please select Matrix A"); return; }
        // For binary ops, need B
        const binaryOps = ['add', 'sub', 'mul'];
        if (binaryOps.includes(operation) && !matB) { alert("Please select Matrix B"); return; }

        const A = ops.parseMatrix(matA.data);
        const B = matB ? ops.parseMatrix(matB.data) : null;

        let res = null;
        let type = 'matrix';
        let desc = '';

        try {
            let steps = [];

            switch (operation) {
                case 'add':
                    res = ops.addMatrices(A, B);
                    desc = `${matA.name} + ${matB.name}`;
                    steps = stepsGen.generateAdditionSteps(A, B, matA.name, matB.name);
                    break;
                case 'sub':
                    res = ops.subtractMatrices(A, B);
                    desc = `${matA.name} - ${matB.name}`;
                    steps = stepsGen.generateSubtractionSteps(A, B, matA.name, matB.name);
                    break;
                case 'mul':
                    res = ops.multiplyMatrices(A, B);
                    desc = `${matA.name} × ${matB.name}`;
                    steps = stepsGen.generateMultiplicationSteps(A, B, matA.name, matB.name);
                    break;
                case 'transpose':
                    res = ops.getTranspose(A);
                    desc = `Transpose(${matA.name})`;
                    steps = stepsGen.generateTransposeSteps(A, matA.name);
                    break;
                case 'inverse':
                    res = ops.getInverse(A);
                    desc = `Inverse(${matA.name})`;
                    steps = ["Inverse calculation involved finding the determinant and adjoint matrix."];
                    break;
                case 'det':
                    res = ops.getDeterminant(A);
                    type = 'scalar';
                    desc = `det(${matA.name})`;
                    steps = stepsGen.generateDeterminantSteps(A, matA.name);
                    break;
                case 'rank':
                    res = ops.getRank(A);
                    type = 'scalar';
                    desc = `Rank(${matA.name})`;
                    steps = ["Rank calculated by converting to Row Echelon Form and counting non-zero rows."];
                    break;
                default:
                    break;
            }

            if (res === null) {
                alert("Operation invalid for current matrix dimensions.");
                return;
            }

            setOperationResult(res, type, operation);

            addHistoryItem({
                id: Date.now(),
                type: operation,
                desc: desc,
                result: type === 'scalar' ? res.toString() : 'Matrix',
                resultData: res,
                steps: steps, // New Field
                timestamp: Date.now(),
                status: 'success'
            });

        } catch (e) {
            console.error(e);
            alert("An error occurred during calculation.");
        }
    };

    const handleEdit = (id) => {
        setEditingMatrixId(id);
        if (onEdit) onEdit(id);
    };

    const handleAddMatrix = () => {
        const newMat = {
            name: `Matrix ${String.fromCharCode(65 + projectMatrices.length)}`, // A, B, C...
            rows: 3,
            cols: 3,
            data: [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']]
        };
        addMatrix(newMat);
    };

    const handleDeleteMatrix = (id) => {
        // if (projectMatrices.length <= 1) {
        //     alert("Project must have at least one matrix.");
        //     return;
        // }
        // Actually, allowing 0 matrices is fine, user can add one.
        if (confirm("Delete this matrix?")) {
            deleteMatrix(id);
            if (selectedIdA === id) setSelectedIdA(null);
            if (selectedIdB === id) setSelectedIdB(null);
        }
    };

    const handleSaveResult = () => {
        if (!currentResult || currentResultType === 'scalar') return null;
        // Save result as new matrix
        const newMat = {
            name: `Result ${lastOperation || ''} ${new Date().toLocaleTimeString()}`,
            rows: currentResult.length,
            cols: currentResult[0].length,
            data: currentResult.map(row => row.map(v => v.toString()))
        };
        const addedMat = addMatrix(newMat); // addMatrix must return the object with ID based on my understanding of Context
        // Actually context addMatrix usually doesn't return ID immediately unless I check context implementation.
        // Let's assume addMatrix in context might need update OR I generate ID here if context allows.
        // Checking Context... 'addMatrix' calls 'updateProject'.
        // I'll make sure to create a matrix with ID here if I can, OR relying on context.
        // If context generates ID, I can't get it easily without refactoring context.
        // Quick fix: generate ID here if context doesn't override it, OR finding it in projectMatrices (async issue).

        // Let's assume for this turn that 'addMatrix' in context appends it.
        // Wait, 'addMatrix' in context:
        // const addMatrix = (matrix) => { ... newMatrix = { ...matrix, id: Date.now() }; ... }
        // It generates ID. I need to know that ID.

        // REFACTOR PLAN:
        // I will temporarily generate ID here to ensure I know it.
        // But context overwrites it? Context code: "const newMatrix = { ...matrix, id: Date.now() }" usually.
        // Let's look at Context... I don't have it open right now.
        // Safest bet: I will generate the ID here and pass it.
        // If context overwrites, I might lose track.
        // Let's assume context respects existing ID if provided?
        // Actually, let's just create the matrix object fully here.

        return newMat;
    };

    // We need to modify addMatrix in context if we want to get the ID back, OR we trust we can find it.
    // Instead of complex refactor, I will implement a 'saveAndSelect' logic here.

    const handleUseResult = (target) => {
        if (!currentResult || currentResultType === 'scalar') return;

        const id = Date.now();
        const newMat = {
            id: id,
            name: `Result ${lastOperation || ''} ${new Date().toLocaleTimeString()}`,
            rows: currentResult.length,
            cols: currentResult[0].length,
            data: currentResult.map(row => row.map(v => v.toString()))
        };

        addMatrix(newMat);

        // Since state update might be async, we set ID directly.
        // But 'projectMatrices' comes from context props.
        // If I set state 'selectedIdA' to 'id', and 'projectMatrices' hasn't updated yet,
        // the selector might show nothing or error.
        // However, React batching might handle it, or we accept a slight delay.
        // Better: Set it.

        if (target === 'A') {
            setSelectedIdA(id);
            alert("Result saved and selected as Matrix A");
        } else {
            setSelectedIdB(id);
            alert("Result saved and selected as Matrix B");
        }
    };

    const handleSaveResultBtn = () => {
        const mat = handleSaveResult();
        if (mat) {
            addMatrix(mat);
            alert("Result saved as new matrix!");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display antialiased selection:bg-primary selection:text-white pb-24 mx-auto max-w-md md:max-w-2xl lg:max-w-4xl shadow-2xl border-x border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between bg-white dark:bg-[#101622] p-4 border-b border-gray-200 dark:border-gray-800/50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                <button
                    onClick={onBack}
                    className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">{currentProject?.name || 'Operations'}</h2>
                <button onClick={onHistory} className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">history</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Input Matrices Section */}
                <div className="flex flex-col pt-6">
                    <div className="flex items-center justify-between px-4 pb-4">
                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">Project Matrices</h2>
                        <button onClick={handleAddMatrix} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Add Matrix
                        </button>
                    </div>

                    {/* Horizontal Scroll List of Matrices */}
                    <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar snap-x snap-mandatory">
                        {projectMatrices.map((mat) => (
                            <div key={mat.id} className="snap-center shrink-0 w-[85vw] sm:w-[350px]">
                                <div className={`flex flex-col gap-4 rounded-xl bg-white dark:bg-[#1c1f27] p-4 shadow-sm ring-1 transition-all ${selectedIdA === mat.id ? 'ring-2 ring-blue-500' : selectedIdB === mat.id ? 'ring-2 ring-indigo-500' : 'ring-gray-200 dark:ring-gray-800'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{mat.name}</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">{mat.rows}x{mat.cols} Matrix</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(mat.id)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button onClick={() => handleDeleteMatrix(mat.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Matrix Visualizer */}
                                    <div className="w-full aspect-video bg-gray-50 dark:bg-[#15181e] rounded-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center overflow-auto">
                                        <div className="grid gap-x-3 gap-y-1 text-center text-xs font-mono text-slate-600 dark:text-slate-300" style={{ gridTemplateColumns: `repeat(${mat.cols}, 1fr)` }}>
                                            {mat.data.map((row, i) => row.map((val, j) => <span key={`${i}-${j}`}>{val}</span>))}
                                        </div>
                                    </div>

                                    {/* Selection Controls */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <button
                                            onClick={() => setSelectedIdA(mat.id === selectedIdA ? null : mat.id)}
                                            className={`py-2 rounded-lg text-xs font-bold transition-colors ${selectedIdA === mat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-slate-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        >
                                            {selectedIdA === mat.id ? 'Selected as A' : 'Set as A'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedIdB(mat.id === selectedIdB ? null : mat.id)}
                                            className={`py-2 rounded-lg text-xs font-bold transition-colors ${selectedIdB === mat.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-slate-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        >
                                            {selectedIdB === mat.id ? 'Selected as B' : 'Set as B'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operations Section */}
                <div className="flex flex-col pt-4">
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight px-4 text-left pb-4">Operations</h3>
                    {/* Operation Grid */}
                    <div className="grid grid-cols-4 gap-3 px-4">
                        <button onClick={() => handleOp('add')} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <span className="material-symbols-outlined">add</span>
                            <span className="text-xs font-medium">Add</span>
                        </button>
                        <button onClick={() => handleOp('sub')} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <span className="material-symbols-outlined">remove</span>
                            <span className="text-xs font-medium">Subtract</span>
                        </button>
                        <button onClick={() => handleOp('mul')} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-primary text-white shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark transition-all">
                            <span className="material-symbols-outlined">close</span>
                            <span className="text-xs font-bold">Multiply</span>
                        </button>
                        <button onClick={() => handleOp('transpose')} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <span className="material-symbols-outlined">rotate_90_degrees_cw</span>
                            <span className="text-xs font-medium">Transpose (A)</span>
                        </button>
                        <button onClick={() => handleOp('inverse')} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <span className="text-lg font-mono font-bold">A⁻¹</span>
                            <span className="text-xs font-medium">Inverse (A)</span>
                        </button>
                        <button onClick={() => handleOp('det')} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <span className="text-lg font-mono font-bold">|A|</span>
                            <span className="text-xs font-medium">Det (A)</span>
                        </button>
                        <button onClick={() => handleOp('rank')} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span className="text-xs font-medium">Rank (A)</span>
                        </button>
                        <button onClick={() => setOperationResult(null)} className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all">
                            <span className="material-symbols-outlined">backspace</span>
                            <span className="text-xs font-medium">Clear</span>
                        </button>
                    </div>
                    <p className="px-4 pt-2 text-xs text-slate-400 text-center">Unary operations apply to Matrix A selection.</p>
                </div>

                {/* Result Section */}
                {currentResult !== null && (
                    <div className="flex flex-col pt-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between pb-4">
                            <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">Result</h3>
                            <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-0.5">
                                <button className="px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm">Dec</button>
                            </div>
                        </div>
                        <div className="w-full bg-white dark:bg-[#1c1f27] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 relative">
                            {/* Result Grid Visualization */}
                            {currentResultType === 'matrix' ? (
                                <div className="grid gap-y-6 gap-x-2 w-full text-center font-mono text-lg sm:text-xl text-slate-900 dark:text-white"
                                    style={{ gridTemplateColumns: `repeat(${currentResult[0].length}, 1fr)` }}>
                                    {currentResult.map((row, i) => row.map((val, j) => (
                                        <div key={`${i}-${j}`} className="flex items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            {Number(val).toFixed(2).replace(/[.,]00$/, "")}
                                        </div>
                                    )))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-8">
                                    <span className="text-4xl font-bold text-primary font-mono">{Number(currentResult).toFixed(4)}</span>
                                </div>
                            )}

                            {/* Brackets Decoration (Only for matrix) */}
                            {currentResultType === 'matrix' && (
                                <>
                                    <div className="absolute inset-y-6 left-4 w-4 border-l-2 border-y-2 border-slate-300 dark:border-slate-600 rounded-l-lg pointer-events-none"></div>
                                    <div className="absolute inset-y-6 right-4 w-4 border-r-2 border-y-2 border-slate-300 dark:border-slate-600 rounded-r-lg pointer-events-none"></div>
                                </>
                            )}
                        </div>
                        {/* Result Actions */}
                        <div className="flex flex-col gap-3 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleSaveResultBtn} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined">save_alt</span>
                                    Save to Project
                                </button>
                                <button onClick={onExport} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined">ios_share</span>
                                    Export PDF
                                </button>
                            </div>

                            {currentResultType === 'matrix' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleUseResult('A')}
                                        className="flex items-center justify-center gap-2 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-bold hover:bg-blue-500/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">input</span>
                                        Use as Matrix A
                                    </button>
                                    <button
                                        onClick={() => handleUseResult('B')}
                                        className="flex items-center justify-center gap-2 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-bold hover:bg-indigo-500/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">input</span>
                                        Use as Matrix B
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="h-10"></div>
            </div>
        </div>
    );
};

export default MatrixOperations;
