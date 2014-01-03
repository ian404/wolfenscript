var canvas, gl, program, screenRes;
var bgCol, rectCol;
var canvasWidth = 400;
var canvasHeight = 300;
var screenResx = 20;
var map = { xSize: 4, ySize: 4, blocks: [] }
var plrX = 0.5,
    plrY = 0.5,
    plrSpd = 0,
    plrSpdX = 0,
    plrSpdY = 0,
    plrDir = 0;
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

function initArray( xLen, yLen ) {
   var array = new Array( xLen || 0 );
   var i = xLen;

   while(i--) array[xLen - 1 - i] = new Array( yLen );

   return array;
}

function Blocks( up, right, down, left ) {
    this.onEnter = 0;
    this.ambient = 255;
    this.sides = [];
    this.sides[0] = up;
    this.sides[1] = right;
    this.sides[2] = down;
    this.sides[3] = left;
}

function initMap() {
   map.xSize = 4;
   map.ySize = 4;
   map.blocks = initArray( map.xSize, map.ySize );
   debug( map.blocks, "canvasDiv" );

   map.blocks[ 0 ][ 0 ] = new Blocks( 0, 0, 1, 1 );
   map.blocks[ 1 ][ 0 ] = new Blocks( 0, 0, 1, 0 );
   map.blocks[ 2 ][ 0 ] = new Blocks( 1, 0, 1, 0 );
   map.blocks[ 3 ][ 0 ] = new Blocks( 0, 1, 1, 0 );

   map.blocks[ 0 ][ 1 ] = new Blocks( 0, 1, 0, 1 );
   map.blocks[ 1 ][ 1 ] = new Blocks( 1, 0, 0, 1 );
   map.blocks[ 2 ][ 1 ] = new Blocks( 0, 1, 1, 0 );
   map.blocks[ 3 ][ 1 ] = new Blocks( 0, 1, 0, 1 );

   map.blocks[ 0 ][ 2 ] = new Blocks( 0, 0, 0, 1 );
   map.blocks[ 1 ][ 2 ] = new Blocks( 1, 0, 1, 0 );
   map.blocks[ 2 ][ 2 ] = new Blocks( 1, 1, 0, 0 );
   map.blocks[ 3 ][ 2 ] = new Blocks( 0, 1, 0, 1 );

   map.blocks[ 0 ][ 3 ] = new Blocks( 1, 1, 0, 1 );
   map.blocks[ 1 ][ 3 ] = new Blocks( 1, 0, 1, 1 );
   map.blocks[ 2 ][ 3 ] = new Blocks( 1, 0, 1, 0 );
   map.blocks[ 3 ][ 3 ] = new Blocks( 1, 1, 0, 0 );
}

function setCanvas() {
   canvas.width = canvasWidth;
   canvas.height = canvasHeight;
}

function init() {
   initMap();

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

   var blankCol = new Float32Array( [0.8, 0.3, 0.2, 1.0] );
   var wallCol = new Float32Array( [0.2, 0.2, 0.2, 1.0] );
   for ( var ii = 0; ii < map.ySize; ++ii) {
      for ( var jj = 0; jj < map.xSize; ++jj) {
         if ( map.blocks[ii][jj].sides[0] == 0 ) {
            pix( ii * 5 + 1 - 20, jj * 5 + 4 - 15, blankCol );
            pix( ii * 5 + 2 - 20, jj * 5 + 4 - 15, blankCol );
            pix( ii * 5 + 3 - 20, jj * 5 + 4 - 15, blankCol );
         } else {
            pix( ii * 5 + 1 - 20, jj * 5 + 4 - 15, wallCol );
            pix( ii * 5 + 2 - 20, jj * 5 + 4 - 15, wallCol );
            pix( ii * 5 + 3 - 20, jj * 5 + 4 - 15, wallCol );
         }

         if ( map.blocks[ii][jj].sides[1] == 0 ) {
            pix( ii * 5 + 4 - 20, jj * 5 + 3 - 15, blankCol );
            pix( ii * 5 + 4 - 20, jj * 5 + 2 - 15, blankCol );
            pix( ii * 5 + 4 - 20, jj * 5 + 1 - 15, blankCol );
         } else {
            pix( ii * 5 + 4 - 20, jj * 5 + 3 - 15, wallCol );
            pix( ii * 5 + 4 - 20, jj * 5 + 2 - 15, wallCol );
            pix( ii * 5 + 4 - 20, jj * 5 + 1 - 15, wallCol );
         }

         if ( map.blocks[ii][jj].sides[2] == 0 ) {
            pix( ii * 5 + 1 - 20, jj * 5 + 0 - 15, blankCol );
            pix( ii * 5 + 2 - 20, jj * 5 + 0 - 15, blankCol );
            pix( ii * 5 + 3 - 20, jj * 5 + 0 - 15, blankCol );
         } else {
            pix( ii * 5 + 1 - 20, jj * 5 + 0 - 15, wallCol );
            pix( ii * 5 + 2 - 20, jj * 5 + 0 - 15, wallCol );
            pix( ii * 5 + 3 - 20, jj * 5 + 0 - 15, wallCol );
         }

         if ( map.blocks[ii][jj].sides[3] == 0 ) {
            pix( ii * 5 + 0 - 20, jj * 5 + 3 - 15, blankCol );
            pix( ii * 5 + 0 - 20, jj * 5 + 2 - 15, blankCol );
            pix( ii * 5 + 0 - 20, jj * 5 + 1 - 15, blankCol );
         } else {
            pix( ii * 5 + 0 - 20, jj * 5 + 3 - 15, wallCol );
            pix( ii * 5 + 0 - 20, jj * 5 + 2 - 15, wallCol );
            pix( ii * 5 + 0 - 20, jj * 5 + 1 - 15, wallCol );
         }
      }
   }
}

function tick() {
   requestAnimFrame(tick);
   clearScreen( bgCol );
   animate();
}


// ******************** MAIN ******************** //

function main() {
   debug( "Starting ...", "canvasDiv" );

   init();
   
   rectCol = new Float32Array( [1.0, 0.4, 0.3, 1.0] );
   bgCol = new Float32Array( [1.0, 0.4, 0.3, 1.0] );
   clearScreen( bgCol );

   gl.clearColor(1.0, 0.2, 0.1, 1.0);
//   gl.enable(gl.DEPTH_TEST);

   debugAdd( "--- Running ... ---", "counter", "canvasDiv" );

   debug( map.blocks[ 0 ][ 3 ].sides + " :: " +
          map.blocks[ 1 ][ 3 ].sides + " :: " +
          map.blocks[ 2 ][ 3 ].sides + " :: " +
          map.blocks[ 3 ][ 3 ].sides, "canvasDiv" );
   debug( map.blocks[ 0 ][ 2 ].sides + " :: " +
          map.blocks[ 1 ][ 2 ].sides + " :: " +
          map.blocks[ 2 ][ 2 ].sides + " :: " +
          map.blocks[ 3 ][ 2 ].sides, "canvasDiv" );
   debug( map.blocks[ 0 ][ 1 ].sides + " :: " +
          map.blocks[ 1 ][ 1 ].sides + " :: " +
          map.blocks[ 2 ][ 1 ].sides + " :: " +
          map.blocks[ 3 ][ 1 ].sides, "canvasDiv" );
   debug( map.blocks[ 0 ][ 0 ].sides + " :: " +
          map.blocks[ 1 ][ 0 ].sides + " :: " +
          map.blocks[ 2 ][ 0 ].sides + " :: " +
          map.blocks[ 3 ][ 0 ].sides, "canvasDiv" );

   tick();
}

// ********************************************** //
