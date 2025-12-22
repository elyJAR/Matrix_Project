/**
 * Matrix Utility Functions for Matrix Machine Learning App
 */

// Helper: Convert string input to numbers
export const parseMatrix = (matrix) => {
    return matrix.map(row => row.map(cell => {
        const num = parseFloat(cell);
        return isNaN(num) ? 0 : num;
    }));
};

/**
 * Calculates the determinant of a matrix.
 * Supports 2x2 and 3x3 matrices.
 * @param {number[][]} m - The matrix
 * @returns {number|null} The determinant or null if not square/supported
 */
export const getDeterminant = (m) => {
    const rows = m.length;
    const cols = m[0].length;

    if (rows !== cols) return null; // Must be square

    if (rows === 2) {
        return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    } else if (rows === 3) {
        return (
            m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
            m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
            m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
        );
    }
    return null; // For now only 2x2 and 3x3
};

/**
 * Transposes a matrix.
 * @param {number[][]} m 
 * @returns {number[][]}
 */
export const getTranspose = (m) => {
    return m[0].map((_, colIndex) => m.map(row => row[colIndex]));
};

/**
 * Calculates the trace of a matrix (sum of diagonal elements).
 * @param {number[][]} m 
 * @returns {number|null}
 */
export const getTrace = (m) => {
    if (m.length !== m[0].length) return null;
    let sum = 0;
    for (let i = 0; i < m.length; i++) {
        sum += m[i][i];
    }
    return sum;
};

// Basic Arithmetic
export const addMatrices = (a, b) => {
    if (a.length !== b.length || a[0].length !== b[0].length) return null;
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
};

export const subtractMatrices = (a, b) => {
    if (a.length !== b.length || a[0].length !== b[0].length) return null;
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
};

export const multiplyMatrices = (a, b) => {
    const r1 = a.length, c1 = a[0].length;
    const r2 = b.length, c2 = b[0].length;
    if (c1 !== r2) return null;

    let result = new Array(r1).fill(0).map(() => new Array(c2).fill(0));
    for (let i = 0; i < r1; i++) {
        for (let j = 0; j < c2; j++) {
            for (let k = 0; k < c1; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
};

// Advanced
export const getInverse = (m) => {
    const n = m.length;
    if (n !== m[0].length) return null; // Must be square

    // Simple 2x2 case
    if (n === 2) {
        const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
        if (det === 0) return null; // Singular
        return [
            [m[1][1] / det, -m[0][1] / det],
            [-m[1][0] / det, m[0][0] / det]
        ];
    }
    // Simple 3x3 case using cofactor expansion
    if (n === 3) {
        const det = getDeterminant(m);
        if (det === 0) return null;

        const adj = [
            [
                (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
                -(m[0][1] * m[2][2] - m[0][2] * m[2][1]),
                (m[0][1] * m[1][2] - m[0][2] * m[1][1])
            ],
            [
                -(m[1][0] * m[2][2] - m[1][2] * m[2][0]),
                (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
                -(m[0][0] * m[1][2] - m[0][2] * m[1][0])
            ],
            [
                (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
                -(m[0][0] * m[2][1] - m[0][1] * m[2][0]),
                (m[0][0] * m[1][1] - m[0][1] * m[1][0])
            ]
        ];

        // Transpose Adj(A) to get Adjugate? No, standard formula Adj(A) is transpose of cofactor matrix.
        // The above matrix is actually the Transpose of Cofactor Matrix (Adjugate) if indexed [j][i].
        // Let's stick to standard layout then transpose.
        // Wait, the above IS the Adjugate directly because indices are swapped?
        // Row 0, Col 0 entry comes from minor M00. 
        // Row 0, Col 1 entry comes from minor M01? No, Inverse = (1/det) * Adj. Adj is C_transpose.
        // So Adj[0][1] should be Cofactor[1][0]. 
        // Let's implement generically later if needed, for now stick to simple structure.

        // Actually for 3x3 let's just use a simple verified implementation to avoid sign errors inline.
        // Re-implementing correctly:

        const A = m;
        const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

        result[0][0] = (A[1][1] * A[2][2] - A[1][2] * A[2][1]);
        result[0][1] = -(A[0][1] * A[2][2] - A[0][2] * A[2][1]);
        result[0][2] = (A[0][1] * A[1][2] - A[0][2] * A[1][1]);

        result[1][0] = -(A[1][0] * A[2][2] - A[1][2] * A[2][0]);
        result[1][1] = (A[0][0] * A[2][2] - A[0][2] * A[2][0]);
        result[1][2] = -(A[0][0] * A[1][2] - A[0][2] * A[1][0]);

        result[2][0] = (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
        result[2][1] = -(A[0][0] * A[2][1] - A[0][1] * A[2][0]);
        result[2][2] = (A[0][0] * A[1][1] - A[0][1] * A[1][0]);

        return result.map(row => row.map(val => parseFloat((val / det).toFixed(4))));
    }

    return null; // Not supported > 3 for now
};

export const getRank = (m) => {
    // Gaussian elimination for rank
    let mat = m.map(row => [...row]);
    let R = mat.length;
    let C = mat[0].length;
    let rank = C;

    for (let row = 0; row < rank; row++) {
        if (mat[row][row]) {
            for (let col = 0; col < R; col++) {
                if (col !== row) {
                    let mult = mat[col][row] / mat[row][row];
                    for (let i = 0; i < rank; i++) mat[col][i] -= mult * mat[row][i];
                }
            }
        } else {
            let reduce = true;
            for (let i = row + 1; i < R; i++) {
                if (mat[i][row]) {
                    [mat[row], mat[i]] = [mat[i], mat[row]];
                    reduce = false;
                    break;
                }
            }
            if (reduce) {
                rank--;
                for (let i = 0; i < R; i++) mat[i][row] = mat[i][rank];
            }
            row--;
        }
    }
    return rank;
};
