import React, { useState } from 'react';
import { useMatrix } from '../context/MatrixContext';

const OperationHistory = ({ onBack }) => {
    const { history, currentProject, deleteHistoryItem, addMatrix } = useMatrix();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);

    // Filter and Sort
    const filteredHistory = history.filter(item => {
        const matchesSearch = item.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof item.result === 'string' && item.result.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'All' || item.type === filterType.toLowerCase() ||
            (filterType === 'Scalar' && item.type !== 'matrix'); // Rough mapping
        return matchesSearch && matchesType;
    }).sort((a, b) => b.timestamp - a.timestamp);

    // Group by Date
    const groupedHistory = filteredHistory.reduce((groups, item) => {
        const date = new Date(item.timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let groupKey = date.toLocaleDateString();

        if (date.toDateString() === today.toDateString()) {
            groupKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = 'Yesterday';
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm("Delete this history item?")) {
            deleteHistoryItem(id);
            if (selectedItem?.id === id) setSelectedItem(null);
        }
    };

    const handleSaveFromHistory = (item) => {
        if (!item.result || item.result === 'Matrix') return; // Cannot save if result data missing (logic check)

        // Wait... in addHistoryItem we stored `result: 'Matrix'` string for matrices, not the data?
        // Let's check MatrixOperations.jsx...
        // Ah, line 92: `result: type === 'scalar' ? res.toString() : 'Matrix'`
        // WE LOST THE DATA! We need to store the actual result data in history to view/save it later.

        // FOR NOW, we can only display Scalar results or "Matrix (Data not saved)".
        // BUT user wants to CLICK to view details.
        // We need to fix MatrixOperations.jsx to store the result data in history first.
        // I will assume for this step that we WILL fix MatrixOperations.jsx in the next step to store `resultData`.

        if (item.resultData) {
            // It's a matrix or scalar stored in resultData
            const data = item.resultData;
            if (Array.isArray(data)) {
                const newMat = {
                    name: `Result ${item.type} ${new Date().toLocaleTimeString()}`,
                    rows: data.length,
                    cols: data[0].length,
                    data: data.map(row => row.map(v => v.toString()))
                };
                addMatrix(newMat);
                alert("Restored result to project!");
            } else {
                alert("Scalar result: " + data);
            }
        } else {
            alert("Detailed result data was not saved for this item.");
        }
    };

    const handleExportHistory = () => {
        const dataStr = JSON.stringify(history, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentProject?.name || 'Project'}_History.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'add': return 'add';
            case 'sub': return 'remove';
            case 'mul': return 'close';
            case 'transpose': return 'rotate_90_degrees_cw';
            case 'inverse': return 'swap_horiz'; // Approximation
            case 'det': return 'calculate';
            case 'rank': return 'bar_chart';
            default: return 'functions';
        }
    };

    const getColorForType = (type) => {
        switch (type) {
            case 'add': return 'text-blue-500 bg-blue-500/10';
            case 'sub': return 'text-orange-500 bg-orange-500/10';
            case 'mul': return 'text-purple-500 bg-purple-500/10';
            case 'det': return 'text-green-500 bg-green-500/10';
            case 'error': return 'text-red-500 bg-red-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const handleExportWorkings = (item) => {
        let content = `Operation: ${item.type.toUpperCase()}\n`;
        content += `Description: ${item.desc}\n`;
        content += `Date: ${new Date(item.timestamp).toLocaleString()}\n\n`;

        content += `--- RESULT ---\n\n`;
        if (Array.isArray(item.resultData)) {
            item.resultData.forEach(row => {
                content += row.map(v => Number(v).toFixed(2)).join('\t') + '\n';
            });
        } else {
            content += `${item.resultData}\n`;
        }

        if (item.steps && item.steps.length > 0) {
            content += `\n--- STEP-BY-STEP EXPLANATION ---\n\n`;
            item.steps.forEach(step => {
                content += `${step}\n`;
            });
        } else {
            content += `\n(No step-by-step explanation available for this operation)\n`;
        }

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Workings_${item.type}_${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col relative overflow-x-hidden antialiased transition-colors duration-200 mx-auto max-w-md md:max-w-2xl lg:max-w-4xl shadow-2xl border-x border-slate-200 dark:border-slate-800">
            {/* Top App Bar */}
            <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={onBack}
                        className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-900 dark:text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white truncate px-4">
                        {currentProject?.name || 'History'}
                    </h1>
                    <div className="w-10"></div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-4 py-4 w-full mx-auto">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input
                        className="block w-full h-12 pl-11 pr-4 rounded-xl border-none bg-white dark:bg-[#1e2736] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#252f40] transition-all shadow-sm text-base font-medium"
                        placeholder="Search operations..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Chips / Filter Horizontal List */}
            <div className="w-full overflow-x-auto hide-scrollbar pb-2 pl-4 no-scrollbar">
                <div className="flex gap-3 pr-4">
                    {['All', 'add', 'sub', 'mul', 'det'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setFilterType(filter)}
                            className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full transition-all active:scale-95 ${filterType === filter
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-white dark:bg-[#1e2736] border border-gray-200 dark:border-gray-700 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span className="text-sm font-bold capitalize">{filter}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List Container */}
            <main className="flex-1 px-4 pb-24 mx-auto w-full">
                {Object.keys(groupedHistory).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <span className="material-symbols-outlined text-6xl mb-4">history_edu</span>
                        <p>No history found</p>
                    </div>
                ) : (
                    Object.entries(groupedHistory).map(([dateLabel, items]) => (
                        <div key={dateLabel} className="mt-4">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight mb-3">{dateLabel}</h3>
                            <div className="flex flex-col gap-3">
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="group relative flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1e2736] border border-transparent dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm cursor-pointer hover:scale-[1.01]"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Icon Box */}
                                            <div className={`flex items-center justify-center size-12 rounded-xl shrink-0 ${getColorForType(item.type)}`}>
                                                <span className="material-symbols-outlined">{getIconForType(item.type)}</span>
                                            </div>
                                            {/* Content */}
                                            <div className="flex flex-col justify-center min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-slate-900 dark:text-white text-base font-bold truncate capitalize">{item.type}</p>
                                                    <div className={`size-1.5 rounded-full ${item.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal truncate font-mono tracking-tight">{item.desc}</p>
                                            </div>
                                        </div>
                                        {/* Time */}
                                        <div className="shrink-0 flex flex-col items-end gap-1 pl-2">
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                {item.formattedTime || new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <button
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Floating Action / Export Area */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
                <button
                    onClick={handleExportHistory}
                    className="pointer-events-auto shadow-xl shadow-primary/30 flex items-center justify-center gap-2 h-14 bg-primary hover:bg-blue-600 text-white rounded-full px-8 transition-all active:scale-95 transform"
                >
                    <span className="material-symbols-outlined text-[20px]">ios_share</span>
                    <span className="text-base font-bold">Export History</span>
                </button>
            </div>

            {/* Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1c1f27] w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center size-10 rounded-full shrink-0 ${getColorForType(selectedItem.type)}`}>
                                    <span className="material-symbols-outlined text-lg">{getIconForType(selectedItem.type)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{selectedItem.type} Operation</h3>
                                    <p className="text-xs text-slate-500">{new Date(selectedItem.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6 bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Operation</p>
                                <p className="font-mono text-slate-700 dark:text-slate-300 break-words">{selectedItem.desc}</p>
                            </div>

                            {/* STEPS SECTION */}
                            {selectedItem.steps && selectedItem.steps.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Step-by-Step Workings</p>
                                    </div>
                                    <div className="bg-white dark:bg-[#15181e] rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
                                        <ul className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                            {selectedItem.steps.map((step, idx) => (
                                                <li key={idx} className="break-words pl-2">{step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {selectedItem.resultData ? (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Result</p>
                                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-slate-500">
                                            {Array.isArray(selectedItem.resultData) ? `${selectedItem.resultData.length}x${selectedItem.resultData[0].length}` : 'Scalar'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white dark:bg-[#15181e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative overflow-auto">
                                        {Array.isArray(selectedItem.resultData) ? (
                                            <div className="grid gap-y-4 gap-x-2 w-full text-center font-mono text-base text-slate-900 dark:text-white"
                                                style={{ gridTemplateColumns: `repeat(${selectedItem.resultData[0].length}, 1fr)` }}>
                                                {selectedItem.resultData.map((row, i) => row.map((val, j) => (
                                                    <div key={`${i}-${j}`} className="flex items-center justify-center">
                                                        {Number(val).toFixed(2).replace(/[.,]00$/, "")}
                                                    </div>
                                                )))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-3xl font-bold font-mono text-primary">
                                                {Number(selectedItem.resultData).toFixed(4)}
                                            </div>
                                        )}

                                        {/* Brackets */}
                                        {Array.isArray(selectedItem.resultData) && (
                                            <>
                                                <div className="absolute inset-y-4 left-3 w-3 border-l-2 border-y-2 border-slate-300 dark:border-slate-600 rounded-l-lg pointer-events-none"></div>
                                                <div className="absolute inset-y-4 right-3 w-3 border-r-2 border-y-2 border-slate-300 dark:border-slate-600 rounded-r-lg pointer-events-none"></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                    <p className="text-slate-400 text-sm">No result data recorded for this operation.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50/50 dark:bg-[#1e2736]/50 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => handleExportWorkings(selectedItem)}
                                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white dark:bg-[#252f40] border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap px-4"
                            >
                                <span className="material-symbols-outlined">description</span>
                                Export Workings
                            </button>

                            {selectedItem.resultData && (
                                <button
                                    onClick={() => handleSaveFromHistory(selectedItem)}
                                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white dark:bg-[#252f40] border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap px-4"
                                >
                                    <span className="material-symbols-outlined">save_alt</span>
                                    Save Result
                                </button>
                            )}
                            <button
                                onClick={(e) => handleDelete(e, selectedItem.id)}
                                className="flex items-center justify-center size-12 shrink-0 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default OperationHistory;
