import { Behaviour, GameObject, showBalloonMessage, registerType, NeedleEngine, DragControls, InputEvents } from "@needle-tools/engine";
import { AxesHelper, GridHelper } from "three";
import * as THREE from "three";
import { loadRoomCapture } from "./lib/loadRoomCapture";

@registerType
export class MyMesh extends Behaviour {
    start() {
        console.log(this);
        showBalloonMessage("Hello Cube");
    }
    update(): void {
        // this.gameObject.rotateY(this.context.time.deltaTime);
        // console.log('update')
        // this.gameObject.updateMatrix();
    }
    onEnable(): void {
        console.log('onEnable')
    }
}

NeedleEngine.addContextCreatedCallback(args =>{
    const context = args.context;
    const scene = context.scene;

    loadRoomCapture("assets/livingroom-param.usdz").then((roomCapture: any) => {
        console.log('roomCapture', roomCapture);
        roomCapture.wallData.filter(({ name }) => name.indexOf('Bed') === -1 && name.indexOf('Bed') === -1).map((meshData) => {
            let geom = new THREE.PlaneGeometry( meshData.scale[0], meshData.scale[1] ); 
            let mat: THREE.MeshStandardMaterial | null = null;
            if (meshData.name.indexOf('Door') >= 0) {
                const texture = new THREE.TextureLoader().load("assets/door2.jpg");
                mat = new THREE.MeshStandardMaterial( {map: texture} );
            } else if (meshData.name.indexOf('Window') >= 0) {
                const texture = new THREE.TextureLoader().load("assets/window.jpg");
                mat = new THREE.MeshStandardMaterial( {map: texture} );
            } else if (meshData.name.indexOf('Storage') >= 0) {
                geom = new THREE.BoxGeometry( meshData.scale[0], meshData.scale[1] ); 
                const texture = new THREE.TextureLoader().load("assets/storage.jpg");
                mat = new THREE.MeshStandardMaterial( {map: texture} );
            } else {
                mat = new THREE.MeshStandardMaterial( { color: 0xcccccc } );
            } 
            const mesh = new THREE.Mesh(geom, mat); 
            const matrix = new THREE.Matrix4().fromArray(meshData.transform.flat());
            mesh.matrix.set(...matrix.toArray());
            mesh.applyMatrix4(matrix);
            console.log('meshData.name', meshData.name)
            if (meshData.name.indexOf('Door') >= 0) {
                mesh.translateZ(0.001);
            } else if (meshData.name.indexOf('Window') >= 0) {
                console.log('moving window')
                mesh.translateZ(0.001);
            }

            scene.add(mesh);
        });
        // const grid = new GridHelper();
        // scene.add(grid);
    
        // const axis = new AxesHelper();
        // scene.add(axis);
        const light = new THREE.AmbientLight(0xffffff, 1); // soft white light
        scene.add( light );
    
    });
    // const grid = new GridHelper();
    // scene.add(grid);

    // const axis = new AxesHelper();
    // // axis.position.y = 1;
    // scene.add(axis);
    
    // const wall0Texture = new THREE.TextureLoader().load("assets/3.jpg");
    // // texture.repeat.set( 4, 10 );
    // const wall0Geom = new THREE.PlaneGeometry( 3.805391550064087, 2.707406759262085); 
    // const wall0Mat = new THREE.MeshStandardMaterial(
    //     {
    //         map: wall0Texture,
    //     } ); 
    // const wall0 = new THREE.Mesh(wall0Geom, wall0Mat);
    // const wall0Matrix = new THREE.Matrix4().fromArray([0.5328444838523865, 0, -0.8462131023406982, 0, 0, 1, 0, 0, 0.846213161945343, 0, 0.5328444838523865, 0, -0.0875978022813797, -0.42723339796066284, -1.4540231227874756, 1 ]);//.transpose();
    // wall0.matrix.set(...wall0Matrix.toArray());
    // wall0.applyMatrix4(wall0Matrix);
    // // wall0.position.setFromMatrixColumn(wall0Matrix, 3);
    // // wall0.rotation.setFromRotationMatrix(wall0Matrix);
    // // wall0.scale.setFromMatrixScale(wall0Matrix);
    // scene.add(wall0);

    // const wall2Geom = new THREE.PlaneGeometry( 2.5646398067474365, 2.707406759262085 ); 
    // const wall2Mat = new THREE.MeshStandardMaterial( {
    //     color: 0x00ff00,
    //     // side: THREE.DoubleSide,
    // } ); 
    // const wall2 = new THREE.Mesh(wall2Geom, wall2Mat); 
    // const wall2Matrix = new THREE.Matrix4().fromArray([0.8462131023406982, 0, 0.5328444838523865, 0, 0, 1, 0, 0, -0.5328444838523865, 0, 0.8462130427360535, 0, 2.011359214782715, -0.42723339796066284, -2.3808324337005615, 1 ]);
    // wall2.matrix.set(...wall2Matrix.toArray());
    // wall2.applyMatrix4(wall2Matrix);
    // scene.add(wall2);

    // const doorTexture = new THREE.TextureLoader().load("assets/door.jpg");
    // const doorGeom = new THREE.PlaneGeometry( 0.8130638599395752, 2.078901529312134); 
    // const doorMat = new THREE.MeshStandardMaterial( {map: doorTexture} ); 
    // const door = new THREE.Mesh(doorGeom, doorMat); 
    // const doorMatrix = new THREE.Matrix4().fromArray([ 0.846213161945343, 0, 0.532844603061676, 0, 0, 1, 0, 0, -0.532844603061676, 0, 0.8462131023406982, 0, 1.4023292064666748, -0.7414860129356384, -2.764326810836792, 1 ]);
    // // door.position.setFromMatrixColumn(doorMatrix, 3);
    // // door.rotation.setFromRotationMatrix(doorMatrix);
    // // door.scale.setFromMatrixScale(doorMatrix);
    // door.matrix.set(...doorMatrix.toArray());
    // door.applyMatrix4(doorMatrix);
    // door.translateZ(0.01)
    
    // scene.add(door);

    // const light = new THREE.AmbientLight(0xffffff, 3); // soft white light
    // scene.add( light );

    // const dragControls = GameObject.addNewComponent(wall0, DragControls);
    // dragControls.showGizmo = false;
    // dragControls.useViewAngle = false;

    
})