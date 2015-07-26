"use strict";

var canvas;
var gl;

var index = -1;
var first = true;
var isMousePressed = false;
var thickness = 1;
var lineIndex = 0;
var points = [];
var verticies = [];
var vertexCount = [];
var curColor;
var cBuffer, vBuffer;
var colors = [];
var background;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
	curColor = getColorVector($("#color").val());
	background = getColorVector($("#backcolor").val());
	
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( background[0], background[1], background[2], 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*Math.pow(8, 6), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*Math.pow(8, 6), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
	
	vertexCount[0] = 0;
	
	$( "#gl-canvas" ).mousedown(function( event ) {
		if (!isMousePressed) {
			// Just a point
			var pos = getPosition(event);
			//points.push(pos);
			index++;
			lineIndex = 0;
			vertexCount[index] = 0;
			updateVertices(pos);
			isMousePressed = true;
		}
	});
	
	$( "#gl-canvas" ).mouseup(function( event ) {
		if (!isMousePressed) return;
		var pos = getPosition(event);
		isMousePressed = false;
		updateVertices(pos);
	});
	
	$( "#gl-canvas" ).mousemove(function( event ) {
		if (!isMousePressed) return;
		var pos = getPosition(event);
		updateVertices(pos);
		//console.log(index + " " + lineIndex + " " + points.length);
	});
	
	$("#color").on("change", function(event) {
		curColor = getColorVector(event.target.value);
	});
	
	$("#backcolor").on("change", function(event) {
		background = getColorVector(event.target.value);
		gl.clearColor( background[0], background[1], background[2], 1.0 );
	});
	
	$("#clear").on("click", function(event) {
		index = -1;
		index = 0;
		isMousePressed = false;
		verticies = [];
		points = [];
		vertexCount = [];
		colors = [];
	});
	
	render();
	
	
}

function getColorVector(c) {
	if (c.length != 7) return vec4(0.0, 0.0, 0.0, 1.0);
	return vec4(parseInt(c.slice(1,3), 16) / 255.0,
				parseInt(c.slice(3,5), 16) / 255.0,
				parseInt(c.slice(5,7), 16) / 255.0,
				1.0);
}

function getPosition(event){
	var os = $( "#gl-canvas" ).offset();
	return vec2(2*(event.pageX - os.left) / canvas.width - 1,
        2 * (canvas.height - (event.pageY - os.top)) / canvas.height - 1);
}

function updateVertices(pos) {
	//if (equal(pos, points[lineIndex])) return;
	lineIndex++;
	points.push(pos);
/* 	var verLength = verticies.length;
	
	if (lineIndex > 1) {
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		var p0 = points[lineIndex - 2];
		var p1 = points[lineIndex - 1];
		var tangent = normalize(add(normalize(subtract(pos, p1)), normalize(subtract(p1, p0))));
		var miter = vec2(-tangent[1], tangent[0]);
		
		var line = subtract(p1, p0);
		var normal = normalize(vec2(-line[1], line[0]));
		var lgth = thickness / dot(miter, normal);
		
		var verLength = verticies.length;
		verticies[verLength - 2] = subtract(p1, scale(lgth, miter));
		verticies[verLength - 1] = add(p1, scale(lgth, miter));
		
		//gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (verLength - 2), flatten(verticies[verLength - 2]));
		//gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (verLength - 1), flatten(verticies[verLength - 1]));
	}
	
	var line = subtract(pos, points[lineIndex - 1]);
	var normal = normalize(vec2(-line[1], line[0]));

	verticies.push(subtract(points[lineIndex - 1], scale(thickness, normal)));
	verticies.push(add(points[lineIndex - 1] , scale(thickness, normal)));
	verticies.push(subtract(pos , scale(thickness, normal)));
	verticies.push(add(pos, scale(thickness, normal)));
	colors.push(curColor, curColor, curColor, curColor); */
	colors.push(curColor);
	
	//vertexCount[index] += 4;
	vertexCount[index] += 1;
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(verticies), gl.STATIC_DRAW);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	//gl.bufferSubData(gl.ARRAY_BUFFER, 8 * verLength, flatten(verticies[verLength]));
	//gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (verLength + 1), flatten(verticies[verLength + 1]));
	//gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (verLength + 2), flatten(verticies[verLength + 2]));
	//gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (verLength + 3), flatten(verticies[verLength + 3]));
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)
	//gl.bufferSubData(gl.ARRAY_BUFFER, 16 * verLength, flatten(verticies[verLength]));
	//gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (verLength + 1), flatten(curColor));
	//gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (verLength + 2), flatten(curColor));
	//gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (verLength + 3), flatten(curColor));
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
	
	var ind = 0;
	
	for (var i = 0; i <= index; i++) {
		gl.drawArrays(gl.LINE_STRIP, ind, vertexCount[i]);
		ind += vertexCount[i];
	}

    window.requestAnimFrame(render);

}