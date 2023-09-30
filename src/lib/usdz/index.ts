import { unzip } from "unzipit";
import { generateConvexHullMeshFromLines, meshArea, triangleArea } from "./generateFloorMeshWithLines";
import { transformPoint, transpose } from "./transformAndDistance";
export const round = (value: number, decimals: number = 2) => {
    const x = Math.pow(10, decimals);
    return Math.round(value * x) / x;
  }
  
export function extractUSDData(name: string, content: string, mode: 'mesh' | 'parametric' = 'mesh') {

    if (mode === 'mesh') {
        const _faceVertexCounts = content.match(/faceVertexCounts\s?=\s?(\[.*?\])/s);
        const faceVertexCounts = _faceVertexCounts ? JSON.parse(_faceVertexCounts[1].replaceAll('(', '[').replaceAll(')', ']')) : [];
        
        if (faceVertexCounts.some((count: number) => count !== 3)) throw new Error('Only triangular meshes are supported');
        
        const _faceVertexIndices = content.match(/faceVertexIndices\s?=\s?(\[.*?\])/s);
        const faceVertexIndices = _faceVertexIndices ? JSON.parse(_faceVertexIndices[1].replaceAll('(', '[').replaceAll(')', ']')) : [];

        const _normals = content.match(/normals\s?=\s?(\[.*?\])/s);
        const normals = _normals ? JSON.parse(_normals[1].replaceAll('(', '[').replaceAll(')', ']')) : [];

        const _points = content.match(/points\s?=\s?(\[.*?\])/s);
        const points = _points ? JSON.parse(_points[1].replaceAll('(', '[').replaceAll(')', ']')) : [];

        // group indices in 3s
        const triangles = [];
        const triangleNormals: (number[])[] = [];
        for (let i = 0; i < faceVertexIndices.length; i += 3) {
            const faceIndices = faceVertexIndices.slice(i, i + 3);
            triangles.push(faceIndices.map((index: number) => points[index]));
            triangleNormals.push(normals[faceIndices[0]]);
        }
        const innerTriangles = triangles.filter((_, index) => {
            const normal = triangleNormals[index];
            return normal[0] === 0 && normal[1] === 0 && normal[2] === 1;
        });
        const maxX = innerTriangles.reduce((acc, triangle) => {
            const x = Math.max(...triangle.map((point: number[]) => point[0]));
            console.log('max x', x, acc);
            return Math.max(acc, x);
        }, 0);
        const minX = innerTriangles.reduce((acc, triangle) => {
            const x = Math.min(...triangle.map((point: number[]) => point[0]));
            console.log('min x', x, acc);
            return Math.max(acc, x);
        }, -Infinity);
        const maxWidth = maxX - minX;
        const maxY = innerTriangles.reduce((acc, triangle) => {
            const y = Math.max(...triangle.map((point: number[]) => point[1]));
            console.log('max y', y, acc);
            return Math.max(acc, y);
        }, 0);
        const minY = innerTriangles.reduce((acc, triangle) => {
            const y = Math.min(...triangle.map((point: number[]) => point[1]));
            console.log('min y', y, acc);
            return Math.max(acc, y);
        }, -Infinity);
        const maxHeight = maxY - minY;


        const innerArea = innerTriangles.reduce((acc, triangle) => acc + triangleArea(triangle), 0);
        const bottomLines = triangles.filter((triangle: number[], index) => {
            const normal = triangleNormals[index];
            return normal[0] === 0 && normal[1] === -1 && normal[2] === 0;
        }).map((triangle: number[][]) => triangle.filter((point: number[]) => point[2] === 0));

        const _transform = content.match(/xformOp:transform\s?=(\s?\(\s?\(.*?\)\s?\))/s);
        const transform = _transform ? JSON.parse(_transform[1].replaceAll('(', '[').replaceAll(')', ']')) : [];
        
        return {
            name,
            faceVertexCounts,
            faceVertexIndices,
            normals,
            points,
            triangles,
            transform,
            innerTriangles,
            bottomLines,
            triangleNormals,
            innerArea,
            maxWidth,
            maxHeight,
            maxPerimeter: 2 * (maxWidth + maxHeight),
        };
    } else {
        console.log('processing parametric', name)
        const _scale = content.match(/scale\s?=\s?(.*?\))/s);
        console.log('_scale', _scale);
        const scale = _scale ? JSON.parse(_scale[1].replaceAll('(', '[').replaceAll(')', ']')) : [];
        console.log('scale', scale);
        const _transform = content.match(/xformOp:transform\s?=(\s?\(\s?\(.*?\)\s?\))/s);
        const transform = _transform ? JSON.parse(_transform[1].replaceAll('(', '[').replaceAll(')', ']')) : [];
        console.log('transform', transform);
        return {
            name,
            scale,
            transform,
        }
    }
}
const unzipFile = async (buffer: ArrayBuffer) => {
    const unzipped = await unzip(buffer);
    return unzipped.entries;
      
  }
export const processUsdzFile = async (buffer: ArrayBuffer, mode: 'parametric' | 'mesh') => {
    const entries = await unzipFile(buffer);
    console.log('entries', entries);
    const wallKeys = Object.keys(entries);//.filter((entry) => entry.indexOf('Wall') !== -1);
    if (wallKeys.length === 0) {
        alert('No se ha encontrado paredes en el archivo.');
        return;
    }
    const wallData = await Promise.all(wallKeys.map(async (wallKey) => {
        const wallFile = entries[wallKey];
        // get string from blob
        const text = await wallFile.text();
        // console.log('text', text);
        return extractUSDData(wallKey, text, mode);
    }));
    if (mode === 'mesh') {
        const floorLines = wallData.map((wall) => wall.bottomLines.map((line) => line.map((point) => {
            const transformed = transformPoint(point, transpose(wall.transform));
            return transformed;
        }))).flat();
        const floorMesh = generateConvexHullMeshFromLines(floorLines);
        const floorArea = meshArea(floorMesh);
        const wallArea = wallData.reduce((acc, wall) => acc + wall.innerArea, 0);
        const wallPerimeter = wallData.reduce((acc, wall) => acc + wall.maxPerimeter, 0);
        // we leverage walls to get the perimeter of the floor and ceiling
        const maxFloorPerimeter = wallData.reduce((acc, wall) => acc + wall.maxWidth, 0);
        return { wallData, floorMesh, measurements: {
                floorArea: round(floorArea),
                ceilingArea: round(floorArea),
                wallArea: round(wallArea),
                wallPerimeter: round(wallPerimeter),
                maxFloorPerimeter: round(maxFloorPerimeter),
                maxCeilingPerimeter: round(maxFloorPerimeter)
            }
        };
    } else {
        return { wallData }
    }
        
}

export const getRandomMeasurements = () => {
    const floorArea = round(Math.random() * 100, 2);
    const wallArea = round(Math.random() * 100, 2);
    const wallPerimeter = round(Math.random() * 100, 2);
    const maxFloorPerimeter = round(Math.random() * 100, 2);
    return { floorArea, ceilingArea: floorArea, wallArea, wallPerimeter, maxFloorPerimeter, maxCeilingPerimeter: maxFloorPerimeter };
}