/**
 * Object for calculating frames per second
 * @constructor 
 */
function FPS(){
	/**
	 * @property {number} - Number of frames drawn in the last second
	 */
	this.fps = 0
	this.frameS = 0;
	let d = new Date();
	this.lastTime = d.getTime();

	/**
	 * Call at the beginning of the animation frame loop
	 * @return {number} Number of times this method was  called in the last second
	 */
	this.start = function(){
		this.frame++;
		let d = new Date();
		let time = d.getTime();
		if (time - this.lastTime >= 1000){
			this.fps = this.frame;
			this.frame = 0;
			this.lastTime = time
		};
		return this.fps
	};

	return this
};

/**
 * Iterable psuedo-random number generator
 * @constructor
 * @param {number} s1 - Seed, 0 <= s1 < 30000
 * @param {number} s2 - Seed, 0 <= s2 < 30000
 * @param {number} s3 - Seed, 0 <= s2 < 30000
 */
function RNG(s1, s2, s3){
	this.s1 = s1;
	this.s2 = s2;
	this.s3 = s3;

	/**
	 * Ppsuedo-random float
	 * @returns {number} Psuedo-random float between 0 and 1 exclusive
	 */
	this.next = function(){
		this.s1 = (171 * this.s1) % 30269;
		this.s2 = (172 * this.s2) % 30307;
		this.s3 = (170 * this.s3) % 30323;
	
		return (this.s1 / 30269 + this.s2 / 30307 + this.s3 / 30323) % 1
	};

	/**
	 * Psuedo-random integer
	 * @param 	{number} a - Lower limit (inclusive)
	 * @param 	{number} b - Upper Limit (exclusive)
	 * @returns {number} Psuedo-random integer between a and b
	 */
	this.nextInt = function(a, b){
		return Math.floor(this.next() * (a - b) + b)
	};

	/**
	 * Psuedo-random boolean
	 * @param 	{number}  [chance = 0.5] - Probability between 0 and 1 that result will be true. Default = 0.5
	 * @returns {boolean} Psuedo-random boolean
	 */
	this.nextBool = function(chance = 0.5){
		return (this.next() <= chance)
	};

	/**
	 * Psuedo-random Hexadecimal colour code
	 * @returns {String} Hex code
	 */
	this.nextHex = function(){
		return rgb(
			this.nextInt(0, 256),
			this.nextInt(0, 256),
			this.nextInt(0, 256)
		)
	};

	/**
	 * Psuedo-random item from list
	 * @param 	{any[]}  	list - List to get item from
	 * @returns {any} 		Psuedo-random item from list
	 */
	this.nextFrom = function(list){
		return list[this.nextInt(0, list.length)]
	}

	return this
};

/**
 * Creates an RNG object with a random seed
 * @returns {RNG} - RNG object
 */
function randomRNG(){
	return new RNG(
		randInt(1, 30000),
		randInt(1, 30000),
		randInt(1, 30000)
	)
}

/**
 * Object representing a point in 2D space with transformation and calculation methods
 * @constructor
 * @param {number} x - X Coord of point
 * @param {number} y - Y Coord of point
 */
function Coords(x, y){
	/**
	 * @property {number} - X coord of point
	 */
	this.x = x;

	/**
	 * @property {number} - Y coord of point
	 */
	this.y = y;

	/**
	 * Rounds the x and y properties to the nearest integers
	 * @returns {Coords} This
	 */
	this.round = function(){
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this
	}

	/**
	 * Finds the difference in x and y between 2 points
	 * @param 	{Coords} other - Other Coords object
	 * @returns {Coords} New Coords object representing the diffence between this and other
	 */
	this.delta = function(other){
		return new Coords(this.x - other.x, this.y - other.y)
	};

	/**
	 * Translates the point to a new point
	 * @param 	{number} x - Amount to translate through x axis
	 * @param 	{number} y - Amount to translate through y axis
	 * @returns {Coords} New Coords object representing translated point
	 */
	this.translate = function(x, y){
		return new Coords(this.x + x, this.y + y)
	};

	/**
	 * Finds the Euclidean distance between 2 points
	 * @param 	{Coords} other - Other Coords object to find distance to
	 * @returns {number} Distance between this point and other
	 */
	this.distance = function(other){
		let delta = this.delta(other);
		return Math.sqrt(delta.x ** 2 + delta.y ** 2)
	};

	/**
	 * Finds the Taxi-cab distance between 2 points
	 * @param 	{Coords} other - Other Coords object to find distance to
	 * @returns {number} Taxi-cab distance between this point and other
	 */
	this.taxicab = function(other){
		let delta = this.delta(other);
		return Math.abs(delta.x) + Math.abs(delta.y)
	};

	/**
	 * Finds location of a new point
	 * @param 	{number} distance - Distance to other point from this point
	 * @param 	{number} bearing  - Bearing to other point from this point in degrees
	 * @returns {Coords} New Coords object representing the point projected
	 */
	this.project = function(distance, bearing){
		let x = Math.sin(bearing / (180 / Math.PI)) * distance;
		let y = Math.cos(bearing / (180 / Math.PI)) * distance;
		return new Coords(this.x + x, this.y + y)
	};

	/**
	 * Finds the angle between 3 points, this being the center
	 * @param 	{Coords} otherA - Other Coords object
	 * @param 	{Coords} otherB - Other Coords object
	 * @returns {number} Angle made by otherA, this, otherB in degrees
	 */
	this.angle = function(otherA, otherB){
		let a = this.distance(otherA);
		let b = this.distance(otherB);
		let c = otherA.distance(otherB);
		return Math.acos((a**2 + b**2 - c**2) / (2 * a * b)) * (180 / Math.PI)
	};

	this.angleFrom = function(other, bearing){
		return this.angle(other, this.project(10, bearing))
	};

	/**
	 * Finds bearing between 2 points
	 * @param 	{Coords}  other   - Other Coords object to find bearing to
	 * @param 	{boolean} invertY - 
	 * @returns {number}  Bearing between this point and other in degrees
	 */
	this.bearing = function(other, invertY = false){
		let angle = this.angle(new Coords(this.x, this.y + ((invertY)? -10 : 10)), other)
		return (this.x < other.x)? angle : 360 - angle
	};

	/**
	 * Rotates the point around a pivot
	 * @param 	{Coords} pivot - Coords object representing the point to pivot around
	 * @param 	{number} angle - Angle to rotate in degrees. Positive for clockwise, negative for anti-clockwise
	 * @returns {Coords} New Coords object representing the point rotated to
	 */
	this.rotate = function(pivot, angle){
		return pivot.project(pivot.distance(this), pivot.bearing(this) + angle)
	};

	this.translateSelf = function(x, y){
		this.x += x;
		this.y += y
	};

	/**
	 * Projects this Coords onto a new point
	 * @param {number} distance - Distance to project
	 * @param {number} bearing  - Bearing to project to
	 */
	this.projectSelf = function(distance, bearing){
		let projection = this.project(distance, bearing);
		this.x = projection.x;
		this.y = projection.y
	};

	/**
	 * Rotates this Coords around a pivot
	 * @param {Coords} pivot - Coords object representing the point to pivot around
	 * @param {number} angle - Angle to rotate in degrees. Positive for clockwise, negative for anti-clockwise
	 */
	this.rotateSelf = function(pivot, angle){
		let rotation = this.rotate(pivot, angle);
		this.x = rotation.x;
		this.y = rotation.y
	};

	return this
};

/**
 * 
 * @param {Coords[]} controlPoints - List of Coords objects representing control points	
 */
function BezierCurve(controlPoints){

	this.controlPoints = controlPoints;

	this.axisLERP = function(list, t){
		let n = list.length;
		return (n > 1)? (1 - t) * this.axisLERP(list.slice(0, n - 1), t) + t * this.axisLERP(list.slice(1, n), t) : list[0]
	};

	this.curvePoint = function(t){
		let xs = this.controlPoints.map(point => point.x);
		let ys = this.controlPoints.map(point => point.y);
		return new Coords(this.axisLERP(xs, t), this.axisLERP(ys, t))
	};

	this.curvePoints = function(resolution){
		let list = [];
		for (let t = 0; t <= 1; t += 1 / resolution){
			list.push(this.curvePoint(t))
		};
		return list
	};

	return this
};

/**
 * Creates hex code from rgb values
 * @param 	{number} r - Red value 
 * @param 	{number} g - Green value
 * @param 	{number} b - Blue value
 * @returns {String} Hex code
 */
 function rgb(r, g, b){
	let [rn, gn, bn] = ((typeof r == "object")? r : [r, g, b]).map(x => {
		let val = Math.floor(x).toString(16).toUpperCase();
		return (val.length == 1)? "0" + val : val
	});
	
	return `#${rn}${gn}${bn}`
};

/**
 * Random integer generator
 * @param 	{number} a - Lower limit for random int
 * @param 	{number} b - Upper limit for random int
 * @returns {number} Random int between a and b inclusive
 */
function randInt(a, b){
	return (b >= a) ? Math.round(Math.random() * (a - b) + b) : randInt(b, a)
};

/**
 * Generates a random hex colour code
 * @returns {String} Hex colour code
 */
function randomHex(){
	return rgb(
		randInt(0, 256), 
		randInt(0, 256), 
		randInt(0, 256)
	)
};

/**
 * Rounds decimal numbers
 * @param 	{number} x 		- Decimal number to round
 * @param 	{number} places - Number of places to round to
 * @returns {number} Rounded number
 */
function round(x, places){
	return Math.round(x * (10 ** places)) / (10 ** places)
};

/**
 * Creates an HTML element with innerHTML, attributes and style
 * @param 	{string} 			tag 		- Tag of the element
 * @param 	{string[]|object[]} inner 		- List of child node for the element, can be other elements or strings
 * @param 	{object} 			attributes 	- Attributes of the element
 * @param 	{object} 			style 		- Style attributes of the element
 * @returns {object} 			HTML Element object
 */
 function create(tag, inner = [], attributes = {}, style = {}){
	let element = document.createElement(tag);
	for (attribute in attributes){
		element.setAttribute(attribute, attributes[attribute]);
	};
	for (property in style){
		element.style.cssText += property + ":" + style[property] + ";";
	};
	for (item of inner){
		if (typeof item == "object"){
			element.appendChild(item);
		}else{
			element.innerHTML += item;
		}
	};
	return element
};

/**
 * Finds and removes a class from an HTML element's list of classes
 * @param 	{object} 	element - HTMLElement DOM object to remove class from
 * @param 	{string} 	name 	- Class name to remove
 * @returns {boolean} 	True if the class was removed, false if not found
 */
function removeClass(element, name){ 
	let classList = element.className.split(" ");
	for (let x = 0; x < classList.length; x++){
		if (classList[x] == name){
			classList.splice(x, 1);
			element.className = classList.join(" ");
			return true
		}
	};
	return false
};

/**
 * Creates a list of set length from a function
 * @param 	{number} 	len 	- Length of list
 * @param 	{function} 	invoke 	- Function to create each element in the list, takes index as a parameter
 * @returns {any[]} 	List created
 */
function invokeList(len, invoke = () => null){
	let list = [];
	for (let i = 0; i < len; i++){
		list.push(invoke(i))
	};
	return list
};

function invokeMatrix(w, h, invoke = () => null){
	let matrix = [];
	for (let x = 0; x < w; x++){
		let list = [];
		for (let y = 0; y < h; y++){
			list.push(invoke(x, y))
		};
		matrix.push(list)
	};
	return matrix
}

function Noise(xStretch = 1, xOffset = 0, yStretch = 1, yOffset = 0){
	this.xStretch = xStretch;
	this.xOffset = xOffset;
	this.yStretch = yStretch;
	this.yOffset = yOffset;

	this.f = function(x){
		return (Math.sin(x * 2 * this.xStretch + this.xOffset) + Math.sin(x * Math.PI * this.xStretch + this.xOffset) / 2) * this.yStretch + this.yOffset
		//return Math.sin(x * this.xStretch + this.xOffset) * this.yStretch + this.yOffset	
	};

	this.n = function(x){
		return (this.f(x) + 2) / 4
	}

	this.d = function(x){
		return this.xStretch * this.yStretch * (Math.PI * Math.cos(this.xStretch * Math.PI * x + this.xOffset) + 2 * Math.cos( 2 * this.xStretch * x + this.xOffset)) * 0.5
		//return this.xStretch * Math.cos(x * this.xStretch + this.xOffset) * this.yStretch
	};

	return this
};

function RandomField(seed = randomRNG().nextInt(1000, 40000)){
	this.seed = seed

	this.xorShift = function(a){
		a ^= (a << 25);
		a ^= (a >>> 35);
		a ^= (a << 4);
		return a
	};

	this.rotateLeft = function(a, distance = 1){
		let result = a;
		for (let i = 0; i < distance; i++){
			result = (result << 1) | (result & 1 != 0? 1 : 0);
		};
		return result
	}

	this.get = function(x, y){
		let mix = this.xorShift(x) + this.rotateLeft(this.xorShift(y), 20) + seed;
		let v = Math.abs(this.xorShift(mix));
		return v / 2147449790
	}
};

function PerlinNoise(size = 20, seed = randomRNG().nextInt(1000, 40000)){
	this.size = size;
	this.seed = seed;
	this.vectors = new RandomField(seed);

	this.get = function(x, y){

	}
}

/**
 * 
 * @param {*} cv 
 * @param {*} width 
 * @param {*} height 
 * @param {*} bg 
 * @returns {CanvasRenderingContext2D}
 */
function prepCanvas(cv, width, height, bg = "black"){
	cv.width = width;
	cv.height = height;
	cv.style.cssText += "image-rendering: -moz-crisp-edges; image-rendering: -webkit-crisp-edges; image-rendering: pixelated; image-rendering: crisp-edges;";
	cv.style.backgroundColor = bg;
	
	let ctx = cv.getContext("2d");

	ctx.drawLine = function(startX, startY, endX, endY){
        this.beginPath();
        this.moveTo(Math.floor(startX), Math.floor(startY));
        this.lineTo(Math.floor(endX), Math.floor(endY));
        this.closePath();
        this.stroke();
    };

	ctx.clear = function(){
		this.fillStyle = bg;
		this.fillRect(0, 0, width, height);
	}

	return ctx;
};

function getImageData(url, w, h){
	let canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	let ctx = canvas.getContext("2d");

	let img = document.createElement("img");
	img.src = url;

	return new Promise((res, rej) => {
		img.onload = e => {
			ctx.drawImage(e.target, 0, 0, w, h);
			let imagedata = ctx.getImageData(0, 0, w, h);
			res(imagedata)
		}
	})
	
};

function pipe(...funcs){
	return funcs.reduce((val, func) => func(val))
}

