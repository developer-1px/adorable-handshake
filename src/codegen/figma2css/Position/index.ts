import {percent, px} from "../../../libs/utils"
import {isAbsoluteLayout, type Style} from "../../shared"

export const getCssStylePosition = (node: FrameNode | TextNode) => {
  const res: Style = {}

  if (!node || !node.parent) {
    return
  }

  if (node.parent?.type === "COMPONENT_SET") {
    return
  }

  if (isAbsoluteLayout(node)) {
    const rect1 = node.parent.absoluteBoundingBox
    const rect2 = node.absoluteBoundingBox

    if (!rect1 || !rect2) {
      return
    }

    const {horizontal = "MIN", vertical = "MIN"} = node.constraints ?? {}

    const x = rect2.x - rect1.x
    const y = rect2.y - rect1.y
    const right = rect1.x + rect1.width - rect2.x - rect2.width
    const bottom = rect1.y + rect1.height - rect2.y - rect2.height

    const offsetXFromCenter = rect2.x - rect1.x - (rect1.width / 2 - rect2.width / 2)
    const offsetYFromCenter = rect2.y - rect1.y - (rect1.height / 2 - rect2.height / 2)

    const percentLeft = (x / rect1.width) * 100
    const percentRight = (right / rect1.width) * 100

    const percentTop = (y / rect1.height) * 100
    const percentBottom = (bottom / rect1.height) * 100

    // position: absolute
    res.position = "absolute"

    // 'CENTER' origin
    if (horizontal === "CENTER" && vertical === "CENTER") {
      res.transform = "translate(-50%,-50%)"
    } else if (horizontal === "CENTER") {
      res.transform = "translateX(-50%)"
    } else if (vertical === "CENTER") {
      res.transform = "translateY(-50%)"
    }

    // x: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    switch (horizontal) {
      case "MIN": {
        res.left = px(x)
        break
      }
      case "MAX": {
        res.right = px(right)
        break
      }
      case "CENTER": {
        if (Math.abs(offsetXFromCenter) <= 1) res.left = "50%"
        else res.left = `calc(50% + ${px(offsetXFromCenter)})`
        break
      }
      case "STRETCH": {
        res.left = px(x)
        res.right = px(right)
        break
      }
      case "SCALE": {
        res.left = percent(percentLeft)
        res.right = percent(percentRight)
      }
    }

    // y: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    switch (vertical) {
      case "MIN": {
        res.top = px(y)
        break
      }
      case "MAX": {
        res.bottom = px(bottom)
        break
      }
      case "CENTER": {
        if (Math.abs(offsetYFromCenter) <= 1) res.top = "50%"
        else res.top = `calc(50% + ${px(offsetYFromCenter)})`
        break
      }
      case "STRETCH": {
        res.top = px(y)
        res.bottom = px(bottom)
        break
      }
      case "SCALE": {
        res.top = percent(percentTop)
        res.bottom = percent(percentBottom)
      }
    }
    return res
  }

  if (node.findChild && node.findChild((child) => isAbsoluteLayout(child))) {
    res.position = "relative"
  }

  return res
}
