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

let mobStrip;
let carousel, carouselAngle;
let rings, ringHeights, ringSpeeds;
let shapes, shapesAngle;

const loader = new THREE.TextureLoader();
const texture = loader.load("textures/AnOpticalPoem.png");

const MATERIALS = {
    grey: new THREE.MeshLambertMaterial({ color: 0x727272 }),
    darkOrange: new THREE.MeshLambertMaterial({ color: 0xfc6d00 }),
    lightOrange: new THREE.MeshLambertMaterial({ color: 0xfcc100 }),
    lightBlue: new THREE.MeshLambertMaterial({ color: 0x85e6fc }),
    red: new THREE.MeshLambertMaterial({ color: 0xa52a2a }),
    mobiusColor: new THREE.MeshLambertMaterial({ color: 0xff0000 , side: THREE.DoubleSide }),
    skyDome: new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }),
};

const DIMENSIONS = {
    hBase: 20,
    rBase: 5,
    hRing: 2,
    rInnerRing: 10,
    rMiddleRing: 20,
    rOutterRing: 30,
};

const clock = new THREE.Clock();

const MAX_RING_HEIGHT = DIMENSIONS.hBase,
      MIN_RING_HEIGHT = DIMENSIONS.hRing / 2;

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

const CAROUSEL_SPEED = 1;
const SHAPES_SPEED = 2;

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
    camera.position.set(60, 60, 60);
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
    shapes = [];
    shapesAngle = 0;
    carouselAngle = 0;

    carousel = new THREE.Object3D();
    addBase(carousel, 0, DIMENSIONS.hBase / 2, 0);

    const startingPoint = [0, DIMENSIONS.hRing / 2, 0];

    createMobiusStrip(carousel, -2, DIMENSIONS.hBase + 3.5, -0.5);
    
    createRing(0, startingPoint, DIMENSIONS.rBase, DIMENSIONS.rInnerRing, MATERIALS.grey);
    addShapes(rings[0], 1, X_AXIS, DIMENSIONS.rBase, DIMENSIONS.rInnerRing);
    carousel.add(rings[0]);

    createRing(1, startingPoint, DIMENSIONS.rInnerRing, DIMENSIONS.rMiddleRing, MATERIALS.lightBlue);
    addShapes(rings[1], 2, Y_AXIS, DIMENSIONS.rInnerRing, DIMENSIONS.rMiddleRing);
    carousel.add(rings[1]);

    createRing(2, startingPoint, DIMENSIONS.rMiddleRing, DIMENSIONS.rOutterRing, MATERIALS.red);
    addShapes(rings[2], 3, Z_AXIS, DIMENSIONS.rMiddleRing, DIMENSIONS.rOutterRing);
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

function createMobiusStrip(obj, x, y, z) {
    "use strict";
    mobStrip = new THREE.Object3D();
    mobStrip.add(new THREE.AxesHelper(10));
    
        geometry = new THREE.BufferGeometry();
        let vertices = new Float32Array([
            -1,0,1,          // 0
            -1,-2,1,        // 1    
            0.5,0,2.5,          // 2
            1,-2,3,         // 3    
            3,-0.5,2.5,          // 4
            4,-2,2,          // 5
            4,-1,2,          // 6
            5,-2,0,          // 7
            4,-2,-1,          // 8
            3,-2,-0.5,          // 9
            3,-2,-2,          // 10
            1,-2,-1,          // 11
            2,-1,-2.5,          // 12
            0,0,-1,          // 13
            -1,-2,0,          // 14
    ]);

    const indices = [
        0,1,2,
        1,2,3,
        2,3,4,
        3,4,5,
        4,5,6,
        5,6,7,
        6,7,8,
        7,8,9,
        6,7,9,
        8,9,10,
        9,10,11,
        10,11,12,
        11,12,13,
        11,13,14,
        0,1,14,
        0,13,14,
    ];

    geometry.setIndex(indices);
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
    );

    geometry.computeVertexNormals();
    
    //geometry = new ParametricGeometry( ParametricGeometries.mobius, 1, 10 );
    console.log(geometry.attributes.position);
    mesh = new THREE.Mesh(geometry, MATERIALS.mobiusColor);
    mesh.position.set(x, y, z);
    mesh.scale.multiplyScalar(1.5);

    obj.add(mesh);
}

function addShapes(obj, size, axis, innerRadius, outterRadius) {
    "use strict";
    const midRing = ((outterRadius - innerRadius) / 2) + innerRadius;

    addCylinder(obj, size, axis, 0, size * (3/2), midRing);
    addPyramidCylinder(obj, size, axis, midRing, size * (3/2), 0);
    addEllipsisCylinder(obj, size, axis, midRing - 2 * size, size, midRing - 2 * size);
    addInclinedEllipsisCylinder(obj, size, axis, -midRing + 2 * size, size, midRing - 2 * size);
}

function addCylinder(obj, size, axis, x, y, z) {
    "use strict";

    geometry = new THREE.CylinderGeometry(size, size, size*2);
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({shape: mesh, axis: axis});
}

function addPyramidCylinder(obj, size, axis, x, y, z) {
    "use strict";

    geometry = new THREE.CylinderGeometry(size*0.5, size, size*2);
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({shape: mesh, axis: axis});
}

function addEllipsisCylinder(obj, size, axis, x, y, z) {
    const base = drawBase(size);

    const v1 = new THREE.Vector3(0, 0, 0);
    const v2 = new THREE.Vector3(0, 2 * size, 0);
    const path = new THREE.LineCurve3(v1, v2)

    const extrudeSettings = {
        extrudePath: path,
    };

    geometry = new THREE.ExtrudeGeometry(base, extrudeSettings);
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({shape: mesh, axis: axis});
}

function addInclinedEllipsisCylinder(obj, size, axis, x, y, z) {
    const base = drawBase(size);
    let v1, v2;
    let path = new THREE.CurvePath();

    v1 = new THREE.Vector3(0, 0, 0);
    v2 = new THREE.Vector3(0, 1, 0);
    path.add(new THREE.LineCurve3(v1, v2));

    v1 = new THREE.Vector3(0, 1, 0);
    v2 = new THREE.Vector3(size/2, size * 2 - 1, size/2);
    path.add(new THREE.LineCurve3(v1, v2));

    v1 = new THREE.Vector3(size/2, size * 2 - 1, size/2);
    v2 = new THREE.Vector3(size/2, size * 2, size/2);
    path.add(new THREE.LineCurve3(v1, v2));

    const extrudeSettings = {
        extrudePath: path,
    };

    geometry = new THREE.ExtrudeGeometry(base, extrudeSettings);
    mesh = new THREE.Mesh(geometry, MATERIALS.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({shape: mesh, axis: axis});
    console.log(mesh);
}

function drawBase(size) {
    const base = new THREE.Shape();
    base.moveTo(0, 0);
    base.ellipse(
        0, 0,
        size * (2/3), size * (3/2),
        0, Math.PI * 2,
    );
    return base;
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
        curveSegments: 50,
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

    shapesAngle += SHAPES_SPEED * delta;
    if (shapesAngle >= 2 * Math.PI) shapesAngle = 0;
    for (let i = 0; i < shapes.length; i++) {
        shapes[i].shape.setRotationFromAxisAngle(shapes[i].axis, shapesAngle);
    }
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
