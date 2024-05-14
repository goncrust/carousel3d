export { bindEvents, pressedKeys };

let pressedKeys = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    q: false,
    a: false,
    w: false,
    s: false,
    e: false,
    d: false,
    r: false,
    f: false,
};

////////////////////////////
/*        EVENTS          */
////////////////////////////
function bindEvents() {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    "use strict";
    if (!pressedKeys.hasOwnProperty(e.key)) {
        return;
    }

    pressedKeys[e.key] = isFinite(e.key) ? !e.repeat : true;
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    "use strict";
    if (!pressedKeys.hasOwnProperty(e.key)) {
        return;
    }

    pressedKeys[e.key] = false;
}
