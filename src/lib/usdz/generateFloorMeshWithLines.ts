// Extracts unique points from the lines.
function extractUniquePointsFromLines(lines: number[][][]) {
    const pointsSet = new Set<string>();

    lines.forEach(line => {
        line.forEach(point => {
            pointsSet.add(JSON.stringify(point));
        });
    });

    return [...pointsSet].map((pointStr) => JSON.parse(pointStr));
}

// Computes the convex hull using Graham's Scan.
function grahamScan(points: number[][]) {
    function sortPolar(a: number[], b: number[]) {
        const angleA = Math.atan2(a[1] - points[0][1], a[0] - points[0][0]);
        const angleB = Math.atan2(b[1] - points[0][1], b[0] - points[0][0]);
        return angleA - angleB;
    }

    function crossProduct(o: number[], a: number[], b: number[]) {
        return (a[0] - o[0]) * (b[1] - o[1]) - (b[0] - o[0]) * (a[1] - o[1]);
    }

    points.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
    const sortedPoints = [...points].sort(sortPolar);

    const hull = [points[0], sortedPoints[0]];

    for (let i = 1; i < sortedPoints.length; i++) {
        while (hull.length > 1 && crossProduct(hull[hull.length - 2], hull[hull.length - 1], sortedPoints[i]) <= 0) {
            hull.pop();
        }
        hull.push(sortedPoints[i]);
    }

    return hull;
}

// Triangulates the convex polygon.
function triangulateConvexPolygon(polygon: number[][]) {
    const triangles = [];
    for (let i = 1; i < polygon.length - 1; i++) {
        triangles.push([polygon[0], polygon[i], polygon[i + 1]]);
    }
    return triangles;
}

// Computes the convex hull mesh from a set of 2D lines.
export function generateConvexHullMeshFromLines(lines: number[][][]) {
    const points = extractUniquePointsFromLines(lines);
    const convexHull = grahamScan(points);
    return triangulateConvexPolygon(convexHull);
}
// Calculate the area of a single triangle.
export function triangleArea(triangle: number[][]) {
    const [[x1, y1], [x2, y2], [x3, y3]] = triangle;
    return 0.5 * Math.abs(x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2));
}

// Calculate the total area of a triangle mesh.
export function meshArea(mesh: number[][][]) {
    return mesh.reduce((acc, triangle) => acc + triangleArea(triangle), 0);
}

// // Test
// const mesh = [
//     [[0, 0], [1, 0], [0, 1]],
//     [[1, 0], [1, 1], [0, 1]]
// ];

// console.log(meshArea(mesh)); // Should print the area of the triangle mesh

// // Example usage:
// const lines = [
//     [[0, 0], [1, 0]],
//     [[0, 5], [1, 5]]
// ];

// console.log(generateConvexHullMeshFromLines(lines));
// console.log(meshArea(generateConvexHullMeshFromLines(lines)));