
export const generateAdditionSteps = (A, B, nameA, nameB) => {
    const steps = [];
    steps.push(`Perform element-wise addition of ${nameA} and ${nameB}.`);
    steps.push(`Formula: C[i][j] = ${nameA}[i][j] + ${nameB}[i][j]`);

    const rows = A.length;
    const cols = A[0].length;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const valA = A[i][j];
            const valB = B[i][j];
            const sum = parseFloat(valA) + parseFloat(valB);
            steps.push(`C[${i + 1},${j + 1}] = ${valA} + ${valB} = ${sum}`);
        }
    }
    return steps;
};

export const generateSubtractionSteps = (A, B, nameA, nameB) => {
    const steps = [];
    steps.push(`Perform element-wise subtraction of ${nameB} from ${nameA}.`);
    steps.push(`Formula: C[i][j] = ${nameA}[i][j] - ${nameB}[i][j]`);

    const rows = A.length;
    const cols = A[0].length;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const valA = A[i][j];
            const valB = B[i][j];
            const diff = parseFloat(valA) - parseFloat(valB);
            steps.push(`C[${i + 1},${j + 1}] = ${valA} - ${valB} = ${diff}`);
        }
    }
    return steps;
};

export const generateMultiplicationSteps = (A, B, nameA, nameB) => {
    const steps = [];
    steps.push(`Multiply ${nameA} (Rows: ${A.length}, Cols: ${A[0].length}) by ${nameB} (Rows: ${B.length}, Cols: ${B[0].length}).`);

    const r1 = A.length;
    const c1 = A[0].length;
    const c2 = B[0].length;

    for (let i = 0; i < r1; i++) {
        for (let j = 0; j < c2; j++) {
            let sumStr = "";
            let sum = 0;
            for (let k = 0; k < c1; k++) {
                const valA = parseFloat(A[i][k]);
                const valB = parseFloat(B[k][j]);
                sum += valA * valB;
                sumStr += `(${valA} × ${valB})`;
                if (k < c1 - 1) sumStr += " + ";
            }
            steps.push(`C[${i + 1},${j + 1}] (Row ${i + 1} of A • Col ${j + 1} of B) = ${sumStr} = ${sum}`);
        }
    }
    return steps;
};

export const generateDeterminantSteps = (M, name) => {
    const steps = [];
    const n = M.length;

    if (n === 2) {
        steps.push(`Calculate determinant of 2x2 matrix ${name}.`);
        steps.push("Formula: ad - bc");
        const a = parseFloat(M[0][0]);
        const b = parseFloat(M[0][1]);
        const c = parseFloat(M[1][0]);
        const d = parseFloat(M[1][1]);
        steps.push(`= (${a} × ${d}) - (${b} × ${c})`);
        steps.push(`= ${a * d} - ${b * c}`);
        steps.push(`= ${a * d - b * c}`);
    } else if (n === 3) {
        steps.push(`Calculate determinant of 3x3 matrix ${name} using expansion by minors (Row 1).`);
        steps.push("Formula: a(ei - fh) - b(di - fg) + c(dh - eg)");
        const [row1] = M;
        const [a, b, c] = row1.map(parseFloat);

        // Minors
        const m1 = [[M[1][1], M[1][2]], [M[2][1], M[2][2]]];
        const m2 = [[M[1][0], M[1][2]], [M[2][0], M[2][2]]];
        const m3 = [[M[1][0], M[1][1]], [M[2][0], M[2][1]]];

        const det2x2 = (m) => (parseFloat(m[0][0]) * parseFloat(m[1][1])) - (parseFloat(m[0][1]) * parseFloat(m[1][0]));

        const d1 = det2x2(m1);
        const d2 = det2x2(m2);
        const d3 = det2x2(m3);

        steps.push(`Term 1: ${a} × |Minor 1| = ${a} × ((${M[1][1]}×${M[2][2]}) - (${M[1][2]}×${M[2][1]})) = ${a} × ${d1}`);
        steps.push(`Term 2: ${b} × |Minor 2| = ${b} × ((${M[1][0]}×${M[2][2]}) - (${M[1][2]}×${M[2][0]})) = ${b} × ${d2}`);
        steps.push(`Term 3: ${c} × |Minor 3| = ${c} × ((${M[1][0]}×${M[2][1]}) - (${M[1][1]}×${M[2][0]})) = ${c} × ${d3}`);

        steps.push(`Total = (${a} × ${d1}) - (${b} × ${d2}) + (${c} × ${d3})`);
        steps.push(`= ${a * d1} - ${b * d2} + ${c * d3}`);
        steps.push(`= ${a * d1 - b * d2 + c * d3}`);
    } else {
        steps.push(`Calculation of determinant for ${n}x${n} matrices is computed using Gaussian elimination or LU decomposition.`);
        steps.push("Complexity increases factorialy for expansion by minors.");
    }

    return steps;
};

export const generateTransposeSteps = (M, name) => {
    const steps = [];
    steps.push(`Transpose ${name}: Swift rows and columns.`);
    steps.push(`For each element M[i][j], place it at T[j][i].`);

    const rows = M.length;
    const cols = M[0].length;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (i !== j) {
                // To avoid spam, just show a few or simple logic
                steps.push(`Move element at [${i + 1},${j + 1}] (${M[i][j]}) to [${j + 1},${i + 1}]`);
            }
        }
    }
    return steps;
};
