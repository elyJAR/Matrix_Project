import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Handles downloading/sharing files across Web and Native (Android/iOS)
 * @param {Blob} blob - The file data as a Blob
 * @param {string} filename - The desired filename
 */
export const saveAndShareFile = async (blob, filename) => {
    try {
        if (Capacitor.isNativePlatform()) {
            // --- NATIVE (Android/iOS) ---
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result;

                try {
                    // Write to cache
                    const savedFile = await Filesystem.writeFile({
                        path: filename,
                        data: base64data,
                        directory: Directory.Cache,
                        recursive: true
                    });

                    // Share
                    await Share.share({
                        title: 'Export File',
                        text: `Sharing ${filename}`,
                        url: savedFile.uri,
                        dialogTitle: 'Export Project'
                    });
                } catch (err) {
                    console.error("Native write error:", err);
                    alert("Error saving file on device: " + err.message);
                }
            };
        } else {
            // --- WEB ---
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (e) {
        console.error("Export error:", e);
        alert("Export failed: " + e.message);
    }
};
