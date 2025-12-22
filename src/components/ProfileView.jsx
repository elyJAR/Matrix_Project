import React from 'react';
import { useMatrix } from '../context/MatrixContext';

const ProfileView = ({ onBack }) => {
    const { projects } = useMatrix();

    // Calculate generic stats
    const totalProjects = projects.length;
    const totalMatrices = projects.reduce((acc, p) => acc + (p.matrices ? p.matrices.length : 0), 0);
    const totalOperations = projects.reduce((acc, p) => acc + (p.history ? p.history.length : 0), 0);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display antialiased pb-24 mx-auto max-w-md md:max-w-2xl lg:max-w-4xl shadow-2xl border-x border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 z-50 flex items-center justify-between bg-white dark:bg-[#101622] p-4 border-b border-gray-200 dark:border-gray-800/50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                <button
                    onClick={onBack}
                    className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Profile</h2>
                <div className="w-10"></div>
            </div>

            <div className="p-6 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    U
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User</h2>
                    <p className="text-slate-500">Student • Math Enthusiast</p>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-[#1c1f27] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <span className="text-2xl font-bold text-primary">{totalProjects}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Projects</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-[#1c1f27] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <span className="text-2xl font-bold text-purple-600">{totalMatrices}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Matrices</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-[#1c1f27] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <span className="text-2xl font-bold text-emerald-500">{totalOperations}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Calcs</span>
                    </div>
                </div>

                <div className="w-full bg-white dark:bg-[#1c1f27] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Achievements</h3>
                    <div className="flex flex-col gap-3">
                        {/* Matrix Master Achievement */}
                        <div className={`flex items-center gap-4 transition-opacity duration-300 ${totalOperations >= 100 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600">
                                <span className="material-symbols-outlined">emoji_events</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Matrix Master</p>
                                <p className="text-xs text-slate-500">Perform 100 calculations ({totalOperations}/100)</p>
                            </div>
                        </div>

                        {/* Scholar Achievement */}
                        <div className={`flex items-center gap-4 transition-opacity duration-300 ${totalProjects >= 1 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Scholar</p>
                                <p className="text-xs text-slate-500">Create your first project</p>
                            </div>
                        </div>

                        {/* Power User Achievement */}
                        <div className={`flex items-center gap-4 transition-opacity duration-300 ${totalMatrices >= 10 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined">dataset</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Power User</p>
                                <p className="text-xs text-slate-500">Create 10 matrices ({totalMatrices}/10)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
