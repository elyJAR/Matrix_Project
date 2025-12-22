import React, { useEffect, useState, useRef } from 'react';
import { useMatrix } from '../context/MatrixContext';
import Tesseract from 'tesseract.js';

const ScanView = ({ onBack, onComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [statusText, setStatusText] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const { setEditingMatrixId, updateMatrix, matrices, addMatrix, projects, currentProject, createProject } = useMatrix();

    useEffect(() => {
        // Simple mobile detection
        const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        setIsMobile(mobileCheck);

        const startCamera = async () => {
            // Check for Secure Context (HTTPS or Lowcalhost)
            if (!window.isSecureContext) {
                setCameraError("Security Error: Camera access requires HTTPS. You are likely accessing via an insecure IP.");
                return;
            }

            try {
                if (!mobileCheck && window.innerWidth >= 768) {
                    // Desktop warning logic can stay or we can allow desktop for testing
                    // For now, checks are in render.
                }

                const constraints = {
                    video: {
                        facingMode: 'environment'
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                let msg = "Could not access camera.";
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    msg = "Permission denied. Please allow camera access in your browser settings.";
                } else if (err.name === 'NotFoundError') {
                    msg = "No camera found on this device.";
                } else {
                    msg = `Camera Error: ${err.name} - ${err.message}`;
                }
                setCameraError(msg);
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const processTextToMatrix = (text) => {
        // Clean text: remove all non-numeric chars except splitters
        // We allow digits, minus, dot. Replace others with space.
        const cleanText = text.replace(/[^0-9.\-\n\s]/g, ' ');

        // Extract all numbers
        const numbers = cleanText.match(/-?\d+(\.\d+)?/g);

        if (!numbers || numbers.length === 0) return null;

        // Try to infer dimensions
        // If 9 numbers, assume 3x3
        // If 4 numbers, assume 2x2
        // If arbitrary, we try to detect lines

        if (numbers.length === 9) {
            return {
                rows: 3,
                cols: 3,
                data: [
                    [numbers[0], numbers[1], numbers[2]],
                    [numbers[3], numbers[4], numbers[5]],
                    [numbers[6], numbers[7], numbers[8]]
                ]
            };
        }

        if (numbers.length === 4) {
            return {
                rows: 2,
                cols: 2,
                data: [
                    [numbers[0], numbers[1]],
                    [numbers[2], numbers[3]]
                ]
            };
        }

        // Fallback: create square matrix
        const size = Math.ceil(Math.sqrt(numbers.length));
        const rows = size;
        const cols = size;
        const data = Array(rows).fill(0).map(() => Array(cols).fill('0'));

        let idx = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (idx < numbers.length) {
                    data[i][j] = numbers[idx];
                    idx++;
                }
            }
        }

        return { rows, cols, data };
    };

    const handleScan = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setScanning(true);
        setStatusText("Capturing...");

        try {
            // Draw video frame to canvas
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            setStatusText("Recognizing text...");

            // Perform OCR
            const { data: { text } } = await Tesseract.recognize(
                canvas,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setStatusText(`Scanning... ${Math.round(m.progress * 100)}%`);
                        }
                    }
                }
            );

            console.log("OCR Result:", text);
            const matrixData = processTextToMatrix(text);

            if (!matrixData) {
                alert("No numbers detected. Please try again.");
                setScanning(false);
                setStatusText("");
                return;
            }

            const newMatrix = {
                id: `scan_${Date.now()}`,
                name: 'Scanned Matrix',
                rows: matrixData.rows,
                cols: matrixData.cols,
                data: matrixData.data
            };

            if (currentProject) {
                addMatrix(newMatrix);
                setEditingMatrixId(newMatrix.id);
            } else {
                const projectName = `Scan ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                await createProject(projectName, [newMatrix]);
                setEditingMatrixId(newMatrix.id);
            }

            onComplete();

        } catch (error) {
            console.error(error);
            alert("Scan failed: " + error.message);
        } finally {
            setScanning(false);
            setStatusText("");
        }
    };

    if (!isMobile && window.innerWidth >= 768) {
        return (
            <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-gray-400">perm_device_information</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Mobile Device Required</h2>
                <p className="text-gray-400 max-w-md mb-8">The scanning feature is designed for mobile cameras. Please open this app on your phone to scan matrices.</p>
                <button onClick={onBack} className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={onBack} className="p-2 rounded-full bg-black/20 backdrop-blur-md">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-bold tracking-wide">SCAN MATRIX</span>
                    {scanning && <span className="text-xs text-primary animate-pulse">{statusText}</span>}
                </div>
                <div className="w-10"></div>
            </div>

            {/* Viewfinder */}
            <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
                {/* Real Camera Feed */}
                {cameraError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-8 text-center">
                        <p className="text-red-400">{cameraError}</p>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Scanning Frame */}
                <div className="relative w-64 h-64 border-2 border-white/50 rounded-lg flex items-center justify-center z-20">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>

                    {scanning && (
                        <div className="absolute inset-0 bg-primary/20 animate-pulse">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-32 text-center w-full px-4 z-20">
                    <p className="text-white/80 text-sm bg-black/40 inline-block px-3 py-1 rounded-full backdrop-blur-sm">align matrix within frame</p>
                </div>
            </div>

            {/* Camera Controls */}
            <div className="h-32 bg-black flex items-center justify-center relative z-20">
                <button
                    onClick={handleScan}
                    disabled={scanning || cameraError}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 transition-transform active:scale-95 disabled:opacity-50"
                >
                    <div className={`w-full h-full bg-white rounded-full ${scanning ? 'scale-90 bg-gray-300' : ''} transition-all duration-300`}></div>
                </button>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </div>
    );
};

export default ScanView;
