/*
  JavaScript functions that are executed by running the corresponding methods of a Canvas object
  Donot use these functions by making a js file. Instead use the python Canvas class.
  See canvas.py for help on how to use the Canvas class to draw on the HTML Canvas
*/


//Manages the output of code executed in IPython kernel
function output_callback(out, block){
    console.log(out);
    //Handle error in python
    if(out.msg_type == "error"){
	console.log("Error in python script!");
	console.log(out.content);
	return ;
    }
    var data = out && out.content ? out.content.data : null;
    if (!data) {
        return;
    }

    // Prefer explicit JS payloads when present.
    var js = data['application/javascript'] || data['text/javascript'];
    if (js) {
        try {
            eval(js);
        } catch (err) {
            console.error("Failed to execute JS payload:", err, js);
        }
        return;
    }

    // Fallback: extract script tags from HTML display payloads.
    var html = data['text/html'];
    if (!html || typeof html !== "string") {
        return;
    }
    var re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    var match;
    while ((match = re.exec(html)) !== null) {
        var scriptBody = match[1];
        if (!scriptBody) {
            continue;
        }
        try {
            eval(scriptBody);
        } catch (err) {
            console.error("Failed to execute script from HTML payload:", err, scriptBody);
        }
    }
}

//Handles mouse click by dispatching to the Python canvas object by canvas id (cid)
function click_callback(element, event, cid){
    var rect = element.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var kernel = null;
    if (typeof IPython !== "undefined" && IPython.notebook && IPython.notebook.kernel) {
        kernel = IPython.notebook.kernel;
    } else if (typeof Jupyter !== "undefined" && Jupyter.notebook && Jupyter.notebook.kernel) {
        kernel = Jupyter.notebook.kernel;
    }
    if (!kernel) {
        console.error("Unable to find a notebook kernel bridge for canvas click callbacks.");
        return;
    }
    var exec_str = "__import__('builtins')._aima_dispatch_canvas_click(" +
        JSON.stringify(String(cid)) + ", " + String(x) + ", " + String(y) + ")";
    console.log(exec_str);
    kernel.execute(exec_str,{'iopub': {'output': output_callback}}, {silent: false});
}

function rgbToHex(r,g,b){
    var hexValue=(r<<16) + (g<<8) + (b<<0);
    var hexString=hexValue.toString(16);
    hexString ='#' + Array(7-hexString.length).join('0') + hexString;  //Add 0 padding
    return hexString;
}

function toRad(x){
    return x*Math.PI/180;
}

//Canvas class to store variables
function Canvas(id){
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");
    this.WIDTH = this.canvas.width;
    this.HEIGHT = this.canvas.height;
    this.MOUSE = {x:0,y:0};
}

//Sets the fill color with which shapes are filled
Canvas.prototype.fill = function(r, g, b){
    this.ctx.fillStyle = rgbToHex(r,g,b);
}

//Set the stroke color
Canvas.prototype.stroke = function(r, g, b){
    this.ctx.strokeStyle = rgbToHex(r,g,b);
}

//Set width of the lines/strokes
Canvas.prototype.strokeWidth = function(w){
    this.ctx.lineWidth = w;
}

//Draw a rectangle with top left at (x,y) with 'w' width and 'h' height
Canvas.prototype.rect = function(x, y, w, h){
    this.ctx.fillRect(x,y,w,h);
}

//Draw a line with (x1, y1) and (x2, y2) as end points
Canvas.prototype.line = function(x1, y1, x2, y2){
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
}

//Draw an arc with (x, y) as centre, 'r' as radius from angles start to stop
Canvas.prototype.arc = function(x, y, r, start, stop){
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, toRad(start), toRad(stop));
    this.ctx.stroke();
}

//Clear the HTML canvas
Canvas.prototype.clear = function(){
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
}

//Change font, size and style
Canvas.prototype.font = function(font_str){
    this.ctx.font = font_str;
}

//Draws "filled" text on the canvas
Canvas.prototype.fill_text = function(text, x, y){
    this.ctx.fillText(text, x, y);
}

//Write text on the canvas
Canvas.prototype.stroke_text = function(text, x, y){
    this.ctx.strokeText(text, x, y);
}


//Test if the canvas functions are working
Canvas.prototype.test_run = function(){
    var dbg = false;
    if(dbg)
	alert("1");
    this.clear();
    if(dbg)
	alert("2");
    this.fill(0, 200, 0);
    if(dbg)
	alert("3");
    this.rect(this.MOUSE.x, this.MOUSE.y, 100, 200);
    if(dbg)
	alert("4");
    this.stroke(0, 0, 50);
    if(dbg)
	alert("5");
    this.line(0, 0, 100, 100);
    if(dbg)
	alert("6");
    this.stroke(200, 200, 200);
    if(dbg)
	alert("7");
    this.arc(200, 100, 50, 0, 360);
    if(dbg)
	alert("8");
}
