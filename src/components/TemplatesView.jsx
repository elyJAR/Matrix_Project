import React from 'react';
import { useMatrix } from '../context/MatrixContext';

const TemplatesView = ({ onBack, onStartProject }) => {
    const { createProject } = useMatrix();

    const templates = [
        {
            name: "Identity 3x3",
            rows: 3, cols: 3,
            data: [['1', '0', '0'], ['0', '1', '0'], ['0', '0', '1']],
            desc: "Standard identity matrix with 1s on the diagonal."
        },
        {
            name: "Zero Matrix 3x3",
            rows: 3, cols: 3,
            data: [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']],
            desc: "Matrix with all elements equal to zero."
        },
        {
            name: "Rotation Matrix (90°)",
            rows: 2, cols: 2,
            data: [['0', '-1'], ['1', '0']],
            desc: "2D rotation matrix for 90 degrees counter-clockwise."
        },
        {
            name: "Scalar Matrix (2I)",
            rows: 3, cols: 3,
            data: [['2', '0', '0'], ['0', '2', '0'], ['0', '0', '2']],
            desc: "Scalar matrix with 2s on the diagonal."
        }
    ];

    const handleUseTemplate = async (template) => {
        const matrix = {
            id: `mat_template_${Date.now()}`,
            name: template.name,
            rows: template.rows,
            cols: template.cols,
            data: template.data
        };
        // Create new project with this template
        await createProject(`Template: ${template.name}`, [matrix]);
        onStartProject();
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
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Templates</h2>
                <div className="w-10"></div>
            </div>

            <div className="p-4 grid gap-4">
                {templates.map((t, i) => (
                    <div key={i} className="bg-white dark:bg-[#1c1f27] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/50 transition-all flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t.desc}</p>
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="material-symbols-outlined text-gray-400">grid_on</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleUseTemplate(t)}
                            className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-sm transition-colors"
                        >
                            Use Template
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplatesView;
