"use strict";

var canvas;
var gl;

var points = [];
var bufferId;

var NumTimesToSubdivide = 0;
var angle = 0;
var angleLoc;
var outline = false;

function init()
{
    canvas = document.getElementById( "gl-canvas" );
	$("#angleValue").val(0);
	$("#depthValue").val(0);
	
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
	
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(6, 6), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	angleLoc = gl.getUniformLocation(program, "angle");
	
	$("#angleSlider").on("change", function(target) {
        angle = radians(parseInt(event.target.value));
		$("#angleValue").val(event.target.value);
		render();
	});
	
	$("#depthSlider").on("change", function(target) {
        NumTimesToSubdivide = parseInt(event.target.value);
		$("#depthValue").val(NumTimesToSubdivide);
		render();
	});
	
	$("#outline").on("click", function() {
		var wh = document.getElementById("outline").value;
		
		if (wh == "f") {
			outline = true;
			document.getElementById("outline").value = "o";
			document.getElementById("outline").innerHTML = "View As Solid";
		} else {
			outline = false;
			document.getElementById("outline").value = "f";
			document.getElementById("outline").innerHTML = "View As Wireframe";
		}
		
		render();
	});
	
	
    render();
};

function triangle( a, b, c )
{
    points.push(a, b, c);
}

function line( a, b, c )
{
    points.push(a, b, a, c, b, c);
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
		
		if (outline) {
			line(a, b, c);
		} else {
			triangle(a, b, c);
		}
    }
    else {

        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );
		
		
        --count;
		divideTriangle(ab, ac, bc, count);
        // three new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

window.onload = init;

function render()
{
	var vertices = [
        vec2(Math.sin(2.0 * Math.PI / 3.0 * 0), Math.cos(2.0 * Math.PI / 3.0 * 0)),
        vec2(Math.sin(2.0 * Math.PI / 3.0 * 1), Math.cos(2.0 * Math.PI / 3.0 * 1)),
        vec2(Math.sin(2.0 * Math.PI / 3.0 * 2), Math.cos(2.0 * Math.PI / 3.0 * 2))
    ];
	
	points = [];

    divideTriangle( vertices[0], vertices[1], vertices[2],
    	NumTimesToSubdivide);

	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	gl.uniform1f(angleLoc, angle);
	
	if (outline) {
		gl.drawArrays( gl.LINES, 0, points.length );
	} else {
		gl.drawArrays( gl.TRIANGLES, 0, points.length );
	}
	
	points = [];
}
