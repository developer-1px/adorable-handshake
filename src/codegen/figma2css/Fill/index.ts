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

  // multiple backgrounds -> mix!
  return fills
    .map((fill, index, A) => {
      if (fill.type === "SOLID" && index === A.length - 1) {
        return makeColor(fill.color, fill.opacity)
      }
      if (fill.type === "SOLID") {
        return `linear-gradient(0deg,${makeColor(fill.color, fill.opacity)} 0%,${makeColor(fill.color, fill.opacity)} 100%)`
      }
      if (fill.type === "GRADIENT_LINEAR") {
        return makeGradientLinear(fill)
      }
      return ""
    })
    .filter(isValid)
    .join(",")
}

export const getCssStyleBackground = (node: FrameNode) => {
  const res: Style = {}

  const colors = makeColorFromFill(node.fills)
  if (colors) {
    res.background = colors
  }

  return res
}
