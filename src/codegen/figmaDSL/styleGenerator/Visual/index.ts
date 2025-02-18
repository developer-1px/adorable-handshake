import {createFigmaDSLStyleBuilder} from "../createFigmaDSLStyleBuilder"
import {fourSideValues} from "../../../../libs/utils"
import {makeColorFromFill, makeCSSColor} from "../../../figma2css/Fill"

export function addVisualStyles(node: FrameNode, styles: ReturnType<typeof createFigmaDSLStyleBuilder>) {
  // Border Radius
  const {topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius} = node
  if (topLeftRadius > 0 || topRightRadius > 0 || bottomRightRadius > 0 || bottomLeftRadius > 0) {
    styles.r(...fourSideValues(topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius))
  }

  // Fill
  const color = makeColorFromFill(node.fills)
  if (color) {
    styles.bg(color)
  }

  // Stroke
  if (node.strokes && node.strokes.find((stroke) => stroke.visible)) {
    const borderColor = makeCSSColor(node.strokeStyleId, node.strokes)
    if (borderColor) {
      styles.b(borderColor)
    }
  }

  // Opacity
  const {opacity} = node
  if (opacity < 1) {
    styles.opacity(opacity)
  }

  // Overflow
  if (node.clipsContent) {
    styles.clip()
  }
}
