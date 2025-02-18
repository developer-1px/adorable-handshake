import {makeNumber} from "../../../libs/utils"

type StyleValue = string | number
type StyleFn = (...args: StyleValue[]) => Api

const makeInt = (value: StyleValue): number => (typeof value === "string" ? parseInt(value, 10) : value)

const makeIntIf = (value: StyleValue): StyleValue => (typeof value === "string" ? value : Math.round(value))

const addStyle =
  (prop: string) =>
  (delimiter: string = "/") =>
  (mapper?: (v: StyleValue) => StyleValue) => {
    return (args: StyleValue[]) => {
      const validArgs = args.filter((arg) => arg != null && arg !== "").map(mapper || ((v) => v))

      if (validArgs.length === 0) {
        return prop
      }

      return `${prop}(${validArgs.join(delimiter)})`
    }
  }

export const createFigmaDSLStyleBuilder = () => {
  const styles: string[] = []

  const appendStyle = (style: string) => {
    styles.push(style)
    return api
  }

  const createStyleFn =
    (prop: string, delimiter?: string, mapper?: (v: StyleValue) => StyleValue): StyleFn =>
    (...args: StyleValue[]) =>
      appendStyle(addStyle(prop)(delimiter)(mapper)(args))

  const api = {
    add: (prop: string, ...values: StyleValue[]) => createStyleFn(prop)(...values),

    // Sizing
    size: (width: number, height: number) => appendStyle(makeIntIf(width) + "x" + makeIntIf(height)),
    w: createStyleFn("w", "/", makeIntIf),
    h: createStyleFn("h", "/", makeIntIf),

    // Position
    layer: createStyleFn("layer", "+"),
    absolute: createStyleFn("", ","),
    relative: createStyleFn("relative"),
    x: createStyleFn("x", ",", makeInt),
    y: createStyleFn("y", ",", makeInt),

    // Layout: AutoLayout
    hbox: createStyleFn("hbox", "+"),
    vbox: createStyleFn("vbox", "+"),
    wrap: createStyleFn("wrap", "+"),

    // Layout: Spacing
    gap: createStyleFn("gap"),
    p: createStyleFn("p", "/", makeInt),

    // Visual
    r: createStyleFn("r"),
    bg: createStyleFn("bg"),
    b: createStyleFn("b"),
    opacity: createStyleFn("opacity", "/", makeNumber),
    clip: createStyleFn("clip"),

    // Text
    font: createStyleFn("font"),
    c: createStyleFn("c"),
    text: createStyleFn("text", "+"),
    maxLines: createStyleFn("max-lines"),

    reset: () => {
      styles.length = 0
      return api
    },

    toString: () => styles.join(" "),
  }

  return api
}
