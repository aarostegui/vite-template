import * as THREE from "three";
import { processUsdzFile } from "./usdz";

export const loadRoomCapture = async (url: string) => {
    return new Promise((resolve, reject) => {
        const loader = new THREE.FileLoader();
        loader.setResponseType( 'arraybuffer' );

        //load a text file and output the result to the console
        loader.load(
            // resource URL
            url,

            // onLoad callback
            function ( data: string | ArrayBuffer ) {
                // output the text to the console
                if (typeof data === 'string') {
                    console.log('data is string');
                } else {
                    console.log('data is array buffer');
                }
                processUsdzFile(data as ArrayBuffer, 'parametric').then((_roomCapture) => {
                    resolve(_roomCapture);
                });
            },

            // onProgress callback
            function ( xhr ) {
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            // onError callback
            function ( err ) {
                console.error( 'An error happened' );
                reject(err);
            }
        );
    });
}