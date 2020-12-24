import { RenderableTerminal } from "./terminal";
import { Display } from "./display";
import { Glyph } from "./glyph";
import { Vector2 } from "../util/vector";

export class Font {
  readonly family: string;
  readonly size: number;
  readonly charWidth: number;
  readonly lineHeight: number;
  readonly x: number;
  readonly y: number;

  constructor(
    family: string,
    size: number,
    charWidth: number,
    height: number,
    x: number,
    y: number
  ) {
    this.family = family;
    this.size = size;
    this.charWidth = charWidth;
    this.lineHeight = height;
    this.x = x;
    this.y = y;
  }
}

export class Canvas extends RenderableTerminal {
  readonly display: Display;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  readonly font: Font;
  readonly scale: number = window.devicePixelRatio;

  constructor(
    width: number,
    height: number,
    font: Font,
    mountNode?: HTMLElement
  ) {
    super({ height, width });
    this.display = new Display(width, height);
    this.font = font;
    this.canvas = window.document.createElement("canvas");
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    const canvasWidth = this.font.charWidth * this.display.width;
    const canvasHeight = this.font.lineHeight * this.display.height;
    this.canvas.width = canvasWidth * this.scale;
    this.canvas.height = canvasHeight * this.scale;
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;

    // Mount the canvas
    if (mountNode) {
      mountNode.appendChild(this.canvas);
    } else {
      window.document.body.appendChild(this.canvas);
    }
  }

  drawGlyph(x: number, y: number, glyph: Glyph) {
    this.display.setGlyph(x, y, glyph);
  }

  render() {
    this.context.font = `${this.font.size * this.scale}px ${
      this.font.family
    }, monospace`;

    this.display.render((x, y, glyph) => {
      // Fill the background
      this.context.fillStyle = glyph.back.cssColor();
      this.context.fillRect(
        x * this.font.charWidth * this.scale,
        y * this.font.lineHeight * this.scale,
        this.font.charWidth * this.scale,
        this.font.lineHeight * this.scale
      );

      // Dont bother drawing empty characters
      if (glyph.char === 0 || " ".charCodeAt(0) === glyph.char) {
        return;
      }

      // Fill the char
      this.context.fillStyle = glyph.fore.cssColor();
      this.context.fillText(
        String.fromCharCode(glyph.char),
        (x * this.font.charWidth + this.font.x) * this.scale,
        (y * this.font.lineHeight + this.font.y) * this.scale
      );
    });
  }

  pixelToChar(pixel: Vector2): Vector2 {
    return {
      x: Math.floor(pixel.x / this.font.charWidth),
      y: Math.floor(pixel.y / this.font.lineHeight),
    };
  }

  /** Deletes the terminal, removing the canvas. */
  delete() {
    this.canvas.parentNode?.removeChild(this.canvas);
  }
}
