declare namespace Mondrian {
    /** Any string representation of a color. E.g. "#FF6600", "rgb(255, 128, 0)", "orange" etc. */
    type ColorString = string;
    /** Object containing optional parameters for creating a Mondrian Context object */
    interface ContextParams {
        /** Default background color of canvas. Default: "black" */
        color?: ColorString;
        /** Width and Height of pixel. Default: 1 */
        pixelSize?: number;
        /** Whether or not to use borderbox sizing. Default: false */
        borderBox?: boolean;
        /** If true,  */
        useCanvasDims?: boolean;
    }
    const positions: readonly ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"];
    type Position = typeof positions[number];
    /** Object containing optional parameters for  */
    interface drawParams {
        /** Fill color of shape */
        fillStyle?: ColorString;
        /** Stroke color */
        strokeStyle?: ColorString;
        /** Stroke width */
        lineWidth?: number;
        /** Position to draw from */
        position?: Position;
    }
    /** Function to generate a random number between 0 and 1 */
    export var rng: () => number;
    export class Context {
        /** Canvas element that this context is tied to */
        canvas: HTMLCanvasElement;
        /** Width of canvas */
        width: number;
        /** Height of canvas */
        height: number;
        /** 2D Canvas rendering context for this canvas */
        ctx: CanvasRenderingContext2D;
        /** Size of pixel */
        pixelSize: number;
        /** Whether or not to include border width when calculating shape width and height */
        borderBox: boolean;
        /** Background color, when Context.clear() is called, this color will fill the canvas */
        color: ColorString;
        /**
         *
         * @param canvas - Canvas element to draw on
         * @param width - Width of the canvas
         * @param height - Height of the canvas
         * @param params - Optional parameters for the context
         */
        constructor(canvas: HTMLCanvasElement, width: number, height: number, params?: ContextParams);
        _setStyles(params: drawParams): void;
        _resetStyles(): void;
        /**
         * Draws a rectangle on the canvas
         * @param x - X coord of rectangle
         * @param y - Y coord of rectangle
         * @param width - Width of rectangle
         * @param height - Height of rectangle
         * @param params - Optional Parameters
         */
        drawRect(x: number, y: number, width: number, height: number, params?: drawParams): void;
        drawImage(img: Image, x: number, y: number, position?: Position): void;
        clear(): void;
        /** Creates an Image object from the */
        snip(x: number, y: number, width: number, height: number): Image;
        toImage(): Image;
        toDataURL(): string;
        createElement(): {
            yes: string;
        };
        getMouse(useTouch?: boolean): Mouse;
        private static _position;
        static create(width: number, height: number, params?: ContextParams): Context;
    }
    export class Mouse {
        /** Element this mouse is tied to */
        el: HTMLElement;
        /** X Coord of the mouse relative to pixel size of the context */
        x: number;
        /** Y Coord of the mouse relative to pixel size of the context */
        y: number;
        /** X coord of the mouse on the context's canvas */
        realx: number;
        /** Y coord of the mouse on the context's canvas */
        realy: number;
        /** If the mouse's left button is down */
        down: boolean;
        /** If the mouse's right button is down */
        rdown: boolean;
        constructor(el: HTMLElement, useTouch?: boolean, pixelSize?: number);
        static fromCtx(ctx: Mondrian.Context): Mouse;
    }
    /** Class for handling images */
    export class Image {
        /** ImageData for this image */
        imageData: ImageData;
        /** Width of image */
        width: number;
        /** Height of image */
        height: number;
        /** If this image was created using an asynchronous method, this promise will resolve when the image loads */
        load?: Promise<Image>;
        /**
         *
         * @param imageData - ImageData object to create image from
         */
        constructor(imageData: ImageData);
        getPixel(x: number, y: number): Color;
        map(func: (x: number, y: number, color: Color) => any): any[];
        scaleUp(factor: number): Image;
        /** Gets image data from a file path */
        static getImageData(path: string): Promise<ImageData>;
        /** Creates an Image object from a file path */
        static fromFile(path: string): Image;
        /** Creates an image from a Context */
        static fromCtx(width: number, height: number, func: (ctx: Context) => void, params?: ContextParams): Image;
        /** Gets an image from an HTML input element */
        static fromInput(input: HTMLInputElement): Image;
    }
    export function lerp(ax: number, ay: number, bx: number, by: number, s: number): [number, number];
    export class Path {
        /** Coords of the previous given point on the path, null if path not started */
        previous: number[] | null;
        res: number;
        /** Function to call for each point on the path */
        drawFunc: (x: number, y: number) => void;
        constructor(drawFunc: (x: number, y: number) => void, res?: number);
        draw(start: boolean, end: boolean, x: number, y: number): void;
    }
    export class Pen {
        drawFunc: (x: number, y: number) => void;
        constructor(drawFunc: (x: number, y: number) => void);
    }
    /** Runs the window.requestAnimationFrame loop with given function */
    export function animate(
    /** Function to call for each frame in the animation loop */
    func: (fps: number) => void): void;
    /** Object of all HTML color names and their hex code values */
    export const colorNames: {
        readonly AliceBlue: "#F0F8FF";
        readonly AntiqueWhite: "#FAEBD7";
        readonly Aqua: "#00FFFF";
        readonly Aquamarine: "#7FFFD4";
        readonly Azure: "#F0FFFF";
        readonly Beige: "#F5F5DC";
        readonly Bisque: "#FFE4C4";
        readonly Black: "#000000";
        readonly BlanchedAlmond: "#FFEBCD";
        readonly Blue: "#0000FF";
        readonly BlueViolet: "#8A2BE2";
        readonly Brown: "#A52A2A";
        readonly BurlyWood: "#DEB887";
        readonly CadetBlue: "#5F9EA0";
        readonly Chartreuse: "#7FFF00";
        readonly Chocolate: "#D2691E";
        readonly Coral: "#FF7F50";
        readonly CornflowerBlue: "#6495ED";
        readonly Cornsilk: "#FFF8DC";
        readonly Crimson: "#DC143C";
        readonly Cyan: "#00FFFF";
        readonly DarkBlue: "#00008B";
        readonly DarkCyan: "#008B8B";
        readonly DarkGoldenRod: "#B8860B";
        readonly DarkGray: "#A9A9A9";
        readonly DarkGrey: "#A9A9A9";
        readonly DarkGreen: "#006400";
        readonly DarkKhaki: "#BDB76B";
        readonly DarkMagenta: "#8B008B";
        readonly DarkOliveGreen: "#556B2F";
        readonly DarkOrange: "#FF8C00";
        readonly DarkOrchid: "#9932CC";
        readonly DarkRed: "#8B0000";
        readonly DarkSalmon: "#E9967A";
        readonly DarkSeaGreen: "#8FBC8F";
        readonly DarkSlateBlue: "#483D8B";
        readonly DarkSlateGray: "#2F4F4F";
        readonly DarkSlateGrey: "#2F4F4F";
        readonly DarkTurquoise: "#00CED1";
        readonly DarkViolet: "#9400D3";
        readonly DeepPink: "#FF1493";
        readonly DeepSkyBlue: "#00BFFF";
        readonly DimGray: "#696969";
        readonly DimGrey: "#696969";
        readonly DodgerBlue: "#1E90FF";
        readonly FireBrick: "#B22222";
        readonly FloralWhite: "#FFFAF0";
        readonly ForestGreen: "#228B22";
        readonly Fuchsia: "#FF00FF";
        readonly Gainsboro: "#DCDCDC";
        readonly GhostWhite: "#F8F8FF";
        readonly Gold: "#FFD700";
        readonly GoldenRod: "#DAA520";
        readonly Gray: "#808080";
        readonly Grey: "#808080";
        readonly Green: "#008000";
        readonly GreenYellow: "#ADFF2F";
        readonly HoneyDew: "#F0FFF0";
        readonly HotPink: "#FF69B4";
        readonly IndianRed: "#CD5C5C";
        readonly Indigo: "#4B0082";
        readonly Ivory: "#FFFFF0";
        readonly Khaki: "#F0E68C";
        readonly Lavender: "#E6E6FA";
        readonly LavenderBlush: "#FFF0F5";
        readonly LawnGreen: "#7CFC00";
        readonly LemonChiffon: "#FFFACD";
        readonly LightBlue: "#ADD8E6";
        readonly LightCoral: "#F08080";
        readonly LightCyan: "#E0FFFF";
        readonly LightGoldenRodYellow: "#FAFAD2";
        readonly LightGray: "#D3D3D3";
        readonly LightGrey: "#D3D3D3";
        readonly LightGreen: "#90EE90";
        readonly LightPink: "#FFB6C1";
        readonly LightSalmon: "#FFA07A";
        readonly LightSeaGreen: "#20B2AA";
        readonly LightSkyBlue: "#87CEFA";
        readonly LightSlateGray: "#778899";
        readonly LightSlateGrey: "#778899";
        readonly LightSteelBlue: "#B0C4DE";
        readonly LightYellow: "#FFFFE0";
        readonly Lime: "#00FF00";
        readonly LimeGreen: "#32CD32";
        readonly Linen: "#FAF0E6";
        readonly Magenta: "#FF00FF";
        readonly Maroon: "#800000";
        readonly MediumAquaMarine: "#66CDAA";
        readonly MediumBlue: "#0000CD";
        readonly MediumOrchid: "#BA55D3";
        readonly MediumPurple: "#9370DB";
        readonly MediumSeaGreen: "#3CB371";
        readonly MediumSlateBlue: "#7B68EE";
        readonly MediumSpringGreen: "#00FA9A";
        readonly MediumTurquoise: "#48D1CC";
        readonly MediumVioletRed: "#C71585";
        readonly MidnightBlue: "#191970";
        readonly MintCream: "#F5FFFA";
        readonly MistyRose: "#FFE4E1";
        readonly Moccasin: "#FFE4B5";
        readonly NavajoWhite: "#FFDEAD";
        readonly Navy: "#000080";
        readonly OldLace: "#FDF5E6";
        readonly Olive: "#808000";
        readonly OliveDrab: "#6B8E23";
        readonly Orange: "#FFA500";
        readonly OrangeRed: "#FF4500";
        readonly Orchid: "#DA70D6";
        readonly PaleGoldenRod: "#EEE8AA";
        readonly PaleGreen: "#98FB98";
        readonly PaleTurquoise: "#AFEEEE";
        readonly PaleVioletRed: "#DB7093";
        readonly PapayaWhip: "#FFEFD5";
        readonly PeachPuff: "#FFDAB9";
        readonly Peru: "#CD853F";
        readonly Pink: "#FFC0CB";
        readonly Plum: "#DDA0DD";
        readonly PowderBlue: "#B0E0E6";
        readonly Purple: "#800080";
        readonly RebeccaPurple: "#663399";
        readonly Red: "#FF0000";
        readonly RosyBrown: "#BC8F8F";
        readonly RoyalBlue: "#4169E1";
        readonly SaddleBrown: "#8B4513";
        readonly Salmon: "#FA8072";
        readonly SandyBrown: "#F4A460";
        readonly SeaGreen: "#2E8B57";
        readonly SeaShell: "#FFF5EE";
        readonly Sienna: "#A0522D";
        readonly Silver: "#C0C0C0";
        readonly SkyBlue: "#87CEEB";
        readonly SlateBlue: "#6A5ACD";
        readonly SlateGray: "#708090";
        readonly SlateGrey: "#708090";
        readonly Snow: "#FFFAFA";
        readonly SpringGreen: "#00FF7F";
        readonly SteelBlue: "#4682B4";
        readonly Tan: "#D2B48C";
        readonly Teal: "#008080";
        readonly Thistle: "#D8BFD8";
        readonly Tomato: "#FF6347";
        readonly Turquoise: "#40E0D0";
        readonly Violet: "#EE82EE";
        readonly Wheat: "#F5DEB3";
        readonly White: "#FFFFFF";
        readonly WhiteSmoke: "#F5F5F5";
        readonly Yellow: "#FFFF00";
        readonly YellowGreen: "#9ACD32";
    };
    type ColorTuple = [number, number, number];
    export class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r: number, g: number, b: number, a?: number);
        /**
         * Returns tuple of RGB values between 0 and 255
         */
        rgb(): ColorTuple;
        /**
         * Returns string in the format "rgba(r, g, b, a)"
         */
        css(): string;
        /**
         * Returns hex code representation of this color
         */
        hex(): string;
        /**
         * Returns tuple of normalised RGB values between 0 and 1
         */
        normalise(): ColorTuple;
        /**
         * Returns tuple of XYZ values
         */
        xyz(): ColorTuple;
        brightness(): number;
        grey(): Color;
        bit3(): Color;
        bit8(): Color;
        closest(list: Color[], len?: number): {
            color: Color;
            diff: number;
        }[];
        static fromHex(hex: string): Color;
        static fromNormalised(r: number, g: number, b: number): Color;
        static fromXyz(x: number, y: number, z: number): Color;
        static fromName(name: keyof typeof colorNames): Color;
        static random(): Color;
    }
    export function gradient(color1: Color, color2: Color, mix: number): Color;
    export class Gradient {
        list: Color[];
        constructor(list: Color[]);
        smooth(x: number): Color;
        dither(x: number): [number, Color, Color];
        randomDither(x: number): Color;
        block(x: number): Color;
        static fromList(list: ColorTuple[]): Gradient;
    }
    export function interpolateList(list: Color[], len: number): Color[];
    /** Some preset color schemes */
    export const colorSchemes: {
        autumnal: Color[];
        peachy: Color[];
        autumnal2: Color[];
        fish: Color[];
        sakura: Color[];
        rainbow: Color[];
        ocean: Color[];
        /** #141414, #68372d, #d17759, #ffb8ba, #f7e8d7 */
        icecream: Color[];
        beach: Color[];
    };
    export class Element {
        static elements: Element[];
        ctx: Context;
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(ctx: Context, x: number, y: number, width: number, height: number);
    }
    export {};
}
