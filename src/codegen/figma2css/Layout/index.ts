import {fourSideValues, isNumber, px} from "../../../libs/utils"
import type {Style} from "../../shared"

export const isAutoLayout = (node: FrameNode) => node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL"

// Flex Layout
export const getCssStyleFlexbox = (node: FrameNode) => {
  const res: Style = {}

  const {
    layoutMode,
    layoutWrap,

    primaryAxisAlignItems,
    counterAxisAlignItems,
    counterAxisAlignContent,
    counterAxisSpacing,

    itemSpacing,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,

    itemReverseZIndex,
  } = node

  const numChildren = node.children?.filter((child) => child.visible).length
  const hasChildren = numChildren > 0
  const hasMoreChildren = numChildren > 1

  if (!layoutMode || layoutMode === "NONE" || !hasChildren) {
    return
  }

  // Flow: hbox / vbox / wrap
  res["display"] = "flex"
  if (layoutMode === "HORIZONTAL" && layoutWrap === "WRAP") res["flex-flow"] = "wrap"
  else if (layoutMode === "HORIZONTAL") res["flex-flow"] = "row"
  else if (layoutMode === "VERTICAL") res["flex-flow"] = "column"

  // Alignment: hbox / vbox / wrap
  if (counterAxisAlignItems === "MIN") res["align-items"] = "flex-start"
  else if (counterAxisAlignItems === "CENTER") res["align-items"] = "center"
  else if (counterAxisAlignItems === "BASELINE") res["align-items"] = "baseline"
  else if (counterAxisAlignItems === "MAX") res["align-items"] = "flex-end"

  if (primaryAxisAlignItems === "MIN") res["justify-content"] = "flex-start"
  else if (primaryAxisAlignItems === "CENTER") res["justify-content"] = "center"
  else if (primaryAxisAlignItems === "MAX") res["justify-content"] = "flex-end"

  // Spacing: gap

  // figma itemSpacing 는 주축 간격
  // crossAxisSpacing 는 교차축 간격
  // 그러나 추축이 SPACE_BETWEEN 일 때는 justify-content gap은 없다.

  // 주축 간격
  if (primaryAxisAlignItems === "SPACE_BETWEEN") {
    res["justify-content"] = numChildren === 1 ? "center" : "space-between"
  } //
  else if (hasMoreChildren && isNumber(itemSpacing) && itemSpacing !== 0) {
    res["gap"] = px(itemSpacing)
  }

  // 교차축 간격
  if (counterAxisSpacing !== null && counterAxisSpacing !== 0) {
    const gapPrimary = primaryAxisAlignItems === "SPACE_BETWEEN" ? 0 : px(itemSpacing)
    const gapCross = counterAxisAlignContent === "SPACE_BETWEEN" ? 0 : px(counterAxisSpacing)
    if (gapPrimary === gapCross) {
      res["gap"] = gapPrimary
    } else {
      res["gap"] = gapPrimary + " " + gapCross
    }

    if (counterAxisAlignContent === "SPACE_BETWEEN") {
      res["align-items"] = numChildren === 1 ? "center" : "space-between"
    }
  }

  // Spacing: padding
  if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
    res.padding = fourSideValues(paddingTop, paddingRight, paddingBottom, paddingLeft).map(px).join(" ")
  }

  // AutoLayout Advanced

  // @TODO: First on Top
  if (itemReverseZIndex) {
    res["--itemReverseZIndex"] = "1"
  }

  return res
}

// Clip content
export const getCssStyleOverflow = (node: FrameNode) => {
  if (!node.children) {
    return
  }

  const res: Style = {}
  const hasChildren = node.children.filter((child) => child.visible).length > 0
  if (hasChildren && node.clipsContent) {
    res.overflow = "clip"
  }

  return res
}
