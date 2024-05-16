import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, renderer, camera
let directionalLight, ambientLight;
let mesh, geometry;

let carousel, carouselAngle;
let rings, ringHeights, ringSpeeds;

const loader = new THREE.TextureLoader();
const texture = loader.load("textures/AnOpticalPoem.png");

const MATERIALS = {
    grey: new THREE.MeshLambertMaterial({ color: 0x727272 }),
    darkOrange: new THREE.MeshLambertMaterial({ color: 0xfc6d00 }),
    lightOrange: new THREE.MeshLambertMaterial({ color: 0xfcc100 }),
    lightBlue: new THREE.MeshLambertMaterial({ color: 0x85e6fc }),
    red: new THREE.MeshLambertMaterial({ color: 0xa52a2a }),
    skyDome: new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }),
};

const DIMENSIONS = {
    hBase: 20,
    rBase: 5,
    hRing: 2,
    rInnerRing: 10,
    rMiddleRing: 15,
    rOutterRing: 20,
};

const clock = new THREE.Clock();

const MAX_RING_HEIGHT = DIMENSIONS.hBase,
      MIN_RING_HEIGHT = DIMENSIONS.hRing / 2;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const CAROUSEL_SPEED = 1;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    scene = new THREE.Scene();

    addCamera();
    addLights();
    createSkyDome();
    createCarousel();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function addCamera() {
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000,
    );
    camera.position.set(40, 40, 40);
    camera.lookAt(0, 25, 0);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function addLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.x = 5;
    directionalLight.position.z = 5;
    scene.add(directionalLight);

    ambientLight = new THREE.AmbientLight(0xfcb73f);
    scene.add(ambientLight);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createSkyDome() {
    geometry = new THREE.SphereGeometry(70);
    mesh = new THREE.Mesh(geometry, MATERIALS.skyDome);
    scene.add(mesh);

}

function createCarousel() {
    "use strict";
    rings = Array(3);
    ringHeights = Array(3).fill(0);
    ringSpeeds = Array(3).fill(0);
    carouselAngle = 0;

    carousel = new THREE.Object3D();
    addBase(carousel, 0, DIMENSIONS.hBase / 2, 0);

    const startingPoint = [0, DIMENSIONS.hRing / 2, 0];

    createRing(0, startingPoint, DIMENSIONS.rBase, DIMENSIONS.rInnerRing, MATERIALS.grey);
    carousel.add(rings[0]);

    createRing(1, startingPoint, DIMENSIONS.rInnerRing, DIMENSIONS.rMiddleRing, MATERIALS.lightBlue);
    carousel.add(rings[1]);

    createRing(2, startingPoint, DIMENSIONS.rMiddleRing, DIMENSIONS.rOutterRing, MATERIALS.red);
    addBox(
        rings[2],
        DIMENSIONS.rMiddleRing - (2 ** (1/2)) / 2,
        1 + DIMENSIONS.hRing / 2,
        DIMENSIONS.rMiddleRing - (2 ** (1/2)) / 2,
    );
    carousel.add(rings[2]);

    scene.add(carousel);
}

function addBase(obj, x, y, z) {
    "use strict";

    geometry = new THREE.CylinderGeometry(
        DIMENSIONS.rBase,
        DIMENSIONS.rBase,
        DIMENSIONS.hBase,
    );
    mesh = new THREE.Mesh(geometry, MATERIALS.lightOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addBox(obj, x, y, z) {
    "use strict";

    geometry = new THREE.BoxGeometry(2, 2, 2);
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function createRing(i, coordinates, innerRadius, outterRadius, material) {
    "use strict";

    rings[i] = new THREE.Object3D();

    const innerCircle = new THREE.Path();
    innerCircle.moveTo(0, 0);
    innerCircle.ellipse(
        0, 0,
        innerRadius,
        innerRadius,
        0, Math.PI * 2,
    );

    const ring = new THREE.Shape();
    ring.moveTo(0, 0);
    ring.ellipse(
        0, 0,
        outterRadius,
        outterRadius,
        0, Math.PI * 2,
    );
    ring.holes = [innerCircle];

    const extrudeSettings = {
        depth: DIMENSIONS.hRing,
    };

    geometry = new THREE.ExtrudeGeometry(ring, extrudeSettings);
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(Math.PI / 2);

    rings[i].add(mesh);
    rings[i].position.set(...coordinates);
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';
    const delta = clock.getDelta();

    for (let i = 0; i < rings.length; i++) {
        ringHeights[i] += ringSpeeds[i] * delta;
        ringHeights[i] = Math.max(ringHeights[i], MIN_RING_HEIGHT);
        ringHeights[i] = Math.min(ringHeights[i], MAX_RING_HEIGHT);

        rings[i].position.y = ringHeights[i];

        if (ringHeights[i] == MIN_RING_HEIGHT || ringHeights[i] == MAX_RING_HEIGHT) {
            ringSpeeds[i] = -ringSpeeds[i];
        }
    }

    carouselAngle += CAROUSEL_SPEED * delta;
    if (carouselAngle >= 2 * Math.PI) carouselAngle = 0;

    carousel.setRotationFromAxisAngle(Y_AXIS, carouselAngle);
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.setAnimationLoop(() => {
        update();
        render();
    });
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    bindEvents();
    createScene();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    update();
    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/*        EVENTS          */
////////////////////////////
function bindEvents() {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    "use strict";
    if (e.repeat) return;

    if (isFinite(e.key)) {
        try {
            ringSpeeds[e.key - 1] = 20;
        } catch(error) {}
    } else {
        switch(e.key) {
            case 'd':
                directionalLight.intensity = directionalLight.intensity ? 0 : 1;
                break;
            default:
                break;
        }
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    "use strict";
    if (isFinite(e.key)) {
        try {
            ringSpeeds[e.key - 1] = 0;
        } catch(error) {}
    }
}

init();
animate();
