import {makeNumber, px, unitValue} from "../../../libs/utils"
import type {Style} from "../../shared"
import {makeColorFromFill} from "../Fill"

export const addStyleFont = (node: Partial<StyledTextSegment>) => {
  const res: Style = {}

  const {
    fontSize,
    lineHeight,
    letterSpacing,
    fontWeight,
    fontName,
    textDecoration,
    textCase,
    listOptions,
    indentation,
    hyperlink,
    fills,
    textStyleId,
    fillStyleId,
  } = node

  // font-size
  if (typeof fontSize === "number" && fontSize > 0) {
    res["font-size"] = px(fontSize)
  }

  // line-height
  if (lineHeight && lineHeight.unit !== "AUTO") {
    res["line-height"] = unitValue(lineHeight)
  }

  // letter-spacing
  if (letterSpacing && letterSpacing.value) {
    res["letter-spacing"] = makeNumber(letterSpacing.value / 100) + "em"
  }

  // font-family
  const fontFamily = fontName?.family
  if (fontFamily) {
    res["font-family"] = "'" + fontFamily + "'"
  }

  // font-weight
  if (fontWeight && fontWeight !== 400) {
    res["font-weight"] = fontWeight
  } else if (fontName?.style) {
    switch (fontName.style) {
      case "Medium":
        res["font-weight"] = 500
        break
      case "Semibold":
        res["font-weight"] = 600
        break
      case "Bold":
        res["font-weight"] = 700
        break
    }
  }

  // text-decoration
  switch (textDecoration) {
    case "UNDERLINE": {
      res["text-decoration"] = "underline"
      break
    }
    case "STRIKETHROUGH": {
      res["text-decoration"] = "line-through"
      break
    }
  }

  // textCase
  switch (textCase) {
    case "UPPER": {
      res["text-transform"] = "uppercase"
      break
    }
    case "LOWER": {
      res["text-transform"] = "lowercase"
      break
    }
    case "TITLE": {
      res["text-transform"] = "capitalize"
      break
    }
    case "SMALL_CAPS": {
      res["font-variant-caps"] = "small-caps"
      break
    }
    case "SMALL_CAPS_FORCED": {
      res["text-transform"] = "capitalize"
      res["font-variant-caps"] = "small-caps"
      break
    }
  }

  // @TODO: listOptions
  if (listOptions && listOptions.type) {
    switch (listOptions.type) {
      case "UNORDERED": {
        res["list-style"] = "disc"
        break
      }
      case "ORDERED": {
        res["list-style"] = "decimal"
        break
      }
    }
  }

  // @TODO: indentation
  if (indentation) {
    res["text-indent"] = px(indentation)
  }

  // color
  if (fills) {
    const colors = makeColorFromFill(fills)
    if (colors.startsWith("linear-gradient")) {
      res["background"] = colors
      res["-webkit-background-clip"] = "text"
      res["-webkit-text-fill-color"] = "transparent"
    } else if (colors) {
      res["color"] = colors
    }
  }

  return res
}
