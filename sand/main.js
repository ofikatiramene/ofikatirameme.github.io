const canvas = document.getElementById("cv");
const cw = window.innerWidth, ch = window.innerHeight - 3 * (window.innerHeight % 4);
const size = 4;
const [w, h] = [cw, ch].map(v => v / size)
const ctx = new Mondrian.Context(canvas, cw, ch, {color: "lightblue", pixelSize: size});
const mouse = new Mondrian.Mouse(ctx);
const sandColor = Mondrian.colorSchemes.autumnal2;
const rng = randomRNG();

class Dot {
	static dots = [];
	static matrix = invokeMatrix(w, h);

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
		if (Dot.matrix[x][y]) Dot.matrix[x][y].die()
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
			this.x + dx >= w ||
			this.y + dy >= h
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

	update(){}
}

class Erase{
	static create(x, y){
		Dot.destroy(x, y)
	}
}

class Fluid extends Dot{
	constructor(x, y, color){
		super(x, y, color);
		return this
	}
}

class Sand extends Fluid{

	static gradient = new Mondrian.Gradient(Mondrian.interpolateList(sandColor, 10));
	static point = 0;
	static inc = 0.001;

	constructor(x, y){
		super(x, y, Sand.gradient.randomDither(Sand.point).hex());
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

			if (!this.check(-1, 1)){
				moves.push([-1, 1])
			}

			if (!this.check(1, 1)){
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

const menu = document.getElementById("menu");

const hideMenu = () => menu.style.display = "none";

const showMenu = () => menu.style.display = "block";

canvas.addEventListener("mousedown", hideMenu);

canvas.addEventListener("contextmenu", e => {
	menu.style.top = e.offsetY + "px";
	menu.style.left = e.offsetX + "px";
	showMenu()
})

const menuItems = [Sand, Water, Block, Erase]

let Selected = Sand;

menuItems.forEach(Element => {
	let div = document.createElement("div");
	div.innerHTML = Element.name;

	div.onclick = () => {
		for (let item of menu.children){
			item.className = ""
		}
		Selected = Element;
		div.className = "selected";
		hideMenu()
	}
	
	menu.append(div);
});

const logo = Mondrian.Image.fromFile("../gubbins/logo.png");
logo.load.then(() => {
	logo.map((x, y, color) => {
		if (color.css() == "rgba(0, 0, 0, 255)"){
			Block.create(x + 1, y + ctx.height - logo.height - 2)
		}
	})
}).catch(console.warn)

function pen(size, func){
	invokeMatrix(size, size, (x, y) => {
		func(x - Math.floor(size / 2), y - Math.floor(size / 2))
	})
}

const path = new Mondrian.Path((x, y) => {
	pen(3, (px, py) => {
		Selected.create(x + px, y + py);
	})
}) 

Mondrian.animate(() => {

	ctx.clear();

	path.draw(mouse.down, !mouse.down, mouse.x, mouse.y)

	for (let i = 0; i < Dot.dots.length; i++){
		Dot.dots[i].update();

		let dot = Dot.dots[i];
		if (dot){
			ctx.drawRect(dot.x, dot.y, 1, 1, {fillStyle: dot.color})
		}

	}
});
