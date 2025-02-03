import type {Style} from "../../shared"
import {fourSideValues, makeNumber, px} from "../../../libs/utils"

export const getCssStyleBorderRadius = (node: FrameNode | EllipseNode) => {
  const res: Style = {}

  if (node.type === "ELLIPSE") {
    res["border-radius"] = "100%"
    return res
  }

  const {topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius, cornerRadius} = node
  if (typeof cornerRadius === "number" && cornerRadius > 0) {
    res["border-radius"] = px(cornerRadius)
  } else if (topLeftRadius > 0 || topRightRadius > 0 || bottomRightRadius > 0 || bottomLeftRadius > 0) {
    res["border-radius"] = fourSideValues(topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius).map(px).join(" ")
  }

  return res
}

// @TODO: Group에도 opacity가 있다. display:contents를 활용하는 방법을 고민해보자.
export const getCssOpacity = (node: FrameNode | TextNode) => {
  const res: Style = {}

  if (!node.visible) {
    res.display = "none"
  }

  if (node.opacity === 1) {
    return res
  }

  res.opacity = makeNumber(node.opacity)
  return res
}
