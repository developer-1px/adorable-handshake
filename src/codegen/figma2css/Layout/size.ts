import {px} from "../../../libs/utils"
import {isAbsoluteLayout, type Style} from "../../shared"

const isParentLayoutMode = (node: FrameNode, value: string) => (node.parent as FrameNode)?.layoutMode === value

const hasAutoResizingTextChild = (node: FrameNode) =>
  node.findChild && node.findChild((child: SceneNode) => child.type === "TEXT" && (child as TextNode).textAutoResize === "WIDTH_AND_HEIGHT")

const hasHugWidthChild = (node: FrameNode) =>
  node.findChild && node.findChild((child: SceneNode) => child.type === "FRAME" && child.layoutSizingHorizontal === "HUG")

export const addStyleWidth = (node: FrameNode | TextNode) => {
  const res: Style = {}

  const {constraints, layoutSizingHorizontal, absoluteRenderBounds, width: _width, minWidth, maxWidth} = node
  const horizontal = constraints?.horizontal ?? "MIN"
  const width = node.type === "Text" ? (absoluteRenderBounds?.width ?? _width) : _width

  if (isAbsoluteLayout(node) && (horizontal === "STRETCH" || horizontal === "SCALE")) {
  } else if (layoutSizingHorizontal === "HUG") {
    res.width = "fit-content"
  } else if (layoutSizingHorizontal === "FIXED") {
    res.width = px(width)
  } else if (layoutSizingHorizontal === "FILL") {
    if (isParentLayoutMode(node, "HORIZONTAL")) res["flex"] = 1
    else if (isParentLayoutMode(node, "VERTICAL")) res["align-self"] = "stretch"
    else res["width"] = "100%"
  }

  minWidth !== null && (res["min-width"] = px(minWidth))
  maxWidth !== null && (res["max-width"] = px(maxWidth))

  return res
}

export const addStyleHeight = (node: FrameNode) => {
  const res: Style = {}

  const {constraints, layoutSizingVertical, height, minHeight, maxHeight} = node
  const vertical = constraints?.vertical ?? "MIN"

  if (isAbsoluteLayout(node) && (vertical === "STRETCH" || vertical === "SCALE")) {
  } else if (layoutSizingVertical === "HUG") {
    res.height = "fit-content"
  } else if (layoutSizingVertical === "FIXED") {
    res.height = px(height)
  } //
  else if (layoutSizingVertical === "FILL") {
    if (isParentLayoutMode(node, "VERTICAL")) res.flex = 1
    else if (isParentLayoutMode(node, "HORIZONTAL")) res["align-self"] = "stretch"
    else res.height = "100%"
  }

  minHeight !== null && (res["min-height"] = px(minHeight))
  maxHeight !== null && (res["max-height"] = px(maxHeight))

  return res
}

export const getCssStyleSize = (node: FrameNode | TextNode) => {
  const res: Style = {
    ...addStyleWidth(node),
    ...addStyleHeight(node),
  }

  const {layoutSizingHorizontal, layoutSizingVertical} = node
  if (
    (layoutSizingHorizontal === "FIXED" && isParentLayoutMode(node, "HORIZONTAL")) ||
    (layoutSizingVertical === "FIXED" && isParentLayoutMode(node, "VERTICAL"))
  ) {
    res["flex-shrink"] = "0"
  }

  return res
}
