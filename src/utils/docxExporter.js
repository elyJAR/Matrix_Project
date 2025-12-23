import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, HeadingLevel } from "docx";
import { saveAndShareFile } from "./fileHandler";

export const exportProjectToDOCX = async (project) => {
    // ... [rest of the code is inside the function]

    // --- Helper to create a matrix table ---
    const createMatrixTable = (data) => {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE }, // Auto width often better for grids? No, fixed looks better. 
            // Actually, let's try not to force percentage if small.
            // Using 'AUTO' width is safer.
            rows: data.map(row =>
                new TableRow({
                    children: row.map(cell =>
                        new TableCell({
                            children: [new Paragraph({
                                text: cell.toString(),
                                alignment: AlignmentType.CENTER
                            })],
                            verticalAlign: AlignmentType.CENTER,
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            },
                            width: { size: 500, type: WidthType.DXA }, // Small fixed width
                        })
                    ),
                })
            ),
            alignment: AlignmentType.CENTER,
        });
    };

    const children = [];

    // --- Title ---
    children.push(new Paragraph({
        text: project.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
    }));

    children.push(new Paragraph({
        text: `Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        alignment: AlignmentType.CENTER,
        color: "888888",
        spacing: { after: 400 },
    }));

    // --- Section: Current Matrices ---
    children.push(new Paragraph({
        text: "Current Matrices",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
    }));

    if (!project.matrices || project.matrices.length === 0) {
        children.push(new Paragraph({ text: "No matrices in this project.", style: "Italic" }));
    } else {
        project.matrices.forEach(mat => {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${mat.name} (${mat.rows}x${mat.cols})`, bold: true, size: 24 }),
                ],
                spacing: { before: 200, after: 100 },
            }));

            children.push(createMatrixTable(mat.data));
            children.push(new Paragraph({ text: "" })); // Spacer
        });
    }

    // --- Section: Operations History ---
    children.push(new Paragraph({
        text: "Operations History",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
    }));

    if (!project.history || project.history.length === 0) {
        children.push(new Paragraph({ text: "No operations performed yet.", style: "Italic" }));
    } else {
        const sortedHistory = [...project.history].sort((a, b) => a.timestamp - b.timestamp);

        sortedHistory.forEach((item, index) => {
            // Separator Line (simulated with empty para and border?) 
            // Docx doesn't handle HR easily, let's just use spacing.

            // Header
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${index + 1}. ${item.desc || item.type.toUpperCase()}`, bold: true, size: 24 }),
                    new TextRun({ text: `    ${new Date(item.timestamp).toLocaleString()}`, color: "888888", size: 18 }),
                ],
                spacing: { before: 400, after: 100 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } }
            }));

            // Steps
            if (item.steps && item.steps.length > 0) {
                children.push(new Paragraph({
                    text: "Steps:",
                    italics: true,
                    spacing: { before: 100, after: 100 },
                }));

                item.steps.forEach(step => {
                    children.push(new Paragraph({
                        text: step,
                        bullet: { level: 0 },
                    }));
                });
            }

            // Result
            if (item.resultData) {
                children.push(new Paragraph({
                    text: "Result:",
                    bold: true,
                    spacing: { before: 200, after: 100 },
                }));

                if (item.result === 'Matrix' || Array.isArray(item.resultData)) {
                    children.push(createMatrixTable(item.resultData));
                } else {
                    children.push(new Paragraph({
                        text: item.resultData.toString(),
                        size: 24,
                    }));
                }
            }
        });
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAndShareFile(blob, `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.docx`);
};
