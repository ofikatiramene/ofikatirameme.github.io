const ctx = new Mondrian.Context(document.getElementById("cv"), 500, 100, {pixelSize: 4});

const grad = new Mondrian.Gradient(Mondrian.colorSchemes.icecream);

function dither(x, y){
    let [mix, color1, color2] = grad.dither(x / ctx.width);
    if (mix <= 0.2) {
        return color1
    } 

    if (mix >= 0.8) {
        return color2
    }

    if (mix <= 0.4) {
        return ((x * y + x) % 2 == 0)? color1 : color2
    } 

    if (mix >= 0.6) {
        return ((x * y + x) % 2 == 0)? color2 : color1
    } 

    return ((ctx.width * y + x) % 2 == 0)? color1 : color2
}

for (let y = 0; y < ctx.height; y++){
    for (let x = 0; x < ctx.width; x++){
        ctx.drawRect(x, y, 1, 1, {color: dither(x, y).hex()}) // 
    }
}


// const ctx = Mondrian.Context.create(20, 20, {color: "red"});

// const icon = document.getElementById("icon")

// const rng = randomRNG();

// const thing = {
//     x: 0,
//     y: 0,
// }

// addEventListener("keydown", e => {
//     if (e.key == "w"){
//         thing.y -= 1
//     }else if (e.key == "a"){
//         thing.x -= 1
//     }else if (e.key == "s"){
//         thing.y += 1
//     }else if (e.key == "d"){
//         thing.x += 1
//     }
// })

// Mondrian.animate(() => {
//     ctx.clear();

//     ctx.drawRect(thing.x, thing.y, 2, 2, {color: "black"})

//     icon.href = ctx.dataURL()
// })

// await, 
// htmlimage property
// palletise(...Color[]): Image




