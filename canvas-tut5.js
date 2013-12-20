var canvas, gl, program, screenRes;
var bgCol, rectCol;
var canvasWidth = 400;
var canvasHeight = 300;
var screenResx = 20;
var lastTime = 0;
var fpsNow = 0.0;
var fpsCounter;
var vShader="";
var fShader="";

function getShaderText() {

   vShader=
"attribute vec2 a_position; " +
"uniform vec2 u_resolution; " +
"void main(){ " +
"vec2 scaledPos = a_position / u_resolution; " +
"gl_Position = vec4(scaledPos, 0, 1); " +
"}";

   fShader=
"precision mediump float; " +
"uniform vec4 u_color; " +
"void main() { " +
"gl_FragColor = u_color; " +
"}";

}

function setCanvas() {
   canvas.width = canvasWidth;
   canvas.height = canvasHeight;
}

function init() {
   canvas = document.getElementById( "canvas" );
   setCanvas();
   gl = getWebGLContext( canvas );
   if (!gl) { return; }

   getShaderText();
   var vertexShader = setupShader( gl, vShader, "x-shader/x-vertex" );
   var fragmentShader = setupShader( gl, fShader, "x-shader/x-fragment" );

   program = createProgram( gl, [vertexShader, fragmentShader] );
   gl.useProgram( program );

   screenRes = new Float32Array(
      [screenResx, screenResx * canvas.height / canvas.width] );
   fpsCounter = new Float32Array(
      [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] );
}

function createBuffer( bufferData, color, iSize, iNum ) {
   var glColor = gl.getUniformLocation( program, "u_color" );
   var glPosition = gl.getAttribLocation( program, "a_position" );

   var buffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, buffer );

   var glResolution = gl.getUniformLocation( program, "u_resolution" );

   gl.uniform2f( glResolution, screenRes[0], screenRes[1] );
   gl.bufferData( gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW );

   buffer.itemSize = iSize;
   buffer.numItems = iNum;

   gl.uniform4f( glColor, color[0], color[1], color[2], color[3] );
   gl.enableVertexAttribArray( glPosition );
   gl.vertexAttribPointer( glPosition, buffer.itemSize, gl.FLOAT, false, 0, 0 );

   gl.drawArrays(gl.TRIANGLES, 0, buffer.numItems);
}

function rect( x, y, width, height, color ) {
   var x1 = x;
   var x2 = x + width;
   var y1 = y;
   var y2 = y + height;
   createBuffer( new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2]),
      color, 2, 6 );
}

function pix( x, y, color ) {
   var x1 = x;
   var x2 = x + 1.0;
   var y1 = y;
   var y2 = y + 1.0;
   createBuffer( new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2]),
      color, 2, 6 );
}

function clearScreen( bgCol ) {
   rect( -screenRes[0], -screenRes[1], screenRes[0]*2, screenRes[1]*2, bgCol );
   gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function clearScene() {
   gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function updateCtr() {
   var timeNow = new Date().getTime();
   if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
      if( elapsed == 0 ) { fpsNow = 50.0 } else {
         fpsNow = Math.round(1000 / elapsed); }
      for ( var ii = 15; ii > 0; --ii ) {
         fpsCounter[ii + 1] = fpsCounter[ii];
      }
      fpsCounter[1] = fpsNow;
      fpsNow = 0;
      for ( ii = 1; ii < 17; ++ii ) {
         fpsNow += fpsCounter[ii];
      }
      fpsNow /= 16;
      fpsCounter[0] = Math.round(fpsNow);

      debugChange( fpsCounter[0].toString(), "counter" );
   }
   lastTime = timeNow;
}

function animate() {
   updateCtr();

   rectCol = [0.1, 0.8, 0.8, 1.0];
   for ( var ii = 0; ii < 20; ++ii) {
      pix( ii, ii, rectCol );
   }
}

function tick() {
   requestAnimFrame(tick);
   clearScreen( bgCol );
   animate();
}


// ******************** MAIN ******************** //

function main() {
   init();
   debug( "Starting ...", "canvasDiv" );

   rectCol = new Float32Array( [1.0, 0.4, 0.3, 1.0] );
   bgCol = new Float32Array( [1.0, 0.4, 0.3, 1.0] );
   clearScreen( bgCol );

   gl.clearColor(1.0, 0.2, 0.1, 1.0);
//   gl.enable(gl.DEPTH_TEST);

   debugAdd( "--- Running ... ---", "counter", "canvasDiv" );

   tick();
}

// ********************************************** //
