import type {Style} from "../../shared"
import {isValid, makeColor, px} from "../../../libs/utils"

export const getCssEffectClass = (node: FrameNode) => {
  const res: Style = {}

  if (!Array.isArray(node.effects)) {
    return res
  }

  node.effects
    .filter((e) => e.visible)
    .forEach((effect: Effect) => {
      switch (effect.type) {
        case "DROP_SHADOW":
        case "INNER_SHADOW": {
          const {color, offset, radius, spread} = effect
          if (spread) {
            const {x, y} = offset
            const inset = effect.type === "INNER_SHADOW" ? "inset" : ""
            res["box-shadow"] = [inset, x, y, radius, spread, makeColor(color, color.a)].filter(isValid).map(px).join(" ")
          }
          break
        }

        case "LAYER_BLUR": {
          res.filter = `blur(${px(effect.radius / 2)})`
          break
        }

        case "BACKGROUND_BLUR": {
          res.filter = `backdrop-blur(${px(effect.radius / 2)})`
          break
        }
      }
    })

  return res
}
