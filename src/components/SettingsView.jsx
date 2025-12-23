import React, { useState, useEffect, useRef } from 'react';
import { useMatrix } from '../context/MatrixContext';
import * as db from '../services/db';
import { saveAndShareFile } from '../utils/fileHandler';

const SettingsView = ({ onBack }) => {
    const [darkMode, setDarkMode] = useState(false);

    const { clearData, importData } = useMatrix();
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        }
    };

    const handleExportData = async () => {
        try {
            const projects = await db.getProjects();
            const dataStr = JSON.stringify(projects, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            saveAndShareFile(blob, `matrix_ml_backup_${new Date().toISOString().split('T')[0]}.json`);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (confirm("Importing data will merge with existing projects. If IDs match, existing projects will be overwritten. Continue?")) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const json = JSON.parse(event.target.result);
                    await importData(json);
                    alert("Data imported successfully!");
                    e.target.value = ''; // Reset input
                } catch (error) {
                    console.error("Import failed:", error);
                    alert("Failed to import data. Please ensure the file is valid.");
                }
            };
            reader.readAsText(file);
        } else {
            e.target.value = '';
        }
    };

    const handleClearData = async () => {
        if (confirm("WARNING: This will delete ALL your projects and data. This action cannot be undone.")) {
            try {
                await clearData();
                alert("All data has been cleared.");
                onBack(); // Go back to Home
            } catch (error) {
                console.error("Failed to clear data:", error);
                alert("Failed to clear data.");
            }
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display antialiased pb-24 mx-auto max-w-md md:max-w-2xl lg:max-w-4xl shadow-2xl border-x border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 z-50 flex items-center justify-between bg-white dark:bg-[#101622] p-4 border-b border-gray-200 dark:border-gray-800/50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                <button
                    onClick={onBack}
                    className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Settings</h2>
                <div className="w-10"></div>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Theme Section */}
                <div className="bg-white dark:bg-[#1c1f27] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Appearance</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                <span className="material-symbols-outlined">dark_mode</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                                <p className="text-sm text-slate-500">Adjust the appearance</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggleTheme} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                {/* Data Section */}
                <div className="bg-white dark:bg-[#1c1f27] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Data Management</h3>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />

                    <button onClick={handleImportClick} className="w-full flex items-center justify-between p-2 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg transition-colors group mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                <span className="material-symbols-outlined">upload</span>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-green-600 dark:text-green-400">Import Data</p>
                                <p className="text-sm text-slate-500">Restore from backup</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-green-500">chevron_right</span>
                    </button>

                    <button onClick={handleExportData} className="w-full flex items-center justify-between p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-colors group mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                <span className="material-symbols-outlined">download</span>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-indigo-600 dark:text-indigo-400">Export All Data</p>
                                <p className="text-sm text-slate-500">Backup your projects</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500">chevron_right</span>
                    </button>

                    <button onClick={handleClearData} className="w-full flex items-center justify-between p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined">delete_forever</span>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-red-600 dark:text-red-400">Clear All Data</p>
                                <p className="text-sm text-slate-500">Delete all projects</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500">chevron_right</span>
                    </button>
                </div>

                {/* About Section */}
                <div className="bg-white dark:bg-[#1c1f27] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">About</h3>
                    <div className="text-center p-4">
                        <p className="font-bold text-slate-900 dark:text-white">Matrix Machine Learning</p>
                        <p className="text-sm text-slate-500">Version 1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
