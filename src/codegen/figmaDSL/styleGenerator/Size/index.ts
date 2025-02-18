// Size: Width & Height
import {areRectanglesEqual} from "../Position"
import type {createFigmaDSLStyleBuilder} from "../createFigmaDSLStyleBuilder"

export function addSizeStyles(node: FrameNode, styles: ReturnType<typeof createFigmaDSLStyleBuilder>) {
  // 부모를 덮고 있으면 layer
  if (areRectanglesEqual(node.absoluteBoundingBox, node.parent?.absoluteBoundingBox)) {
    return
  }

  const {layoutSizingHorizontal, layoutSizingVertical, width, height, minWidth, maxWidth, minHeight, maxHeight} = node

  const constraintsMap = {
    STRETCH: "stretch",
    SCALE: "scale",
    FILL: "fill",
    HUG: "hug",
  }

  const _width = constraintsMap[node.constraints?.horizontal] || constraintsMap[layoutSizingHorizontal] || width
  const _height = constraintsMap[node.constraints?.vertical] || constraintsMap[layoutSizingVertical] || height

  // Fixed Size: 320x240
  if (_width > 0 && _height > 0) {
    styles.size(width, height)
  } else {
    styles.w(_width)
    styles.h(_height)
  }
}
