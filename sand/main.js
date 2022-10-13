const canvas = document.getElementById("cv");

const mobile = screen.width < 768;

const size = 4;//mobile? 8 : 4;

const cw = window.innerWidth, ch = window.innerHeight - 3 * (window.innerHeight % size); // cw = 120, ch = 120; // 
const [w, h] = [cw, ch].map(v => Math.floor(v / size))

const ctx = new Mondrian.Context(canvas, cw, ch, {color: Mondrian.colorNames.LightBlue, pixelSize: size});
const mouse = ctx.getMouse(true);
const rng = randomRNG();

const matrix = (w, h, func) => Array.from({length: w}, (_, x) => Array.from({length: h}, (_, y) => func(x, y)))


// ------*> MATERIAL CLASSES <*-----------------------------------------------------------------------

/** Base class for all materials */
class Dot {

	/** List of all current dots */
	static dots = [];

	/** Matrix of all current dots */
	static matrix = matrix(w, h, () => null)

	constructor(x, y, color) {
		this.x = x;
		this.y = y;

		this.color = color

		Dot.dots.push(this);
		Dot.matrix[x][y] = this;

		return this;
	}

	static create(x, y, ...args){
		try{
			if (!Dot.matrix[x][y]) return new this.prototype.constructor(x, y, ...args)
		}catch{
			return null
		}
	}

	static destroy(x, y){
		try{
			if (Dot.matrix[x][y]) Dot.matrix[x][y].die()
			return true
		}catch{
			return false
		}
	}

	get(dx, dy){
		try{
			return Dot.matrix[this.x + dx][this.y + dy];
		}catch{
			return null
		}
		
	}

	check(dx, dy, type = ""){
		let dot = this.get(dx, dy)
		return (
			dot || 
			this.x + dx < 0 ||
			this.y + dy < 0 ||
			this.x + dx >= Dot.matrix.length ||
			this.y + dy >= Dot.matrix[0].length
		)
	}

	move(dx, dy) {
		if (!this.check(dx, dy) || !(dx == 0 && dy == 0)){
			Dot.matrix[this.x + dx][this.y + dy] = this;
			Dot.matrix[this.x][this.y] = null;
			this.x += dx;
			this.y += dy;
			return true
		}
		return false

	};

	swap(dx, dy){
		if (this.check(dx, dy)){
			let temp = this.get(dx, dy);
			temp.x = this.x;
			temp.y = this.y;
			Dot.matrix[this.x + dx][this.y + dy] = null;
			Dot.matrix[temp.x][temp.y] = temp;
			return true
		}

		return this.move(dx, dy)
	}

	die(){
		for (let i = 0; i < Dot.dots.length; i++){
			if (Dot.dots[i] == this) Dot.dots.splice(i, 1)
		}
		Dot.matrix[this.x][this.y] = null
	}

	getColor(){
		return this.color;
	}

	update(){}
}

/** Class that destroys dots using "create" method */
class Erase{
	static create(x, y){
		Dot.destroy(x, y)
	}
}

/** Base class for all fluid materials */
class Fluid extends Dot{
	constructor(x, y, color){
		super(x, y, color);
		return this
	}
}

/** Base for sand variants */
class SandBase extends Fluid{

	static point = 0;
	static inc = 0.001;

	constructor(x, y, color){
		super(x, y, new Mondrian.Gradient(Mondrian.interpolateList(color, 10)).randomDither(Sand.point).hex());
		Sand.point += Sand.inc;
		if (Sand.point >= 1 || Sand.point <= 0) Sand.inc = -Sand.inc;
		return this
	};

	update() {
		let below = this.get(0, 1)
		if (!below && !this.check(0, 1)){
			this.move(0, 1)
			return
		};

		// if (below && below.constructor.name == "Water"){
		// 	this.swap(0, 1)
		// 	return
		// }

		let moves = [];

		if (!this.check(-1, 1) && !this.check(-1, 0)){
			moves.push([-1, 1])
		}

		if (!this.check(1, 1) && !this.check(1, 0)){
			moves.push([1, 1])
		}

		if (moves.length == 1){
			this.move(...moves[0])
		}else if (moves.length > 1){
			this.move(...rng.nextFrom(moves))
		}
	
	};
}

class Sand extends SandBase{
	constructor(x, y){
		super(x, y, Mondrian.colorSchemes.autumnal2);
		return this
	}
}

class Peachy extends SandBase{
	constructor(x, y){
		super(x, y, Mondrian.colorSchemes.peachy);
		return this		
	}
}

class IceCream extends SandBase{
	constructor(x, y){
		super(x, y, Mondrian.colorSchemes.icecream);
		return this		
	}
}

class Water extends Fluid{
	constructor(x, y){
		super(x, y, Mondrian.colorNames.DeepSkyBlue);
		return this
	}

	update(){
		if (this.check()) return

		if (!this.check(0, 1)){
			this.move(0, 1)
			return
		}

		let moves = [];

		if (this.check(-1, 1) && this.check(0, 1) && this.check(1, 1)){

			if (!this.check(-1, 0)){
				moves.push([-1, 0])
			}

			if (!this.check(1, 0)){
				moves.push([1, 0])
			}

			if (!this.check(1, 0) && !this.check(-1, 0)){
				moves.push([0, 0])
			}

		}else{

			if (!this.check(-1, 1) && !this.check(-1, 0)){
				moves.push([-1, 1])
			}

			if (!this.check(1, 1) && !this.check(1, 0)){
				moves.push([1, 1])
			}

		}

		if (moves.length == 1){
			this.move(...moves[0])
		}else if (moves.length > 1){
			this.move(...rng.nextFrom(moves))
		}
	}
}

class Block extends Dot{
	constructor(x, y){
		super(x, y, "black");
		return this
	}
}


// ------*> MENU <*----------------------------------------------------------------------

/** Menu element */
const menu = document.getElementById("menu");

const hideMenu = () => menu.style.display = "none";
const showMenu = () => menu.style.display = "block";

/** Menu toggle element (Mobile only) */
const toggle = document.getElementById("menu-toggle");

if (mobile){

	toggle.style.display = "block";

	menu.style.top = (toggle.offsetHeight + 10) + "px";
	menu.style.right = "10px";

	document.body.style = "font-size: 15px;"

	toggle.onclick = () => {
		if (menu.style.display == "none"){
			showMenu();
		}else{
			hideMenu();
		}
	}

}else{

	canvas.addEventListener("contextmenu", e => {
		showMenu();

		menu.style.left = Math.min(e.offsetX, cw - menu.clientWidth) + "px";
		menu.style.top = Math.min(e.offsetY, ch - menu.clientHeight) + "px";
	})

}

canvas.addEventListener("mousedown", hideMenu);

/** List of materials to include in menu */
const menuItems = [Sand, Peachy, IceCream, Water, Block, Erase]

/** Currently selected material */
let Selected;

menuItems.forEach(Material => {
	let div = document.createElement("div");
	div.innerHTML = Material.name;

	div.onclick = () => {
		for (let item of menu.children){
			item.className = ""
		}

		Selected = Material;
		div.className = "selected";
		hideMenu()
	}
	
	menu.append(div);
});

menu.children[0].onclick()


// ------*> LOGO <*----------------------------------------------------------------------

const logo = Mondrian.Image.fromFile("../gubbins/logo.png");
logo.load.then(() => {
	logo.map((x, y, color) => {
		if (color.a != 0){
			Block.create(x + 1, y + Dot.matrix[0].length - logo.height - 2)
		}
	})
}).catch(console.warn)


// ------*> ANIMATION <*----------------------------------------------------------------------

function pen(size, func, px = 0, py = 0){
	matrix(size, size, (x, y) => {
		func(x - Math.floor(size / 2) + px, y - Math.floor(size / 2) + py)
	})
}

const path = new Mondrian.Path((x, y) => {
	pen(3, (px, py) => {
		Selected.create(x + px, y + py);
	})
})

Mondrian.animate(() => {

	ctx.clear();

	path.draw(mouse.down, !mouse.down, mouse.x, mouse.y);

	for (let i = 0; i < Dot.dots.length; i++){
		Dot.dots[i].update();

		let dot = Dot.dots[i];
		if (dot){
			ctx.drawRect(dot.x, dot.y, 1, 1, {fillStyle: dot.getColor()})
		}
	}
});

