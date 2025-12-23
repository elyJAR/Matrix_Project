import React, { useState } from 'react';
import { useMatrix } from '../context/MatrixContext';
import { saveAndShareFile } from '../utils/fileHandler';

const ExportOptions = ({ onBack }) => {
    const { currentResult, currentResultType, lastOperation } = useMatrix();
    const [format, setFormat] = useState('pdf');
    const [includeProblem, setIncludeProblem] = useState(true);
    const [includeSteps, setIncludeSteps] = useState(true);
    const [includeGraphs, setIncludeGraphs] = useState(true);
    const [includeNotes, setIncludeNotes] = useState(false);

    const handleExport = () => {
        if (format === 'pdf') {
            window.print();
        } else {
            // Generate a simple text file for "Word" export mock
            let content = `Project Matrix - Export\n\n`;
            content += `Operation: ${lastOperation || 'N/A'}\n\n`;

            if (includeProblem) {
                content += "Problem Statement:\n[Matrix Data Placeholder]\n\n";
            }

            if (currentResult) {
                content += `Result (${currentResultType}):\n`;
                if (currentResultType === 'matrix') {
                    content += currentResult.map(row => row.join('\t')).join('\n');
                } else {
                    content += currentResult.toString();
                }
                content += "\n\n";
            }

            if (includeSteps) content += "Steps:\n1. Calculation performed...\n2. Result obtained.\n\n";
            if (includeNotes) content += "Notes:\n(No notes added)\n";

            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            saveAndShareFile(blob, `matrix_export_${Date.now()}.txt`);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-white pb-28 mx-auto max-w-md md:max-w-2xl lg:max-w-4xl shadow-2xl border-x border-slate-200 dark:border-slate-800 print:shadow-none print:border-none">
            {/* Top App Bar - Hidden in Print */}
            <header className="sticky top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 print:hidden">
                <div className="flex items-center justify-between px-4 h-16 w-full">
                    <button
                        onClick={onBack}
                        aria-label="Close"
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Export Project</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            {/* Printable Content Section (Only visible when printing or in preview logic) */}
            <div className="hidden print:block p-8">
                <h1 className="text-3xl font-bold mb-4">Matrix Project Report</h1>
                <p className="mb-4 text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b pb-2 mb-4">Operation: {lastOperation}</h2>
                    {currentResult ? (
                        currentResultType === 'matrix' ? (
                            <div className="font-mono text-sm bg-gray-50 p-4 rounded border">
                                {currentResult.map((row, i) => (
                                    <div key={i} className="flex gap-4">
                                        {row.map((val, j) => (
                                            <span key={j} className="w-12 text-right">{Number(val).toFixed(2)}</span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-2xl font-mono font-bold">{Number(currentResult).toFixed(4)}</div>
                        )
                    ) : <p>No result to display.</p>}
                </div>
                <p className="text-xs text-center text-gray-400 mt-10">Exported from Matrix ML App</p>
            </div>

            {/* Main Content - Export Options Form (Hidden in Print) */}
            <main className="flex-1 w-full px-4 pt-6 print:hidden">
                {/* Preview Section (Visual Context) */}
                <div className="flex justify-center mb-6">
                    <div className="relative group">
                        <div className="w-24 h-32 bg-white dark:bg-[#1c222e] rounded border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col p-2 items-center justify-center gap-2 transform rotate-[-3deg] transition-transform group-hover:rotate-0">
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
                            <div className="w-3/4 h-2 bg-gray-100 dark:bg-gray-700 rounded-sm mr-auto"></div>
                            <div className="mt-2 w-full h-8 bg-primary/10 rounded flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-sm">grid_on</span>
                            </div>
                        </div>
                        <div className="absolute -z-10 top-0 left-0 w-24 h-32 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 rotate-[3deg] shadow-sm"></div>
                    </div>
                </div>

                {/* Format Selection Section */}
                <section className="mt-2">
                    <h3 className="pb-3 pt-2 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Choose Format</h3>
                    <div className="flex flex-col gap-3">
                        {/* PDF Option */}
                        <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${format === 'pdf' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-transparent bg-white dark:bg-[#1c222e] shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                            <input
                                type="radio"
                                name="export_format"
                                className="peer sr-only"
                                checked={format === 'pdf'}
                                onChange={() => setFormat('pdf')}
                            />
                            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-bold leading-tight">PDF Document</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Best for printing and sharing</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${format === 'pdf' ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                <span className={`material-symbols-outlined text-white text-[16px] transition-opacity ${format === 'pdf' ? 'opacity-100' : 'opacity-0'}`}>check</span>
                            </div>
                        </label>
                        {/* Word Option */}
                        <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${format === 'word' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-transparent bg-white dark:bg-[#1c222e] shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                            <input
                                type="radio"
                                name="export_format"
                                className="peer sr-only"
                                checked={format === 'word'}
                                onChange={() => setFormat('word')}
                            />
                            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined text-[28px]">article</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-bold leading-tight">Word Document</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Best for editing text and data</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${format === 'word' ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                <span className={`material-symbols-outlined text-white text-[16px] transition-opacity ${format === 'word' ? 'opacity-100' : 'opacity-0'}`}>check</span>
                            </div>
                        </label>
                    </div>
                </section>

                <div className="h-6"></div>

                {/* Content Options Section */}
                <section>
                    <h3 className="pb-3 pt-2 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Include in Report</h3>
                    <div className="flex flex-col gap-3">
                        {/* Toggle: Problem Statement */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1c222e] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex flex-col gap-0.5 pr-4">
                                <span className="text-base font-bold leading-tight">Problem Statement</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">Original matrix setup</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={includeProblem}
                                    onChange={(e) => setIncludeProblem(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        {/* Toggle: Steps */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1c222e] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex flex-col gap-0.5 pr-4">
                                <span className="text-base font-bold leading-tight">Step-by-Step Solution</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">Detailed calculation path</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={includeSteps}
                                    onChange={(e) => setIncludeSteps(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        {/* Toggle: Graphs */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1c222e] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex flex-col gap-0.5 pr-4">
                                <span className="text-base font-bold leading-tight">Graphs &amp; Visualizations</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">Plots and charts</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={includeGraphs}
                                    onChange={(e) => setIncludeGraphs(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        {/* Toggle: Notes */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1c222e] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex flex-col gap-0.5 pr-4">
                                <span className="text-base font-bold leading-tight">Project Notes</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">User annotations</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={includeNotes}
                                    onChange={(e) => setIncludeNotes(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </section>
            </main>

            {/* Sticky Footer - Hidden in Print */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-20 pointer-events-none print:hidden">
                <div className="max-w-md mx-auto w-full md:max-w-2xl lg:max-w-4xl pointer-events-auto">
                    <button onClick={handleExport} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-[0.98] transition-all hover:bg-blue-600">
                        <span className="material-symbols-outlined">ios_share</span>
                        Export File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportOptions;
