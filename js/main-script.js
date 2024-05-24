import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { ParametricGeometries } from "three/addons/geometries/ParametricGeometries.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, group, renderer, camera;
let directionalLight,
    ambientLight,
    spotLights = [],
    pointLights = [];
let mesh, geometry;

let mobStrip;
let skyDome;
let carousel, carouselAngle;
let rings, ringHeights, ringSpeeds;
let shapes, shapesAngle;

const loader = new THREE.TextureLoader();
const texture = loader.load("textures/AnOpticalPoem.png");
texture.colorSpace = THREE.LinearSRGBColorSpace;

const BASIC = {
    grey: new THREE.MeshBasicMaterial({
        color: 0x727272,
        side: THREE.DoubleSide,
    }),
    darkOrange: new THREE.MeshBasicMaterial({
        color: 0xfc6d00,
        side: THREE.DoubleSide,
    }),
    lightOrange: new THREE.MeshBasicMaterial({
        color: 0xfcc100,
        side: THREE.DoubleSide,
    }),
    lightBlue: new THREE.MeshBasicMaterial({
        color: 0x85e6fc,
        side: THREE.DoubleSide,
    }),
    red: new THREE.MeshBasicMaterial({
        color: 0xa52a2a,
        side: THREE.DoubleSide,
    }),
    skyDome: new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
    }),
    mobiusColor: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
    }),
};

const LAMBERT = {
    grey: new THREE.MeshLambertMaterial({
        color: 0x727272,
        side: THREE.DoubleSide,
    }),
    darkOrange: new THREE.MeshLambertMaterial({
        color: 0xfc6d00,
        side: THREE.DoubleSide,
    }),
    lightOrange: new THREE.MeshLambertMaterial({
        color: 0xfcc100,
        side: THREE.DoubleSide,
    }),
    lightBlue: new THREE.MeshLambertMaterial({
        color: 0x85e6fc,
        side: THREE.DoubleSide,
    }),
    red: new THREE.MeshLambertMaterial({
        color: 0xa52a2a,
        side: THREE.DoubleSide,
    }),
    skyDome: new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.BackSide,
    }),
    mobiusColor: new THREE.MeshLambertMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
    }),
};

const PHONG = {
    grey: new THREE.MeshPhongMaterial({
        color: 0x727272,
        side: THREE.DoubleSide,
    }),
    darkOrange: new THREE.MeshPhongMaterial({
        color: 0xfc6d00,
        side: THREE.DoubleSide,
    }),
    lightOrange: new THREE.MeshPhongMaterial({
        color: 0xfcc100,
        side: THREE.DoubleSide,
    }),
    lightBlue: new THREE.MeshPhongMaterial({
        color: 0x85e6fc,
        side: THREE.DoubleSide,
    }),
    red: new THREE.MeshPhongMaterial({
        color: 0xa52a2a,
        side: THREE.DoubleSide,
    }),
    skyDome: new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.BackSide,
    }),
    mobiusColor: new THREE.MeshPhongMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
    }),
};

const TOON = {
    grey: new THREE.MeshToonMaterial({
        color: 0x727272,
        side: THREE.DoubleSide,
    }),
    darkOrange: new THREE.MeshToonMaterial({
        color: 0xfc6d00,
        side: THREE.DoubleSide,
    }),
    lightOrange: new THREE.MeshToonMaterial({
        color: 0xfcc100,
        side: THREE.DoubleSide,
    }),
    lightBlue: new THREE.MeshToonMaterial({
        color: 0x85e6fc,
        side: THREE.DoubleSide,
    }),
    red: new THREE.MeshToonMaterial({
        color: 0xa52a2a,
        side: THREE.DoubleSide,
    }),
    skyDome: new THREE.MeshToonMaterial({
        map: texture,
        side: THREE.BackSide,
    }),
    mobiusColor: new THREE.MeshToonMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
    }),
};

const NORMAL = {
    grey: new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
    }),
    darkOrange: new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
    }),
    lightOrange: new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
    }),
    lightBlue: new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
    }),
    red: new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
    }),
    skyDome: new THREE.MeshNormalMaterial({
        side: THREE.BackSide,
    }),
    mobiusColor: new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
    }),
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
const RINGS_SPEED = 20;
const SHAPES_SPEED = 3;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    "use strict";
    scene = new THREE.Scene();
    group = new THREE.Group();

    addCamera();
    createSkyDome();
    createCarousel();
    addLights();
    setMaterials(LAMBERT);

    group.position.set(10, -DIMENSIONS.hBase - 5, 10);
    scene.add(group);
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
    camera.position.set(45 + 10, 40 - 5 - DIMENSIONS.hBase, 45 + 10);
    camera.lookAt(10, 15 - 5 - DIMENSIONS.hBase, 10);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

function addSpotLight(x, y, z, ring, obj) {
    let spotLight = new THREE.SpotLight(0xffffff, 50);
    spotLight.position.set(x, y, z);
    spotLight.distance = 15;
    spotLight.target = obj;
    ring.add(spotLight);
    spotLights.push(spotLight);
}

function addPointLights() {
    const radius = DIMENSIONS.rBase / 2;

    const pointLightCoords = [
        new THREE.Vector3(0, DIMENSIONS.hBase + 0.5, radius),
        new THREE.Vector3(radius, DIMENSIONS.hBase + 0.5, 0),
        new THREE.Vector3(0, DIMENSIONS.hBase + 0.5, -radius),
        new THREE.Vector3(-radius, DIMENSIONS.hBase + 0.5, 0),
        new THREE.Vector3(
            radius * Math.sin(Math.PI / 4),
            DIMENSIONS.hBase + 0.5,
            radius * Math.cos(Math.PI / 4),
        ),
        new THREE.Vector3(
            -1 * radius * Math.sin(Math.PI / 4),
            DIMENSIONS.hBase + 0.5,
            radius * Math.cos(Math.PI / 4),
        ),
        new THREE.Vector3(
            -1 * radius * Math.sin(Math.PI / 4),
            DIMENSIONS.hBase + 0.5,
            -1 * radius * Math.cos(Math.PI / 4),
        ),
        new THREE.Vector3(
            radius * Math.sin(Math.PI / 4),
            DIMENSIONS.hBase + 0.5,
            -1 * radius * Math.cos(Math.PI / 4),
        ),
    ];

    for (let i = 0; i < pointLightCoords.length; i++) {
        console.log(pointLightCoords[i]);
        let pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(...pointLightCoords[i]);
        pointLight.distance = 15;
        carousel.add(pointLight);
        pointLights.push(pointLight);
    }
}

function addLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.x = 5;
    directionalLight.position.z = 5;
    directionalLight.target = carousel;
    group.add(directionalLight);

    ambientLight = new THREE.AmbientLight(0xfcb73f, 0.2);
    group.add(ambientLight);

    addPointLights();
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createSkyDome() {
    geometry = new THREE.SphereGeometry(53);
    skyDome = new THREE.Mesh(geometry, LAMBERT.skyDome);
    group.add(skyDome);
}

function createCarousel() {
    "use strict";
    rings = Array(3);
    ringHeights = Array(3).fill(0);
    ringSpeeds = Array(3);
    for (let i = 0; i < ringSpeeds.length; i++) {
        ringSpeeds[i] = (Math.random() - 0.5) * 2 * RINGS_SPEED;
    }
    shapes = [];
    shapesAngle = 0;
    carouselAngle = 0;

    carousel = new THREE.Object3D();
    addBase(carousel, 0, DIMENSIONS.hBase / 2, 0);

    const startingPoint = [0, DIMENSIONS.hRing / 2, 0];

    createMobiusStrip(carousel, -2, DIMENSIONS.hBase + 5, -0.5);

    createRing(
        0,
        startingPoint,
        DIMENSIONS.rBase,
        DIMENSIONS.rInnerRing,
        LAMBERT.grey,
    );
    addShapes(rings[0], 1, X_AXIS, DIMENSIONS.rBase, DIMENSIONS.rInnerRing);
    carousel.add(rings[0]);

    createRing(
        1,
        startingPoint,
        DIMENSIONS.rInnerRing,
        DIMENSIONS.rMiddleRing,
        LAMBERT.lightBlue,
    );
    addShapes(
        rings[1],
        2,
        Y_AXIS,
        DIMENSIONS.rInnerRing,
        DIMENSIONS.rMiddleRing,
    );
    carousel.add(rings[1]);

    createRing(
        2,
        startingPoint,
        DIMENSIONS.rMiddleRing,
        DIMENSIONS.rOutterRing,
        LAMBERT.red,
    );
    addShapes(
        rings[2],
        3,
        Z_AXIS,
        DIMENSIONS.rMiddleRing,
        DIMENSIONS.rOutterRing,
    );
    carousel.add(rings[2]);

    group.add(carousel);
}

function addBase(obj, x, y, z) {
    "use strict";

    geometry = new THREE.CylinderGeometry(
        DIMENSIONS.rBase,
        DIMENSIONS.rBase,
        DIMENSIONS.hBase,
    );
    mesh = new THREE.Mesh(geometry, LAMBERT.lightOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createMobiusStrip(obj, x, y, z) {
    "use strict";

    geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array([
        -1,
        0,
        1, // 0
        -1,
        -2,
        1, // 1
        0.5,
        0,
        2.5, // 2
        1,
        -2,
        3, // 3
        3,
        -0.5,
        2.5, // 4
        4,
        -2,
        2, // 5
        4,
        -1,
        2, // 6
        5,
        -2,
        0, // 7
        4,
        -2,
        -1, // 8
        3,
        -2,
        -0.5, // 9
        3,
        -2,
        -2, // 10
        1,
        -2,
        -1, // 11
        2,
        -1,
        -2.5, // 12
        0,
        0,
        -1, // 13
        -1,
        -2,
        0, // 14
    ]);

    const indices = [
        0, 1, 2, 1, 2, 3, 2, 3, 4, 3, 4, 5, 4, 5, 6, 5, 6, 7, 6, 7, 8, 7, 8, 9,
        6, 7, 9, 8, 9, 10, 9, 10, 11, 10, 11, 12, 11, 12, 13, 11, 13, 14, 0, 1,
        14, 0, 13, 14,
    ];

    geometry.setIndex(indices);
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
    );

    geometry.computeVertexNormals();

    mobStrip = new THREE.Mesh(geometry, LAMBERT.mobiusColor);
    mobStrip.position.set(x, y, z);
    mobStrip.scale.multiplyScalar(1.2);

    obj.add(mobStrip);
}

function addShapes(obj, size, axis, innerRadius, outterRadius) {
    "use strict";
    const midRing = (outterRadius - innerRadius) / 2 + innerRadius;

    let torus = addTorus(obj, size, axis, 0, size * 2, midRing);
    addSpotLight(0, 0, midRing, obj, torus);

    let sphere = addSphere(obj, size, axis, midRing, size * 2, 0);
    addSpotLight(midRing, 0, 0, obj, sphere);

    let ellipsoid = addEllipsoid(
        obj,
        size,
        axis,
        midRing * Math.sin(Math.PI / 4),
        size * 2,
        midRing * Math.cos(Math.PI / 4),
    );
    addSpotLight(
        midRing * Math.sin(Math.PI / 4),
        0,
        midRing * Math.cos(Math.PI / 4),
        obj,
        ellipsoid,
    );

    let cylinder = addCylinder(
        obj,
        size,
        axis,
        -1 * midRing * Math.sin(Math.PI / 4),
        size * 2,
        midRing * Math.cos(Math.PI / 4),
    );
    addSpotLight(
        -1 * midRing * Math.sin(Math.PI / 4),
        0,
        midRing * Math.cos(Math.PI / 4),
        obj,
        cylinder,
    );

    let roundCone = addRoundCone(
        obj,
        size,
        axis,
        -1 * midRing * Math.sin(Math.PI / 4),
        size * 2,
        -1 * midRing * Math.cos(Math.PI / 4),
    );
    addSpotLight(
        -1 * midRing * Math.sin(Math.PI / 4),
        0,
        -1 * midRing * Math.cos(Math.PI / 4),
        obj,
        roundCone,
    );

    let hyperbolicParaboloid = addHyperbolicParaboloid(
        obj,
        size,
        axis,
        midRing * Math.sin(Math.PI / 4),
        size * 2,
        -1 * midRing * Math.cos(Math.PI / 4),
    );
    addSpotLight(
        midRing * Math.sin(Math.PI / 4),
        0,
        -1 * midRing * Math.cos(Math.PI / 4),
        obj,
        hyperbolicParaboloid,
    );

    let cone = addCone(obj, size, axis, -midRing, size * 2, 0);
    addSpotLight(-midRing, 0, 0, obj, cone);

    let cylinderCone = addCylinderCone(obj, size, axis, 0, size * 2, -midRing);
    addSpotLight(0, 0, -midRing, obj, cylinderCone);
}

function addTorus(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const theta = u * 2 * Math.PI;
        const phi = v * 2 * Math.PI;
        const R = size;
        const r = size / 2;

        const x = (R + r * Math.cos(theta)) * Math.cos(phi);
        const y = (R + r * Math.cos(theta)) * Math.sin(phi);
        const z = r * Math.sin(theta);

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    mesh.material.side = THREE.BackSide;
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function addSphere(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const theta = u * 2 * Math.PI;
        const phi = v * Math.PI;

        const x = size * Math.sin(phi) * Math.cos(theta);
        const y = size * Math.sin(phi) * Math.sin(theta);
        const z = size * Math.cos(phi);

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function addEllipsoid(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const theta = u * 2 * Math.PI;
        const phi = v * Math.PI;

        const x = (size / 2) * Math.sin(phi) * Math.cos(theta);
        const y = (size / 3) * Math.sin(phi) * Math.sin(theta);
        const z = size * Math.cos(phi);

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function addCylinder(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const theta = u * 2 * Math.PI;

        const x = Math.cos(theta);
        const y = Math.sin(theta);
        const z = v * size;

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function addCone(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const theta = u * 2 * Math.PI;

        const x = (v * size * Math.cos(theta)) / 2;
        const y = (v * size * Math.sin(theta)) / 2;
        const z = v * size;

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function addCylinderCone(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const theta = u * 2 * Math.PI;

        const x = (v * size + 1) * Math.cos(theta);
        const y = (v * size + 1) * Math.sin(theta);
        const z = (v * size) / 2;

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function addRoundCone(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const theta = u * 2 * Math.PI;

        const x = (v * size * Math.cos(theta)) / 2;
        const y = (v * size * Math.sin(theta)) / 2;
        const z = (v * size) ** 2 / 2;

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function addHyperbolicParaboloid(obj, size, axis, x, y, z) {
    "use strict";
    const equation = (u, v, vector) => {
        const x = size * (u - 0.5);
        const y = size * (v - 0.5);
        const z = (size * (x * x - y * y)) / 4;

        vector.set(y, z, x);
    };

    geometry = new ParametricGeometry(equation, 25, 25);

    mesh = new THREE.Mesh(geometry, LAMBERT.darkOrange);

    mesh.position.set(x, y, z);
    obj.add(mesh);
    shapes.push({ shape: mesh, axis: axis });
    return mesh;
}

function createRing(i, coordinates, innerRadius, outterRadius, material) {
    "use strict";

    rings[i] = new THREE.Object3D();

    const innerCircle = new THREE.Path();
    innerCircle.moveTo(0, 0);
    innerCircle.ellipse(0, 0, innerRadius, innerRadius, 0, Math.PI * 2);

    const ring = new THREE.Shape();
    ring.moveTo(0, 0);
    ring.ellipse(0, 0, outterRadius, outterRadius, 0, Math.PI * 2);
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
function update() {
    "use strict";
    const delta = clock.getDelta();

    for (let i = 0; i < rings.length; i++) {
        ringHeights[i] += ringSpeeds[i] * delta;
        ringHeights[i] = Math.max(ringHeights[i], MIN_RING_HEIGHT);
        ringHeights[i] = Math.min(ringHeights[i], MAX_RING_HEIGHT);

        rings[i].position.y = ringHeights[i];

        if (
            ringHeights[i] == MIN_RING_HEIGHT ||
            ringHeights[i] == MAX_RING_HEIGHT
        ) {
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

function setMaterials(material) {
    skyDome.material = material.skyDome;
    carousel.children[0].material = material.lightOrange;
    rings[0].children[0].material = material.grey;
    rings[1].children[0].material = material.lightBlue;
    rings[2].children[0].material = material.red;
    mobStrip.material = material.mobiusColor;

    material.darkOrange.side = THREE.DoubleSide;
    for (let i = 1; i < rings[0].children.length; i++) {
        rings[0].children[i].material = material.darkOrange;
        rings[1].children[i].material = material.darkOrange;
        rings[2].children[i].material = material.darkOrange;
    }
}

/////////////
/* DISPLAY */
/////////////
function render() {
    "use strict";
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    "use strict";
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

// /////////////////////
// /* ANIMATION CYCLE */
// /////////////////////
// function animate() {
//     'use strict';
//     update();
//     render();
//     requestAnimationFrame(animate);
// }

////////////////////////////
/*        EVENTS          */
////////////////////////////
function bindEvents() {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    "use strict";

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    "use strict";
    if (e.repeat) return;

    if (isFinite(e.key)) {
        try {
            ringSpeeds[e.key - 1] = ringSpeeds[e.key - 1] ? 0 : RINGS_SPEED;
        } catch (error) {}
    } else {
        switch (e.key) {
            case "D":
            case "d":
                directionalLight.visible = !directionalLight.visible;
                break;
            case "S":
            case "s":
                for (let i = 0; i < spotLights.length; i++) {
                    spotLights[i].visible = !spotLights[i].visible;
                }
                break;
            case "P":
            case "p":
                for (let i = 0; i < pointLights.length; i++) {
                    pointLights[i].visible = !pointLights[i].visible;
                }
                break;
            case "Q":
            case "q":
                setMaterials(LAMBERT);
                break;
            case "W":
            case "w":
                setMaterials(PHONG);
                break;
            case "E":
            case "e":
                setMaterials(TOON);
                break;
            case "R":
            case "r":
                setMaterials(NORMAL);
                break;
            case "T":
            case "t":
                setMaterials(BASIC);
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
}

init();
// animate();
