import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportProjectToPDF = (project) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // --- Helper for Page Breaks ---
    const checkPageBreak = (spaceNeeded) => {
        if (yPos + spaceNeeded > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yPos = 20;
            return true;
        }
        return false;
    };

    // --- Title ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(project.name, 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, yPos);
    yPos += 15;

    // --- Section: Current Matrices ---
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Current Matrices", 14, yPos);
    yPos += 10;

    if (!project.matrices || project.matrices.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("No matrices in this project.", 14, yPos);
        yPos += 15;
    } else {
        project.matrices.forEach(mat => {
            checkPageBreak(40 + (mat.rows * 10)); // Estimate height
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`${mat.name} (${mat.rows}x${mat.cols})`, 14, yPos);
            yPos += 5;

            // Simple table for matrix
            autoTable(doc, {
                startY: yPos,
                head: [],
                body: mat.data,
                theme: 'grid',
                styles: {
                    halign: 'center',
                    valign: 'middle',
                    fontSize: 10,
                    cellPadding: 2,
                },
                margin: { left: 14 },
                tableWidth: Math.min(100, mat.cols * 15) // Limit width
            });

            yPos = doc.lastAutoTable.finalY + 15;
        });
    }

    // --- Section: Operations History ---
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Operations History", 14, yPos);
    yPos += 10;

    if (!project.history || project.history.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("No operations performed yet.", 14, yPos);
        yPos += 15;
    } else {
        // Process history in reverse (most recent first) or chronological? 
        // Usually chronological is better for "reading" a derivation. 
        // But app shows reverse. Let's do chronological (oldest first) so it reads like a story.
        const sortedHistory = [...project.history].sort((a, b) => a.timestamp - b.timestamp);

        sortedHistory.forEach((item, index) => {
            checkPageBreak(60); // Base space for headers

            // Item Header
            doc.setDrawColor(200, 200, 200);
            doc.line(14, yPos, pageWidth - 14, yPos);
            yPos += 8;

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`${index + 1}. ${item.desc || item.type.toUpperCase()}`, 14, yPos);

            // Timestamp
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            const timeStr = new Date(item.timestamp).toLocaleString();
            doc.text(timeStr, pageWidth - 14 - doc.getTextWidth(timeStr), yPos);
            yPos += 8;

            // Steps
            if (item.steps && item.steps.length > 0) {
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "italic");
                doc.text("Steps:", 14, yPos);
                yPos += 5;
                doc.setFont("helvetica", "normal");

                item.steps.forEach(step => {
                    // Wrap text
                    const splitText = doc.splitTextToSize(`• ${step}`, pageWidth - 30);
                    checkPageBreak(splitText.length * 5);
                    doc.text(splitText, 18, yPos);
                    yPos += (splitText.length * 5) + 2;
                });
                yPos += 3;
            }

            // Result
            if (item.resultData) {
                checkPageBreak(40);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("Result:", 14, yPos);
                yPos += 5;

                if (item.result === 'Matrix' || Array.isArray(item.resultData)) {
                    // Matrix Result
                    autoTable(doc, {
                        startY: yPos,
                        body: item.resultData,
                        theme: 'plain', // Plain for result looked cleaner or maybe grid? Let's use grid
                        styles: {
                            halign: 'center',
                            valign: 'middle',
                            fontStyle: 'bold',
                            fillColor: [240, 240, 255]
                        },
                        margin: { left: 18 },
                        tableWidth: Math.min(100, item.resultData[0].length * 15)
                    });
                    yPos = doc.lastAutoTable.finalY + 15;
                } else {
                    // Scalar Result
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(12);
                    doc.text(item.resultData.toString(), 18, yPos);
                    yPos += 15;
                }
            } else {
                yPos += 10;
            }
        });
    }

    // Save
    doc.save(`${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`);
};
