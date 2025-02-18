import {makeInt, makeNumber, percent} from "../../../../libs/utils"
import {isAbsoluteLayout} from "../../../shared"
import {createFigmaDSLStyleBuilder} from "../createFigmaDSLStyleBuilder"

export function areRectanglesEqual(rect1, rect2, tolerance = 0.001) {
  // 입력값 유효성 검사
  if (!rect1 || !rect2) {
    return false
  }

  const properties = ["x", "y", "width", "height"]

  // 모든 필수 속성이 있는지 확인
  for (const prop of properties) {
    if (typeof rect1[prop] !== "number" || typeof rect2[prop] !== "number") {
      return false
    }
  }

  // 각 속성 비교 (허용 오차 내에서)
  return properties.every((prop) => Math.abs(rect1[prop] - rect2[prop]) <= tolerance)
}

export const addPositionStyles = (node: FrameNode, styles: ReturnType<typeof createFigmaDSLStyleBuilder>) => {
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

    // x: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    const _x = (() => {
      switch (horizontal) {
        case "MIN": {
          return makeInt(x)
        }
        case "MAX": {
          return ".." + makeInt(x)
        }
        case "CENTER": {
          if (Math.abs(offsetXFromCenter) <= 1) return "center"
          else return "center+" + makeInt(offsetXFromCenter)
        }
        case "STRETCH": {
          return makeInt(x) + ".." + makeInt(right)
        }
        case "SCALE": {
          return percent(percentLeft) + ".." + percent(percentRight)
        }
      }
      return makeInt(x)
    })()

    // y: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    const _y = (() => {
      switch (vertical) {
        case "MIN": {
          return makeInt(y)
        }
        case "MAX": {
          return ".." + makeInt(y)
        }
        case "CENTER": {
          if (Math.abs(offsetYFromCenter) <= 1) return "center"
          else return "center" + (offsetYFromCenter > 0 ? "+" : "") + makeInt(offsetYFromCenter)
        }
        case "STRETCH": {
          return makeInt(y) + ".." + makeInt(bottom)
        }
        case "SCALE": {
          return percent(percentTop) + ".." + percent(percentBottom)
        }
      }
      return makeInt(y)
    })()

    if (areRectanglesEqual(rect1, rect2)) {
      styles.layer()
    } else {
      styles.absolute(_x, _y)
    }
  }

  // relative
  else if (node.children?.some(isAbsoluteLayout)) {
    styles.add("relative")
  } else if (!["PAGE", "DOCUMENT"].includes(node.parent?.type) && node.parent?.findChild(isAbsoluteLayout)) {
    styles.add("relative")
  }

  // rotate
  if (Math.abs(node.rotation) >= 0.01) {
    styles.add("rotate", makeNumber(node.rotation))
  }
}
