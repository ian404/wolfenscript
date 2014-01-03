function debug( text, place ) {
   var para=document.createElement( "p" );
   var node=document.createTextNode( text );
   para.appendChild( node );
   var element=document.getElementById( place );
   element.appendChild( para );
}

function debugAdd( text, nodeName, place ) {
   var para=document.createElement( "p" );
   var node=document.createTextNode( text );
   para.appendChild( node );
   para.id=nodeName;
   var element=document.getElementById( place );
   element.appendChild( para );
}

function debugChange( text, nodeName ) {
   var para=document.getElementById( nodeName );
   para.innerHTML=text;
}

function debugRead( nodeName ) {
   var para=document.getElementById( nodeName );
   var paraText = para.innerHTML;
   return paraText;
}

function getWebGLContext( canvas, opt_attribs ) {
   var title = document.getElementsByTagName( "title" )[0].innerText;
   var h1 = document.createElement( "h1" );
   h1.innerText = title;
   document.body.insertBefore( h1, document.body.children[0] );

   var names = ["webgl", "experimental-webgl"];
   var gl = null;
   if ( !window.WebGLRenderingContext ) { return null; }
   for ( var ii = 0; ii < names.length; ++ii ) {
      try {
         gl = canvas.getContext( names[ii], opt_attribs );
      } catch( e ) {}
      if ( gl ) { break; }
   }
   return gl;
}

function loadShader( gl, scriptID ) {
   var shaderSrc = "";
   var shaderType;

   var shaderScript = document.getElementById( scriptID );
   if ( !shaderScript ) {
      throw( "Error loading script: " + scriptID );
   }
   shaderSrc = shaderScript.text;

   if ( shaderScript.type == "x-shader/x-vertex" ) {
      shaderType = gl.VERTEX_SHADER;
   } else if ( shaderScript.type == "x-shader/x-fragment" ){
      shaderType = gl.FRAGMENT_SHADER;
   } else {
      throw( "Unknown shader type: " + scriptID );
   }

   var shader = gl.createShader( shaderType );
   gl.shaderSource( shader, shaderSrc );
   gl.compileShader( shader );
   var compiled = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
   if ( !compiled ) {
      errorLog = gl.getShaderInfoLog( shader );
      errFn( "Could not compile shader: " + shader + " - " + errorLog );
      gl.deleteShader( shader );
      return null;
   }

   return shader;
}

function setupShader( gl, scriptText, type ) {
   var shaderSrc = scriptText;
   var shaderType;

   debug( type + " | " + shaderSrc, "canvasDiv" );

   if ( type == "x-shader/x-vertex" ) {
      shaderType = gl.VERTEX_SHADER;
   } else if ( type == "x-shader/x-fragment" ){
      shaderType = gl.FRAGMENT_SHADER;
   } else {
      throw( "Unknown shader type: " + scriptID );
   }

   var shader = gl.createShader( shaderType );
   gl.shaderSource( shader, shaderSrc );
   gl.compileShader( shader );
   var compiled = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
   if ( !compiled ) {
      errorLog = gl.getShaderInfoLog( shader );
      errFn( "Could not compile shader: " + shader + " - " + errorLog );
      gl.deleteShader( shader );
      return null;
   }

   return shader;
}

function createProgram( gl, shaders, opt_attribs, opt_locations ) {
   var program = gl.createProgram();
   for ( var ii = 0; ii < shaders.length; ++ii ) {
      gl.attachShader( program, shaders[ii] );
   }
   if ( opt_attribs ) {
      for ( var jj = 0; jj < opt_attribs.length; ++jj ) {
         gl.BindAttribLocation (
            program,
            opt_locations ? opt_locations[jj] : jj,
            opt_attribs[jj] );
      }
   }

   gl.linkProgram( program );
   var linked = gl.getProgramParameter( program, gl.LINK_STATUS );
   if ( !linked ) {
      errorLog = gl.getProgramInfoLog( program );
      errFN( "Could not link program: " + errorLog );
      gl.deleteProgram( program );
      return null;
   }

   return program;
}

window.requestAnimFrame = (function() {
   return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) { return window.setTimeout(callback, 1000/60); };
})();

window.cancelRequestAnimFrame = (function() {
  return window.cancelCancelRequestAnimationFrame ||
         window.webkitCancelRequestAnimationFrame ||
         window.mozCancelRequestAnimationFrame ||
         window.oCancelRequestAnimationFrame ||
         window.msCancelRequestAnimationFrame ||
         window.clearTimeout;
})();
