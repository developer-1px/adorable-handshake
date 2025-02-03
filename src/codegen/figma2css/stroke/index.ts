import type {Style} from "../../shared"
import {fourSideValues, makeColor, px} from "../../../libs/utils"

export const getCssStyleBorder = (node: FrameNode) => {
  const res: Style = {}
  if (!Array.isArray(node.strokes)) {
    return res
  }

  const border = node.strokes.find((stroke) => stroke.visible)
  if (!border) {
    return res
  }

  const {dashPattern, strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight, strokeAlign} = node

  const borderStyle = dashPattern?.length ? "dashed" : "solid"
  const borderColor = makeColor(border.color, border.opacity)

  if (strokeTopWeight === strokeRightWeight && strokeRightWeight === strokeBottomWeight && strokeBottomWeight === strokeLeftWeight) {
    res["outline"] = `${px(strokeTopWeight)} ${borderStyle} ${borderColor}`
    if (strokeAlign !== "CENTER") {
      res["outline-offset"] = strokeAlign === "INSIDE" ? `-${px(strokeTopWeight)}` : strokeAlign === "OUTSIDE" ? px(strokeTopWeight) : "0px"
    }
  } else {
    res["border"] = `${borderStyle} ${borderColor}`
    res["border-width"] = fourSideValues(strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight).map(px).join(" ")
    res["border-offset"] = fourSideValues(strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight).map(px).join(" ")
  }
  return res
}
