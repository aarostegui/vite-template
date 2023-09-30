export function transformPoint(point:number[], matrix: number[][]) {
    const [x, y, z] = point;
    const w = 1;  // Homogeneous coordinate

    const transformed = [0, 0, 0, 0];

    transformed[0] = x * matrix[0][0] + y * matrix[0][1] + z * matrix[0][2] + w * matrix[0][3];
    transformed[1] = x * matrix[1][0] + y * matrix[1][1] + z * matrix[1][2] + w * matrix[1][3];
    transformed[2] = x * matrix[2][0] + y * matrix[2][1] + z * matrix[2][2] + w * matrix[2][3];
    transformed[3] = x * matrix[3][0] + y * matrix[3][1] + z * matrix[3][2] + w * matrix[3][3];

    // If you want to convert back from homogeneous coordinates, you'd do:
    if (transformed[3] !== 1 && transformed[3] !== 0) {
        transformed[0] /= transformed[3];
        transformed[1] /= transformed[3];
        transformed[2] /= transformed[3];
    }
    return transformed.slice(0, 3); // return only the x, y, z values
}

export function distance3D(point1: number[], point2: number[]) {
    const [x1, y1, z1] = point1;
    const [x2, y2, z2] = point2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
export function transpose(matrix: number[][]) {
    // If the matrix is empty, return an empty array
    if (matrix.length === 0) return [];

    // Create a new matrix with the number of columns as rows and vice versa
    const transposed = Array.from(
        { length: matrix[0].length },
        () => Array(matrix.length).fill(0)
    );

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }

    return transposed;
}




