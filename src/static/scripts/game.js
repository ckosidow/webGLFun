const mvMatrix = mat4.create();
const pMatrix = mat4.create();
const keyMap = [];
let player = null;
let worldObjects = [];
let gl;
let shaderProgram;
let triangleVertexPositionBuffer;

class WorldObject {
    constructor(position, vertices) {
        this.position = position;
        this.vertices = vertices;
    }

    applyGravity() {

    }

    initBuffer(itemSize, numItems) {
        this.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        this.vertexPositionBuffer.itemSize = itemSize;
        this.vertexPositionBuffer.numItems = numItems;
    }

    drawTriangle() {
        mat4.translate(mvMatrix, this.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexPositionBuffer.numItems);
    }

    drawSquare() {
        mat4.translate(mvMatrix, this.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexPositionBuffer.numItems);
    }

    move(xPos, yPos) {
        this.position[0] += xPos;
        this.position[1] += yPos;
    }
}

function initGL(canvas) {
    gl = canvas.getContext("webgl");
    
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }

    gl.viewportWidth = canvas.offsetWidth;
    gl.viewportHeight = canvas.offsetHeight;
}

function getShader(gl, id) {
    const shaderScript = document.getElementById(id);
    let str = "";
    let k;
    let shader;

    if (!shaderScript) {
        return null;
    }

    k = shaderScript.firstChild;

    while (k) {
        if (k.nodeType === 3) {
            str += k.textContent;
        }

        k = k.nextSibling;
    }

    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));

        return null;
    }

    return shader;
}

function initShaders() {
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, getShader(gl, "shader-vs"));
    gl.attachShader(shaderProgram, getShader(gl, "shader-fs"));
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function setBackground() {
    gl.clearColor(0.2, 0.0, 0.0, 1.0);
}

function setView() {
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
}

function webGLStart() {
    const canvas = document.getElementById("game-canvas");
    const triangle = new WorldObject([-7.2, 6.3, -20.0], [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ]);

    player = new WorldObject([0.0, 0.0, 0.0], [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ]);

    initGL(canvas);
    initShaders();

    triangle.initBuffer(3, 3);
    player.initBuffer(3, 4);

    worldObjects.push(triangle);

    setBackground();
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setView();

    mat4.identity(mvMatrix);

    onkeydown = keyHandler;
    onkeyup = keyHandler;

    gameLoop();
}

function keyHandler(e) {
    e = e || event;
    keyMap[e.keyCode] = e.type === 'keydown';
}

function gameLoop() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.identity(mvMatrix);

    if (keyMap[40] || keyMap[83]) {
        player.move(0.0, -0.1);
    }

    if (keyMap[39] || keyMap[68]) {
        player.move(0.1, 0.0);
    }

    if (keyMap[38] || keyMap[87]) {
        player.move(0.0, 0.1);
    }

    if (keyMap[37] || keyMap[65]) {
        player.move(-0.1, 0.0);
    }

    for (var obj of worldObjects) {
        obj.drawTriangle();
    }

    player.drawSquare();

    setTimeout(gameLoop, 13);
}