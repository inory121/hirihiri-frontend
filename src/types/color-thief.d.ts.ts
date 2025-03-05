declare module 'colorthief' {
  type RGBColor = [number, number, number]

  class ColorThief {
    constructor()

    getColor(img: HTMLImageElement, quality?: number): RGBColor

    getPalette(img: HTMLImageElement, colorCount?: number, quality?: number): RGBColor[]
  }

  export = ColorThief
}
