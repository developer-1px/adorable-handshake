// AutoLayout
import type {createFigmaDSLStyleBuilder} from "../createFigmaDSLStyleBuilder"
import {fourSideValues} from "../../../../libs/utils"

export function addLayoutStyles(node: FrameNode, styles: ReturnType<typeof createFigmaDSLStyleBuilder>) {
  const PRIMARY_ALIGN = {
    NONE: {MIN: "", CENTER: "center", MAX: "right", BASELINE: "baseline", SPACE_BETWEEN: ""},
    HORIZONTAL: {MIN: "", CENTER: "center", MAX: "right", BASELINE: "baseline", SPACE_BETWEEN: ""},
    VERTICAL: {MIN: "", CENTER: "middle", MAX: "bottom", BASELINE: "baseline", SPACE_BETWEEN: ""},
  } as const

  const COUNTER_ALIGN = {
    NONE: {MIN: "top", CENTER: "center", MAX: "bottom", BASELINE: "baseline", SPACE_BETWEEN: ""},
    HORIZONTAL: {MIN: "top", CENTER: "middle", MAX: "bottom", BASELINE: "baseline", SPACE_BETWEEN: ""},
    VERTICAL: {MIN: "left", CENTER: "center", MAX: "right", BASELINE: "baseline", SPACE_BETWEEN: ""},
  } as const

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

  // AutoLayout: pack = center + middle
  if (primaryAxisAlignItems === "CENTER" && counterAxisAlignItems === "CENTER") {
    if (layoutMode === "HORIZONTAL" && layoutWrap === "WRAP") {
      styles.wrap("pack")
    } else if (layoutMode === "HORIZONTAL") {
      styles.hbox("pack")
    } else if (layoutMode === "VERTICAL") {
      styles.vbox("pack")
    }
  }

  // AutoLayout
  else if (layoutMode === "HORIZONTAL" && layoutWrap === "WRAP") {
    styles.wrap(COUNTER_ALIGN[layoutMode][counterAxisAlignItems], PRIMARY_ALIGN[layoutMode][primaryAxisAlignItems])
  } else if (layoutMode === "HORIZONTAL") {
    styles.hbox(COUNTER_ALIGN[layoutMode][counterAxisAlignItems], PRIMARY_ALIGN[layoutMode][primaryAxisAlignItems])
  } else if (layoutMode === "VERTICAL") {
    styles.vbox(COUNTER_ALIGN[layoutMode][counterAxisAlignItems], PRIMARY_ALIGN[layoutMode][primaryAxisAlignItems])
  }

  // Spacing: gap
  if (primaryAxisAlignItems === "SPACE_BETWEEN" || itemSpacing > 0) {
    const gapPrimary = primaryAxisAlignItems === "SPACE_BETWEEN" ? "auto" : itemSpacing
    styles.gap(gapPrimary)
  }

  // const gapCross = counterAxisAlignContent === "SPACE_BETWEEN" ? "auto" : counterAxisSpacing
  // if (gapPrimary === gapCross) {
  //   styles.gap(gapPrimary)
  // } else {
  //   styles.gap(gapPrimary, gapCross)
  // }

  // Spacing: padding
  if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
    styles.p(...fourSideValues(paddingTop, paddingRight, paddingBottom, paddingLeft))
  }
}
