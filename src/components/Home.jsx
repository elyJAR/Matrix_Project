import React, { useState } from 'react';
import { useMatrix } from '../context/MatrixContext';
import { exportProjectToPDF } from '../utils/pdfExporter';
import { exportProjectToDOCX } from '../utils/docxExporter';
import { saveAndShareFile } from '../utils/fileHandler';

const Home = ({ onStart, onScan, onTemplates, onProfile, onSettings }) => {
    const { projects, createProject, loadProject, deleteProject, renameProject, loading } = useMatrix();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [renamingProject, setRenamingProject] = useState(null); // { id, name }
    const [newProjectName, setNewProjectName] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportingProject, setExportingProject] = useState(null);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        await createProject(newProjectName);
        setNewProjectName('');
        setShowNewProjectModal(false);
        onStart(); // Navigate to operations
    };

    const handleRenameSubmit = async (e) => {
        e.preventDefault();
        if (!renamingProject || !renamingProject.name.trim()) return;

        await renameProject(renamingProject.id, renamingProject.name);
        setRenamingProject(null);
    };

    const handleOpenProject = (id) => {
        loadProject(id);
        onStart();
    };

    const handleDeleteProject = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteProject(id);
        }
    };

    const handleRenameClick = (e, project) => {
        e.stopPropagation();
        setRenamingProject({ id: project.id, name: project.name });
    };

    const handleExportClick = (e, project) => {
        e.stopPropagation();
        setExportingProject(project);
        setShowExportModal(true);
    };

    const executeExport = (type) => { // type: 'json' | 'pdf' | 'docx'
        if (!exportingProject) return;

        if (type === 'json') {
            const dataStr = JSON.stringify(exportingProject, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            saveAndShareFile(blob, `${exportingProject.name.replace(/\s+/g, '_')}_backup.json`);
        } else if (type === 'pdf') {
            exportProjectToPDF(exportingProject);
        } else if (type === 'docx') {
            exportProjectToDOCX(exportingProject);
        }
        setShowExportModal(false);
        setExportingProject(null);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased overflow-x-hidden min-h-screen relative pb-24">
            {/* Top App Bar */}
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="flex items-center px-4 py-3 justify-between mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl">
                    <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={onSettings} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <div onClick={onProfile} className="cursor-pointer w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 overflow-hidden ring-2 ring-white dark:ring-surface-dark ml-2">
                            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">U</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto w-full flex flex-col px-4 pt-4 gap-6 max-w-md md:max-w-2xl lg:max-w-4xl">
                {/* Search Bar */}
                <div className="relative">
                    <label className="relative flex items-center w-full group">
                        <div className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-[#1c222e] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base transition-all"
                            placeholder="Search projects..."
                            type="text"
                        />
                    </label>
                </div>

                {/* Quick Actions / Create New */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowNewProjectModal(true)}
                        className="flex flex-col items-start justify-center p-4 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 group"
                    >
                        <div className="bg-white/20 p-2 rounded-lg mb-3 group-hover:bg-white/30 transition-colors">
                            <span className="material-symbols-outlined">add</span>
                        </div>
                        <span className="font-bold text-lg leading-none">New Project</span>
                        <span className="text-xs text-blue-100 mt-1 opacity-80">Empty matrix</span>
                    </button>
                    <button onClick={onScan} className="flex flex-col items-start justify-center p-4 rounded-xl bg-white dark:bg-[#1c222e] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-all active:scale-95 group md:hidden">
                        <div className="bg-slate-100 dark:bg-slate-800 text-primary p-2 rounded-lg mb-3 group-hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined">camera_alt</span>
                        </div>
                        <span className="font-bold text-lg leading-none text-slate-800 dark:text-slate-100">Scan</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">From photo</span>
                    </button>
                </div>

                {/* Recent Projects List */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your Projects</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 bg-white dark:bg-[#1c222e] rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                            <p>No projects yet. Create one to get started!</p>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => handleOpenProject(project.id)}
                                className="group relative flex items-center justify-between p-4 bg-white dark:bg-[#1c222e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined">grid_4x4</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{project.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(project.updatedAt).toLocaleDateString()}
                                                {' • '}
                                                {project.matrices.length} Matrices
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center -mr-2">
                                    <button
                                        onClick={(e) => handleRenameClick(e, project)}
                                        className="p-2 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleExportClick(e, project)}
                                        className="p-2 rounded-full text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">ios_share</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                        className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Export Format Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1c222e] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Export Project</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Choose a format to export <strong>{exportingProject?.name}</strong>.</p>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => executeExport('json')}
                                className="flex flex-col items-center justify-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-slate-700 dark:text-slate-300 hover:text-primary"
                            >
                                <span className="material-symbols-outlined text-2xl">data_object</span>
                                <span className="font-bold text-xs">JSON Backup</span>
                            </button>
                            <button
                                onClick={() => executeExport('pdf')}
                                className="flex flex-col items-center justify-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-slate-700 dark:text-slate-300 hover:text-red-500"
                            >
                                <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                                <span className="font-bold text-xs">PDF Report</span>
                            </button>
                            <button
                                onClick={() => executeExport('docx')}
                                className="flex flex-col items-center justify-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-slate-700 dark:text-slate-300 hover:text-blue-600"
                            >
                                <span className="material-symbols-outlined text-2xl">description</span>
                                <span className="font-bold text-xs">DOCX Word</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowExportModal(false)}
                            className="w-full mt-6 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Rename Project Modal */}
            {renamingProject && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1c222e] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Rename Project</h3>
                        <form onSubmit={handleRenameSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                    placeholder="Project Name"
                                    value={renamingProject.name}
                                    onChange={e => setRenamingProject({ ...renamingProject, name: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setRenamingProject(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!renamingProject.name.trim()}
                                    className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Project Modal */}
            {showNewProjectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1c222e] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New Project</h3>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                    placeholder="e.g. Algebra Homework"
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowNewProjectModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newProjectName.trim()}
                                    className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#1c222e] border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 z-50">
                <div className="mx-auto grid grid-cols-3 h-16 max-w-md md:max-w-2xl lg:max-w-4xl">
                    <button className="flex flex-col items-center justify-center gap-1 text-primary">
                        <span className="material-symbols-outlined fill-current">grid_view</span>
                        <span className="text-[10px] font-medium">Projects</span>
                    </button>
                    <button onClick={onTemplates} className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined">extension</span>
                        <span className="text-[10px] font-medium">Templates</span>
                    </button>
                    <button onClick={onProfile} className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </div>
            </nav>

            <div className="h-6 w-full"></div>
        </div>
    );
};

export default Home;


