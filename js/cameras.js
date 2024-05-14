import * as THREE from "three";
export { createCameras };
export {
    lateralCamera,
    topCamera,
    frontalCamera,
    broadPCamera,
    broadOCamera,
};

let lateralCamera,
    topCamera,
    frontalCamera,
    broadPCamera,
    broadOCamera;

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    createLateralCamera();
    createFrontalCamera();
    createTopCamera();
    createBroadPerpectiveCamera();
    createBroadOrthographicCamera();
}

function createLateralCamera() {
    "use strict";
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    lateralCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    lateralCamera.position.set(0, 30, 70);
    lateralCamera.lookAt(0, 30, 0);
}

function createFrontalCamera() {
    "use strict";
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    frontalCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    frontalCamera.position.set(100, 30, 0);
    frontalCamera.lookAt(0, 30, 0);
}

function createTopCamera() {
    "use strict";
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    topCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    topCamera.position.set(0, 70, 0);
    topCamera.lookAt(0, 0, 0);
}

function createBroadPerpectiveCamera() {
    "use strict";
    broadPCamera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    broadPCamera.position.set(40, 40, 40);
    broadPCamera.lookAt(0, 25, 0);
}

function createBroadOrthographicCamera() {
    "use strict";
    let aspectRatio = window.innerWidth / window.innerHeight;
    let viewSize = 70;
    broadOCamera = new THREE.OrthographicCamera(
        (aspectRatio * viewSize) / -2,
        (aspectRatio * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        1000,
    );
    broadOCamera.position.set(40, 40, 40);
    broadOCamera.lookAt(0, 25, 0);
}
