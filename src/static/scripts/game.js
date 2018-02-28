var gl;
var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
var squarePos = [0.0, 0.0, 0.0];
var keyMap = [];

function initGL(canvas) {
    gl = canvas.getContext("webgl");
    
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }

    gl.viewportWidth = canvas.offsetWidth;
    gl.viewportHeight = canvas.offsetHeight;
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    var str = "";
    var k;
    var shader;

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

function initBuffers() {
    var triangleVertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    var squareVertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];

    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

function drawTriangle() {
    mat4.translate(mvMatrix, [-7.2, 6.3, -20.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}

function moveSquare(xPos, yPos) {
    squarePos[0] += xPos;
    squarePos[1] += yPos;
}

function drawSquare() {
    mat4.translate(mvMatrix, squarePos);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function setBackground() {
    gl.clearColor(0.2, 0.0, 0.0, 1.0);
}

function setView() {
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
}

function webGLStart() {
    var canvas = document.getElementById("game-canvas");

    initGL(canvas);
    initShaders();
    initBuffers();

    setBackground();
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setView();

    mat4.identity(mvMatrix);

    drawTriangle();
    drawSquare(0.0, 0.0);

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
        moveSquare(0.0, -0.1);
    }

    if (keyMap[39] || keyMap[68]) {
        moveSquare(0.1, 0.0);
    }

    if (keyMap[38] || keyMap[87]) {
        moveSquare(0.0, 0.1);
    }

    if (keyMap[37] || keyMap[65]) {
        moveSquare(-0.1, 0.0);
    }

    drawTriangle();
    drawSquare();

    setTimeout(gameLoop, 10);
}