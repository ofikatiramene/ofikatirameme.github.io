"use strict";
var Mondrian;
(function (Mondrian) {
    class Context {
        /** Canvas element that this context is tied to */
        canvas;
        /** Width of canvas */
        width;
        /** Height of canvas */
        height;
        /** 2D Canvas rendering context for this canvas */
        ctx;
        /** Size of pixel */
        pixelSize;
        borderBox;
        color;
        /**
         *
         * @param canvas
         * @param width
         * @param height
         * @param params
         */
        constructor(canvas, width, height, params = {}) {
            this.canvas = canvas;
            this.canvas.style.cssText += "image-rendering: -moz-crisp-edges; image-rendering: -webkit-crisp-edges; image-rendering: pixelated; image-rendering: crisp-edges;";
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.backgroundColor = this.color = params.color ?? "black";
            this.pixelSize = params.pixelSize ?? 1;
            this.width = width / (params.useCanvasDims ? 1 : this.pixelSize);
            this.height = height / (params.useCanvasDims ? 1 : this.pixelSize);
            this.borderBox = params.borderBox ?? false;
            return this;
        }
        _setStyles(params) {
            const { fillStyle, color, strokeStyle, lineColor, lineWidth } = params;
            if (fillStyle || color)
                this.ctx.fillStyle = fillStyle ?? color;
            if (strokeStyle || lineColor)
                this.ctx.strokeStyle = strokeStyle ?? lineColor;
            if (lineWidth)
                this.ctx.lineWidth = lineWidth;
        }
        _resetStyles() {
        }
        drawRect(x, y, width, height, params = {}) {
            this._setStyles(params);
            // if (params.fromCenter){
            //     x -= width / 2;
            //     y -= height / 2;
            // }
            this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, width * this.pixelSize, height * this.pixelSize);
            if (params.strokeStyle || params.lineWidth) {
                this.ctx.strokeRect(x, y, width, height);
            }
            this._resetStyles();
        }
        ;
        //     drawLine(startX, startY, endX, endY, color = this.ctx.fillStyle, width = 1) {
        //         this.ctx.strokeStyle = color;
        //         this.ctx.lineWidth = width;
        //         this.ctx.beginPath();
        //         this.ctx.moveTo(Math.floor(startX), Math.floor(startY));
        //         this.ctx.lineTo(Math.floor(endX), Math.floor(endY));
        //         this.ctx.closePath();
        //         this.ctx.stroke();
        //     };
        clear() {
            this.drawRect(0, 0, this.width, this.height, { fillStyle: this.color });
        }
        snip(x, y, width, height) {
            return new Image(this.ctx.getImageData(x, y, width, height));
        }
        dataURL() {
            return this.canvas.toDataURL();
        }
        static create(width, height, params = {}) {
            return new Context(document.createElement("canvas"), width, height, params);
        }
    }
    Mondrian.Context = Context;
    class Mouse {
        /** Context object this object is tied to */
        ctx;
        /** X Coord of the mouse relative to pixel size of the context */
        x;
        /** Y Coord of the mouse relative to pixel size of the context */
        y;
        /** X coord of the mouse on the context's canvas */
        realx;
        /** Y coord of the mouse on the context's canvas */
        realy;
        down;
        rdown;
        constructor(ctx) {
            this.ctx = ctx;
            this.x = 0;
            this.y = 0;
            this.realx = 0;
            this.realy = 0;
            this.down = false;
            this.rdown = false;
            this.ctx.canvas.addEventListener("mousedown", (e) => {
                if (e.button == 0) {
                    this.down = true;
                }
                else if (e.button == 2) {
                    this.rdown = true;
                }
            });
            this.ctx.canvas.addEventListener("mouseup", (e) => {
                if (e.button == 0) {
                    this.down = false;
                }
                else if (e.button == 2) {
                    this.rdown = false;
                }
            });
            this.ctx.canvas.addEventListener("mousemove", (e) => {
                this.realx = e.offsetX;
                this.x = Math.floor(e.offsetX / this.ctx.pixelSize);
                this.realy = e.offsetY;
                this.y = Math.floor(e.offsetY / this.ctx.pixelSize);
            }),
                this.ctx.canvas.addEventListener("mouseleave", (e) => {
                }),
                this.ctx.canvas.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                });
            return this;
        }
    }
    Mondrian.Mouse = Mouse;
    class Image {
        imageData;
        width;
        height;
        load;
        constructor(imageData) {
            this.imageData = imageData;
            this.width = imageData.width;
            this.height = imageData.height;
            return this;
        }
        getPixel(x, y) {
            let point = (y * this.width * 4) + (x * 4);
            return new Mondrian.Color(...this.imageData.data.slice(point, point + 4));
        }
        map(func) {
            let matrix = [];
            for (let y = 0; y < this.imageData.height; y++) {
                let row = [];
                for (let x = 0; x < this.imageData.width; x++) {
                    row.push(func(x, y, this.getPixel(x, y)));
                }
                matrix.push(row);
            }
            return matrix;
        }
        static getImageData(path) {
            let img = document.createElement("img");
            img.src = path;
            return new Promise((res, rej) => {
                img.onload = () => {
                    let cv = document.createElement("canvas");
                    let ctx = cv.getContext("2d");
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    let imagedata = ctx.getImageData(0, 0, img.width, img.height);
                    res(imagedata);
                };
            });
        }
        static fromFile(path) {
            let image = new Image(new ImageData(1, 1));
            image.load = Image.getImageData(path).then(data => {
                image.imageData = data;
                image.width = data.width;
                image.height = data.height;
                return image;
            });
            return image;
        }
    }
    Mondrian.Image = Image;
    function lerp(ax, ay, bx, by, s) {
        return [ax + (bx - ax) * s, ay + (by - ay) * s];
    }
    Mondrian.lerp = lerp;
    class Path {
        previous;
        res;
        drawFunc;
        constructor(drawFunc, res = 10) {
            this.previous = null;
            this.res = res;
            this.drawFunc = drawFunc;
            return this;
        }
        draw(start, end, x, y) {
            if (start && this.previous) {
                let [px, py] = this.previous;
                for (let s = 0; s <= 1; s += 1 / this.res) {
                    let [sx, sy] = lerp(px, py, x, y, s);
                    this.drawFunc(Math.floor(sx), Math.floor(sy));
                }
                this.previous = [x, y];
            }
            else {
                this.previous = [x, y];
            }
            if (end) {
                this.previous = null;
            }
        }
    }
    Mondrian.Path = Path;
    class Pen {
        drawFunc;
        constructor(drawFunc) {
            this.drawFunc = drawFunc;
        }
    }
    Mondrian.Pen = Pen;
    function animate(func) {
        let fps = 0;
        let frame = 0;
        let lastTime = new Date().getTime();
        function loop() {
            frame++;
            let time = new Date().getTime();
            if (time - lastTime >= 1000) {
                fps = frame;
                frame = 0;
                lastTime = time;
            }
            ;
            func(fps);
            window.requestAnimationFrame(loop);
        }
        window.requestAnimationFrame(loop);
    }
    Mondrian.animate = animate;
    Mondrian.colorNames = {
        "AliceBlue": "#F0F8FF",
        "AntiqueWhite": "#FAEBD7",
        "Aqua": "#00FFFF",
        "Aquamarine": "#7FFFD4",
        "Azure": "#F0FFFF",
        "Beige": "#F5F5DC",
        "Bisque": "#FFE4C4",
        "Black": "#000000",
        "BlanchedAlmond": "#FFEBCD",
        "Blue": "#0000FF",
        "BlueViolet": "#8A2BE2",
        "Brown": "#A52A2A",
        "BurlyWood": "#DEB887",
        "CadetBlue": "#5F9EA0",
        "Chartreuse": "#7FFF00",
        "Chocolate": "#D2691E",
        "Coral": "#FF7F50",
        "CornflowerBlue": "#6495ED",
        "Cornsilk": "#FFF8DC",
        "Crimson": "#DC143C",
        "Cyan": "#00FFFF",
        "DarkBlue": "#00008B",
        "DarkCyan": "#008B8B",
        "DarkGoldenRod": "#B8860B",
        "DarkGray": "#A9A9A9",
        "DarkGrey": "#A9A9A9",
        "DarkGreen": "#006400",
        "DarkKhaki": "#BDB76B",
        "DarkMagenta": "#8B008B",
        "DarkOliveGreen": "#556B2F",
        "DarkOrange": "#FF8C00",
        "DarkOrchid": "#9932CC",
        "DarkRed": "#8B0000",
        "DarkSalmon": "#E9967A",
        "DarkSeaGreen": "#8FBC8F",
        "DarkSlateBlue": "#483D8B",
        "DarkSlateGray": "#2F4F4F",
        "DarkSlateGrey": "#2F4F4F",
        "DarkTurquoise": "#00CED1",
        "DarkViolet": "#9400D3",
        "DeepPink": "#FF1493",
        "DeepSkyBlue": "#00BFFF",
        "DimGray": "#696969",
        "DimGrey": "#696969",
        "DodgerBlue": "#1E90FF",
        "FireBrick": "#B22222",
        "FloralWhite": "#FFFAF0",
        "ForestGreen": "#228B22",
        "Fuchsia": "#FF00FF",
        "Gainsboro": "#DCDCDC",
        "GhostWhite": "#F8F8FF",
        "Gold": "#FFD700",
        "GoldenRod": "#DAA520",
        "Gray": "#808080",
        "Grey": "#808080",
        "Green": "#008000",
        "GreenYellow": "#ADFF2F",
        "HoneyDew": "#F0FFF0",
        "HotPink": "#FF69B4",
        "IndianRed": "#CD5C5C",
        "Indigo": "#4B0082",
        "Ivory": "#FFFFF0",
        "Khaki": "#F0E68C",
        "Lavender": "#E6E6FA",
        "LavenderBlush": "#FFF0F5",
        "LawnGreen": "#7CFC00",
        "LemonChiffon": "#FFFACD",
        "LightBlue": "#ADD8E6",
        "LightCoral": "#F08080",
        "LightCyan": "#E0FFFF",
        "LightGoldenRodYellow": "#FAFAD2",
        "LightGray": "#D3D3D3",
        "LightGrey": "#D3D3D3",
        "LightGreen": "#90EE90",
        "LightPink": "#FFB6C1",
        "LightSalmon": "#FFA07A",
        "LightSeaGreen": "#20B2AA",
        "LightSkyBlue": "#87CEFA",
        "LightSlateGray": "#778899",
        "LightSlateGrey": "#778899",
        "LightSteelBlue": "#B0C4DE",
        "LightYellow": "#FFFFE0",
        "Lime": "#00FF00",
        "LimeGreen": "#32CD32",
        "Linen": "#FAF0E6",
        "Magenta": "#FF00FF",
        "Maroon": "#800000",
        "MediumAquaMarine": "#66CDAA",
        "MediumBlue": "#0000CD",
        "MediumOrchid": "#BA55D3",
        "MediumPurple": "#9370DB",
        "MediumSeaGreen": "#3CB371",
        "MediumSlateBlue": "#7B68EE",
        "MediumSpringGreen": "#00FA9A",
        "MediumTurquoise": "#48D1CC",
        "MediumVioletRed": "#C71585",
        "MidnightBlue": "#191970",
        "MintCream": "#F5FFFA",
        "MistyRose": "#FFE4E1",
        "Moccasin": "#FFE4B5",
        "NavajoWhite": "#FFDEAD",
        "Navy": "#000080",
        "OldLace": "#FDF5E6",
        "Olive": "#808000",
        "OliveDrab": "#6B8E23",
        "Orange": "#FFA500",
        "OrangeRed": "#FF4500",
        "Orchid": "#DA70D6",
        "PaleGoldenRod": "#EEE8AA",
        "PaleGreen": "#98FB98",
        "PaleTurquoise": "#AFEEEE",
        "PaleVioletRed": "#DB7093",
        "PapayaWhip": "#FFEFD5",
        "PeachPuff": "#FFDAB9",
        "Peru": "#CD853F",
        "Pink": "#FFC0CB",
        "Plum": "#DDA0DD",
        "PowderBlue": "#B0E0E6",
        "Purple": "#800080",
        "RebeccaPurple": "#663399",
        "Red": "#FF0000",
        "RosyBrown": "#BC8F8F",
        "RoyalBlue": "#4169E1",
        "SaddleBrown": "#8B4513",
        "Salmon": "#FA8072",
        "SandyBrown": "#F4A460",
        "SeaGreen": "#2E8B57",
        "SeaShell": "#FFF5EE",
        "Sienna": "#A0522D",
        "Silver": "#C0C0C0",
        "SkyBlue": "#87CEEB",
        "SlateBlue": "#6A5ACD",
        "SlateGray": "#708090",
        "SlateGrey": "#708090",
        "Snow": "#FFFAFA",
        "SpringGreen": "#00FF7F",
        "SteelBlue": "#4682B4",
        "Tan": "#D2B48C",
        "Teal": "#008080",
        "Thistle": "#D8BFD8",
        "Tomato": "#FF6347",
        "Turquoise": "#40E0D0",
        "Violet": "#EE82EE",
        "Wheat": "#F5DEB3",
        "White": "#FFFFFF",
        "WhiteSmoke": "#F5F5F5",
        "Yellow": "#FFFF00",
        "YellowGreen": "#9ACD32"
    };
    class Color {
        r;
        g;
        b;
        a;
        constructor(r, g, b, a = 255) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            return this;
        }
        rgb() {
            return [this.r, this.g, this.b];
        }
        ;
        css() {
            return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
        }
        hex() {
            let [r, g, b] = this.rgb().map(x => {
                let val = Math.floor(x).toString(16).toUpperCase();
                return (val.length == 1) ? "0" + val : val;
            });
            return `#${r}${g}${b}`;
        }
        ;
        name() {
            let thishex = this.hex();
            for (let [name, hex] of Object.entries(Mondrian.colorNames)) {
                if (hex == thishex) {
                    return name;
                }
            }
            ;
            return undefined;
        }
        ;
        normalise() {
            return this.rgb().map(v => v / 255);
        }
        ;
        xyz() {
            return this.normalise().map(v => (v <= 0.04045) ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        }
        ;
        brightness() {
            return ((this.r + this.g + this.b) ** 0.43) / 17.37698463535537;
        }
        ;
        grey() {
            let v = this.brightness() * 255;
            return new Color(v, v, v);
        }
        ;
        bit3() {
            return Color.fromNormalised(...this.normalise().map(v => Math.round(v)));
        }
        bit8() {
            let [r, g, b] = this.normalise();
            return Color.fromNormalised(Math.round(r * 7) / 7, Math.round(g * 7) / 7, Math.round(b * 3) / 3);
        }
        closest(list, len = 1) {
            let rgb = this.rgb();
            let closest = [];
            for (let color of list) {
                let newrgb = color.rgb();
                let diffs = [];
                for (let x = 0; x <= 2; x++) {
                    diffs.push(Math.abs(rgb[x] - newrgb[x]));
                }
                ;
                closest.push({
                    color: color,
                    diff: diffs.reduce((a, b) => a + b)
                });
            }
            closest.sort((a, b) => a.diff - b.diff);
            return closest.slice(0, len == -1 ? list.length : len);
        }
        static fromHex(hex) {
            return new Mondrian.Color(...[hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(v => parseInt(v, 16)));
        }
        static fromNormalised(r, g, b) {
            return new Color(...[r, g, b].map(v => v * 255));
        }
        static fromXyz(x, y, z) {
            return Color.fromNormalised(...[x, y, z].map(v => (v <= 0.0031308) ? v * 12.92 : 1.055 * (v ** (1 / 2.4)) - 0.055));
        }
        static fromName(name) {
            return Color.fromHex(Mondrian.colorNames[name]);
        }
        static random(rng = randomRNG()) {
            return Color.fromNormalised(rng.next(), rng.next(), rng.next());
        }
    }
    Mondrian.Color = Color;
    function interpolate(a, b, mix) {
        return a + (b - a) * mix;
    }
    ;
    function gradient(color1, color2, mix) {
        let [r1, g1, b1] = color1.xyz();
        let [r2, g2, b2] = color2.xyz();
        let r = interpolate(r1, r2, mix);
        let g = interpolate(g1, g2, mix);
        let b = interpolate(b1, b2, mix);
        let gamma = 0.43;
        let brightness1 = (r1 + g1 + b1) ** gamma;
        let brightness2 = (r2 + g2 + b2) ** gamma;
        let brightness = interpolate(brightness1, brightness2, mix);
        let intensity = brightness ** (1 / gamma);
        if (r + g + b != 0) {
            let factor = intensity / (r + g + b);
            r *= factor;
            g *= factor;
            b *= factor;
        }
        ;
        return Color.fromXyz(r, g, b);
    }
    Mondrian.gradient = gradient;
    ;
    class Gradient {
        list;
        constructor(list) {
            this.list = list;
        }
        smooth(x) {
            let point = Math.min(1, Math.max(x, 0)) * (this.list.length - 1);
            let i = Math.floor(point);
            return (i + 1 < this.list.length) ? gradient(this.list[i], this.list[i + 1], point - i) : this.list[i];
        }
        ;
        dither(x) {
            let point = Math.min(1, Math.max(x, 0));
            let section = 1 / (this.list.length - 1);
            let i = 0;
            for (; i < this.list.length - 1; i++) {
                if (point >= section * i && point <= section * (i + 1))
                    break;
            }
            return [(point - section * i) / section, this.list[i], this.list[i + 1]];
        }
        randomDither(x, rng = randomRNG()) {
            let [mix, color1, color2] = this.dither(x);
            return rng.nextBool(mix) ? color2 : color1;
        }
        block(x) {
            if (x >= 1) {
                return this.list[this.list.length - 1];
            }
            else if (x < 0) {
                return this.list[0];
            }
            else {
                return this.list[Math.floor(x * this.list.length)];
            }
        }
        static fromList(list) {
            return new Gradient(list.map((rgb) => new Color(...rgb)));
        }
    }
    Mondrian.Gradient = Gradient;
    function interpolateList(list, len) {
        let gradient = new Gradient(list);
        return invokeList(len, (i) => gradient.smooth(i / (len - 1)));
    }
    Mondrian.interpolateList = interpolateList;
    function colorList(list) {
        return list.map(item => new Color(...item));
    }
    Mondrian.colorSchemes = {
        autumnal: colorList([[125, 0, 0], [255, 52, 0], [255, 168, 0]]),
        peachy: colorList([[255, 139, 168], [253, 174, 174], [246, 226, 179]]),
        autumnal2: colorList([[86, 24, 70], [148, 11, 63], [199, 0, 57], [255, 99, 56]]),
        fish: colorList([[47, 54, 57], [86, 102, 106], [127, 131, 121], [213, 216, 217]]),
        sakura: colorList([[77, 38, 0], [255, 102, 153], [255, 153, 255], [255, 179, 255]]),
        rainbow: colorList([[255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255]]),
        ocean: ["#000e23", "#00126a", "#00489b", "#0095b8", "#ffffeb"].map(Color.fromHex),
        icecream: ["#141414", "#68372d", "#d17759", "#ffb8ba", "#f7e8d7"].map(Color.fromHex),
        beach: ["#00408b", "#00b5c1", "#ffd96c", "#ff5e00", "#a20000"].map(Color.fromHex),
    };
    // const Mondrian = {
    //     Element: class {
    //         constructor(ctx, x, y, width, height){
    //             this.ctx = ctx;
    //             this.canvas = ctx.canvas;
    //             this.x = x;
    //             this.y = y;
    //             this.width = width;
    //             this.height = height;
    //             this.mousedown = false;
    //             this.clickThrough = false;
    //             this.canvas.addEventListener("click", (event) => {
    //                 if (this.check(event)){
    //                     this.onclick(Mondrian.Element.createEvent(event, this))
    //                 }
    //             });
    //             this.canvas.addEventListener("contextmenu", (event) => {
    //                 event.preventDefault();
    //                 if (this.check(event)){
    //                     this.onrightclick(Mondrian.Element.createEvent(event, this))
    //                 }
    //             });
    //             this.canvas.addEventListener("mousedown", (event) => {
    //                 if (this.check(event)){
    //                     if (event.button == 0){
    //                         this.mousedown = true;
    //                         this.onmousedown(Mondrian.Element.createEvent(event, this))
    //                     }else if (event.button == 2){
    //                         this.rmousedown = true;
    //                         this.onrightmousedown(Mondrian.Element.createEvent(event, this))
    //                     };
    //                 }
    //             });
    //             this.canvas.addEventListener("mouseup", (event) => {
    //                 if (this.check(event)){
    //                     if (event.button == 0){
    //                         this.mousedown = false;
    //                         this.onmouseup(Mondrian.Element.createEvent(event, this))
    //                     }else if (event.button == 2){
    //                         this.rmousedown = false;
    //                         this.onrightmouseup(Mondrian.Element.createEvent(event, this))
    //                     };
    //                 }
    //             });
    //             this.canvas.addEventListener("mousemove", (event) => {
    //                 if (this.check(event)){
    //                     this.onmousemove(Mondrian.Element.createEvent(event, this))
    //                 }
    //             });
    //             this.canvas.addEventListener("wheel", (event) => {
    //                 if (this.check(event)){
    //                     this.onwheel(Mondrian.Element.createEvent(event, this))
    //                 }
    //             });
    //             return this         
    //         }
    //         check(event){
    //             return  event.offsetX > this.x && 
    //                     event.offsetX < this.x + this.width &&
    //                     event.offsetY > this.y && 
    //                     event.offsetY < this.y + this.height;
    //         }
    //         static createEvent(event, element){
    //             event.elementOffsetX = event.offsetX - element.x;
    //             event.elementOffsetY = event.offsetY - element.y;
    //             return event
    //         }
    //         onclick(event){}
    //         onrightclick(event){}
    //         onmousedown(event){}
    //         onrightmousedown(event){}
    //         onmouseup(event){}
    //         onrightmouseup(event){}
    //         onmousemove(event){}
    //         onmouseenter(event){}
    //         onmouseleave(event){}
    //         onwheel(event){}
    //     },
})(Mondrian || (Mondrian = {}));
