import {isValid, makeColor, makeGradientLinear} from "../../../libs/utils"
import type {Style} from "../../shared"

export const makeColorFromFill = (fills: ReadonlyArray<Paint> | PluginAPI["mixed"]) => {
  if (!Array.isArray(fills)) {
    return ""
  }

  fills = [...fills].reverse().filter((fill) => fill.visible)
  if (fills.length === 0) {
    return ""
  }

  return fills
    .map((fill, index, A) => {
      if (fill.type === "SOLID") {
        return makeColor(fill.color, fill.opacity)
      }
      if (fill.type === "GRADIENT_LINEAR") {
        return makeGradientLinear(fill)
      }
      return ""
    })
    .filter(isValid)
    .join(",")
}

export const makeCSSVarName = (name: string) => {
  return `--${name.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase()}`
}

export const makeVariableColor = (fillStyleId: string | PluginAPI["mixed"]): string | null => {
  if (figma.variables && typeof fillStyleId === "string") {
    const style = figma.getStyleById(fillStyleId)
    if (style && style.type === "PAINT" && style.paints.length > 0) {
      const name = makeCSSVarName(style.name)
      const color = makeColorFromFill(style.paints)
      return `var(${name},${color})`
    }
  }
  return null
}

export const makeCSSColor = (fillStyleId: string | PluginAPI["mixed"], fills: ReadonlyArray<Paint> | PluginAPI["mixed"]) => {
  return makeVariableColor(fillStyleId) || makeColorFromFill(fills)
}

export const getCssStyleBackground = (node: FrameNode) => {
  const res: Style = {}
  const colors = makeCSSColor(node.fillStyleId, node.fills)
  if (colors) {
    res.background = colors
  }
  return res
}
