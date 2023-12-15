import {
  fourSideValues,
  indent,
  isNumber,
  isValid,
  makeColor,
  makeGradientLinear,
  makeNumber,
  nl2br,
  percent,
  px,
  unitValue,
} from "../libs/utils"

type AddStyle = (prop: string, value: string | number) => void

type StyleBuilderFactory = (node: FrameNode | TextNode) => StyleBuilder

interface StyleBuilder {
  root?: string[]
  init: () => void
  addStyle: AddStyle
  generateHTML: (node: FrameNode, content: string, tag?: string) => string
  build: (code: string, self: StyleBuilder) => string
}

let createClassBuilder: StyleBuilderFactory

const createInlineStyleBuilder = (node: FrameNode | TextNode): StyleBuilder => {
  const cls = Object.create(null)

  function init() {}

  function addStyle(prop: string, value: string | number) {
    if (value) {
      cls[prop] = value
    }
  }

  function generateHTML(node: FrameNode | TextNode, content: string, tag = "div") {
    let code = ""
    const attrForPreview = `data-node-name="${node.name}" data-node-id="${node.id}"`
    const style = Object.entries(cls)
      .map(([prop, value]) => `${prop}:${value};`)
      .join(" ")

    if (tag === "span" && !content) return ""
    if (tag === "span" && style.length === 0) return content

    if (node.type !== "TEXT" && tag !== "span") code += `\n<!-- ${node.name} -->\n`
    if (tag === "img") {
      const width = Math.floor(node.width) || 0
      const height = Math.floor(node.height) || 0
      code += `<img style="${style}" width="${width}" height="${height}" src="" alt="" ${attrForPreview}/>`
    } else code += `<${tag} style="${style}" ${attrForPreview}>${content}</${tag}>`
    return code
  }

  function build(code: string) {
    return code
  }

  return {init, addStyle, generateHTML, build}
}

const addStyleWidth = (node: FrameNode, addStyle: AddStyle) => {
  const {constraints, layoutSizingHorizontal, absoluteRenderBounds, width: _width, minWidth, maxWidth} = node
  const {horizontal = "MIN"} = constraints ?? {}
  const width = node.type === "Text" ? absoluteRenderBounds?.width ?? _width : _width

  if (isAbsoluteLayout(node) && (horizontal === "STRETCH" || horizontal === "SCALE")) {
  } else if (layoutSizingHorizontal === "HUG") {
  } else if (layoutSizingHorizontal === "FIXED") {
    addStyle("width", px(width))
  } else if (layoutSizingHorizontal === "FILL") {
    if (node.parent.layoutMode === "HORIZONTAL") addStyle("flex", 1)
    else if (node.parent.layoutMode === "VERTICAL") addStyle("align-self", "stretch")
    else addStyle("width", "100%")
  }

  minWidth !== null && addStyle("min-width", px(minWidth))
  maxWidth !== null && addStyle("max-width", px(maxWidth))
}

const addStyleHeight = (node: FrameNode, addStyle: AddStyle) => {
  const {constraints, layoutSizingVertical, height, minHeight, maxHeight} = node
  const {vertical = "MIN"} = constraints ?? {}

  if (isAbsoluteLayout(node) && (vertical === "STRETCH" || vertical === "SCALE")) {
  } else if (layoutSizingVertical === "HUG") {
  } else if (layoutSizingVertical === "FIXED") {
    addStyle("height", px(height))
  } //
  else if (layoutSizingVertical === "FILL") {
    if (node.parent.layoutMode === "VERTICAL") addStyle("flex", 1)
    else if (node.parent.layoutMode === "HORIZONTAL") addStyle("align-self", "stretch")
    else addStyle("height", "100%")
  }

  minHeight !== null && addStyle("min-height", px(minHeight))
  maxHeight !== null && addStyle("max-height", px(maxHeight))
}

const addStyleSize = (node: FrameNode, addStyle: AddStyle) => {
  addStyleWidth(node, addStyle)
  addStyleHeight(node, addStyle)

  const {layoutSizingHorizontal, layoutSizingVertical} = node

  if (
    (layoutSizingHorizontal === "FIXED" && node.parent.layoutMode === "HORIZONTAL") ||
    (layoutSizingVertical === "FIXED" && node.parent.layoutMode === "VERTICAL")
  ) {
    addStyle("flex-shrink", "0")
  }
}

const isAbsoluteLayout = (node: FrameNode) => {
  const selection = figma.currentPage.selection
  if (node === selection[0]) {
    return false
  }

  if (node.layoutPositioning === "ABSOLUTE") {
    return true
  }

  if (!node.parent.layoutMode || node.parent.layoutMode === "NONE") {
    console.log("isAbsoluteLayout", 33)
    return true
  }

  return false
}

const addStylePosition = (node: FrameNode, addStyle: AddStyle) => {
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
    addStyle("position", "absolute")

    // 'CENTER' origin
    if (horizontal === "CENTER" && vertical === "CENTER") {
      addStyle("transform", "translate(-50%,-50%)")
    } else if (horizontal === "CENTER") {
      addStyle("transform", "translateX(-50%)")
    } else if (vertical === "CENTER") {
      addStyle("transform", "translateY(-50%)")
    }

    // x: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    switch (horizontal) {
      case "MIN": {
        addStyle("left", px(x))
        break
      }
      case "MAX": {
        addStyle("right", px(right))
        break
      }
      case "CENTER": {
        if (Math.abs(offsetXFromCenter) <= 1) addStyle("left", "50%")
        else addStyle("left", `calc(50% + ${px(offsetXFromCenter)})`)
        break
      }
      case "STRETCH": {
        addStyle("left", px(x))
        addStyle("right", px(right))
        break
      }
      case "SCALE": {
        addStyle("left", percent(percentLeft))
        addStyle("right", percent(percentRight))
      }
    }

    // y: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    switch (vertical) {
      case "MIN": {
        addStyle("top", px(y))
        break
      }
      case "MAX": {
        addStyle("bottom", px(bottom))
        break
      }
      case "CENTER": {
        if (Math.abs(offsetYFromCenter) <= 1) addStyle("top", "50%")
        else addStyle("top", `calc(50% + ${px(offsetYFromCenter)})`)
        break
      }
      case "STRETCH": {
        addStyle("top", px(y))
        addStyle("bottom", px(bottom))
        break
      }
      case "SCALE": {
        addStyle("top", percent(percentTop))
        addStyle("bottom", percent(percentBottom))
      }
    }
    return
  }

  if (node.findChild && node.findChild((child) => isAbsoluteLayout(child))) {
    addStyle("position", "relative")
  }
}

// Flex Layout
const addStyleFlexbox = (node: FrameNode, addStyle: AddStyle) => {
  const {
    layoutMode,
    layoutWrap,

    primaryAxisAlignItems,
    counterAxisAlignItems,

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

  if (layoutMode === "NONE" || !hasChildren) {
    return
  }

  // Flow: hbox / vbox / wrap
  addStyle("display", "flex")
  if (layoutMode === "HORIZONTAL" && layoutWrap === "WRAP") addStyle("flex-flow", "wrap")
  else if (layoutMode === "HORIZONTAL") addStyle("flex-flow", "row")
  else if (layoutMode === "VERTICAL") addStyle("flex-flow", "column")

  // Alignment: hbox / vbox / wrap
  if (counterAxisAlignItems === "MIN") addStyle("align-items", "flex-start")
  else if (counterAxisAlignItems === "CENTER") addStyle("align-items", "center")
  else if (counterAxisAlignItems === "BASELINE") addStyle("align-items", "baseline")
  else if (counterAxisAlignItems === "MAX") addStyle("align-items", "flex-end")

  if (primaryAxisAlignItems === "MIN") addStyle("justify-content", "flex-start")
  else if (primaryAxisAlignItems === "CENTER") addStyle("justify-content", "center")
  else if (primaryAxisAlignItems === "MAX") addStyle("justify-content", "flex-end")

  // Spacing: gap
  if (primaryAxisAlignItems === "SPACE_BETWEEN") {
    addStyle("justify-content", "space-between")
    if (numChildren === 1) {
      addStyle("justify-content", "center")
    }
  } //
  else if (hasMoreChildren && isNumber(itemSpacing) && itemSpacing !== 0) {
    addStyle("gap", px(itemSpacing))
  }

  // Spacing: padding
  if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
    addStyle("padding", fourSideValues(paddingTop, paddingRight, paddingBottom, paddingLeft).map(px).join(" "))
  }

  // AutoLayout Advanced

  // @TODO: First on Top
  if (itemReverseZIndex) {
    addStyle("--itemReverseZIndex", "1")
  }
}

const addStyleOverflow = (node: FrameNode, addStyle: AddStyle) => {
  if (!node.children) {
    return
  }

  const hasChildren = node.children.filter((child) => child.visible).length > 0
  if (hasChildren && node.clipsContent) {
    addStyle("overflow", "hidden")
  }
}

const makeColorFromFill = (fills: any[]) => {
  if (!Array.isArray(fills)) {
    return ""
  }

  fills = [...fills].reverse().filter((fill) => fill.visible)
  if (fills.length === 0) {
    return ""
  }

  // multiple backgrounds -> mix!
  return fills
    .map((fill, index, A) => {
      if (fill.type === "SOLID" && index === A.length - 1) {
        return makeColor(fill.color, fill.opacity)
      }
      if (fill.type === "SOLID") {
        return `linear-gradient(0deg,${makeColor(fill.color, fill.opacity)} 0%,${makeColor(fill.color, fill.opacity)} 100%)`
      }
      if (fill.type === "GRADIENT_LINEAR") {
        return makeGradientLinear(fill)
      }
      return ""
    })
    .filter(isValid)
    .join(",")
}

const addStyleBackground = (node: FrameNode, addStyle: AddStyle) => {
  const colors = makeColorFromFill(node.fills)
  if (colors) {
    addStyle("background", colors)
  }
}

const addStyleBorderRadius = (node: FrameNode | EllipseNode, addStyle: AddStyle) => {
  console.warn(">>>>>>>>>>>>>>>>>>>>>>>>")
  console.warn(node)

  if (node.type === "ELLIPSE") {
    addStyle("border-radius", "100%")
    return
  }

  const {topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius, cornerRadius} = node
  if (typeof cornerRadius === "number" && cornerRadius > 0) {
    addStyle("border-radius", px(cornerRadius))
  } else if (topLeftRadius > 0 || topRightRadius > 0 || bottomRightRadius > 0 || bottomLeftRadius > 0) {
    addStyle("border-radius", fourSideValues(topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius).map(px).join(" "))
  }
}

const addStyleBorder = (node: FrameNode, addStyle: AddStyle) => {
  if (!Array.isArray(node.strokes)) {
    return
  }

  const border = node.strokes.find((stroke) => stroke.visible)
  if (!border) return

  const {dashPattern, strokeWeight, strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight} = node

  const borderStyle = dashPattern?.length ? "dashed" : "solid"

  if (typeof strokeWeight === "number" && strokeWeight >= 0) {
    addStyle("border", `${px(strokeWeight)} ${borderStyle} ${makeColor(border.color, border.opacity)}`)
  } else {
    addStyle("border", `${borderStyle} ${makeColor(border.color, border.opacity)}`)
    addStyle("border-width", fourSideValues(strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight).map(px).join(" "))
  }
}

const addEffectClass = (node: FrameNode, addStyle: AddStyle) => {
  if (!Array.isArray(node.effects)) {
    return
  }

  node.effects
    .filter((e) => e.visible)
    .forEach((effect: Effect) => {
      switch (effect.type) {
        case "DROP_SHADOW":
        case "INNER_SHADOW": {
          const {color, offset, radius, spread} = effect
          if (spread) {
            const {x, y} = offset
            const inset = effect.type === "INNER_SHADOW" ? "inset" : ""
            addStyle("box-shadow", [inset, x, y, radius, spread, makeColor(color, color.a)].filter(isValid).map(px).join(" "))
          }
          break
        }

        case "LAYER_BLUR": {
          addStyle("filter", "blur(" + px(effect.radius / 2) + ")")
          break
        }

        case "BACKGROUND_BLUR": {
          addStyle("filter", "backdrop-blur(" + px(effect.radius / 2) + ")")
          break
        }
      }
    })
}

// @TODO: Group에도 opacity가 있다. display:contents를 활용하는 방법을 고민해보자.
const addOpacity = (node: FrameNode, addStyle: AddStyle) => {
  if (node.opacity === 1) {
    return
  }

  addStyle("opacity", makeNumber(node.opacity))
}

// ----------------------------------------------------------------
const generateChild = (children, callback) => {
  const contents = (children || []).map((params) => generateCode(params))
  const content = contents.filter(isValid).join("\n")
  return callback(content)
}

const generateComponentSet = (node: FrameNode) => {
  const children = generateChild(node.children, (content) => content)
  return `<section style="display:flex; flex-flow:column; gap:20px" data-node-id="${node.id}">\n${children}\n</section>`
}

const generateFrame = (node: FrameNode) => {
  const {addStyle, generateHTML} = createClassBuilder(node)

  // Position
  addStylePosition(node, addStyle)

  // Size(width x height): hug, fixed, fill
  addStyleSize(node, addStyle)

  // AutoLayout -> hbox / vbox / wrap
  addStyleFlexbox(node, addStyle)

  // Fill -> Backgrounds
  addStyleBackground(node, addStyle)

  // Stroke -> Border
  addStyleBorder(node, addStyle)

  // Border Radius
  addStyleBorderRadius(node, addStyle)

  // clip: Overflow
  addStyleOverflow(node, addStyle)

  // Effects: Style
  addEffectClass(node, addStyle)

  // Layer: opacity
  addOpacity(node, addStyle)

  return generateChild(node.children, (content) => generateHTML(node, indent(content)))
}

const addStyleFont = (node: Partial<StyledTextSegment>, addStyle: AddStyle) => {
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
    addStyle("font-size", px(fontSize))
  }

  // line-height
  if (lineHeight && lineHeight.unit !== "AUTO") {
    addStyle("line-height", unitValue(lineHeight))
  }

  // letter-spacing
  if (letterSpacing && letterSpacing.value) {
    addStyle("letter-spacing", makeNumber(letterSpacing.value / 100) + "em")
  }

  // font-family
  const fontFamily = fontName?.family
  if (fontFamily) {
    addStyle("font-family", "'" + fontFamily + "'")
  }

  // font-weight
  if (fontWeight && fontWeight !== 400) {
    addStyle("font-weight", fontWeight)
  }

  // text-decoration
  switch (textDecoration) {
    case "UNDERLINE": {
      addStyle("text-decoration", "underline")
      break
    }
    case "STRIKETHROUGH": {
      addStyle("text-decoration", "line-through")
      break
    }
  }

  // textCase
  switch (textCase) {
    case "UPPER": {
      addStyle("text-transform", "uppercase")
      break
    }
    case "LOWER": {
      addStyle("text-transform", "lowercase")
      break
    }
    case "TITLE": {
      addStyle("text-transform", "capitalize")
      break
    }
    case "SMALL_CAPS": {
      addStyle("font-variant-caps", "small-caps")
      break
    }
    case "SMALL_CAPS_FORCED": {
      addStyle("text-transform", "capitalize")
      addStyle("font-variant-caps", "small-caps")
      break
    }
  }

  // @TODO: listOptions
  // if (listOptions && listOptions.type) {
  //   switch (listOptions.type) {
  //     case "UNORDERED": {
  //       addStyle("list-style", "disc")
  //       break
  //     }
  //     case "ORDERED": {
  //       addStyle("list-style", "decimal")
  //       break
  //     }
  //   }
  // }

  // @TODO: indentation
  // if (indentation) {
  //   addStyle("text-indent", px(indentation))
  // }

  // color
  const colors = makeColorFromFill(fills)
  if (colors.startsWith("linear-gradient")) {
    addStyle("background", colors)
    addStyle("-webkit-background-clip", "text")
    addStyle("-webkit-text-fill-color", "transparent")
  } else if (colors) {
    addStyle("color", colors)
  }
}

const generateText = (node: TextNode) => {
  const {addStyle, generateHTML} = createClassBuilder(node)

  // Position
  addStylePosition(node, addStyle)

  const {textAutoResize, textAlignHorizontal, textAlignVertical, textTruncation, maxLines: _maxLines, opacity} = node

  const maxLines = _maxLines || (textTruncation === "ENDING" ? 1 : 0)

  // Width, Height with Auto Resize
  switch (textAutoResize) {
    case "WIDTH_AND_HEIGHT":
      break

    case "HEIGHT":
      addStyleWidth(node, addStyle)
      break

    case "NONE":
    case "TRUNCATE":
      addStyleWidth(node, addStyle)
      addStyleHeight(node, addStyle)
      break
  }

  // Text Segment
  // @TODO: 세그먼트에서 공통은 위로 보내고 다른 점만 span에 class로 넣기 기능
  const segments: StyledTextSegment[] = node.getStyledTextSegments([
    "fontSize",
    "fontName",
    "fontWeight",
    "textDecoration",
    "textCase",
    "lineHeight",
    "letterSpacing",
    "fills",
    "textStyleId",
    "fillStyleId",
    "listOptions",
    "indentation",
    "hyperlink",
  ])

  // @FIXME: get common segments style
  const commonFontStyle: Partial<StyledTextSegment> =
    segments.length > 0
      ? segments.reduce((prev, curr) => {
          const style: Partial<StyledTextSegment> = {}
          Object.keys(prev).forEach((key) => {
            if (JSON.stringify(prev[key]) === JSON.stringify(curr[key])) style[key] = prev[key]
          })
          return style
        })
      : {}

  addStyleFont(commonFontStyle, addStyle)

  // textAlign
  if (textAutoResize !== "WIDTH_AND_HEIGHT" || textTruncation !== "ENDING" || (textTruncation === "ENDING" && maxLines > 1)) {
    // textAlign Horizontal
    const HORIZONTAL_ALIGN = {
      LEFT: "left",
      CENTER: "center",
      RIGHT: "right",
      JUSTIFIED: "justify",
    }
    if (textAlignHorizontal !== "LEFT") {
      addStyle("text-align", HORIZONTAL_ALIGN[textAlignHorizontal])
    }
  }

  // textTruncation
  if (textTruncation === "ENDING" && maxLines >= 1) {
    !node.maxWidth && addStyle("max-width", "100%")
    addStyle("overflow", "hidden")
    addStyle("display", "-webkit-box")
    addStyle("-webkit-box-orient", "vertical")
    addStyle("-webkit-line-clamp", maxLines)
  } else if (textAutoResize === "WIDTH_AND_HEIGHT") {
    addStyle("white-space", "nowrap")
  }

  // textAlign Vertical
  if (textAutoResize === "NONE" || textAutoResize === "TRUNCATE") {
    if (textAlignVertical === "CENTER" || textAlignVertical === "BOTTOM") {
      if (textTruncation === "ENDING" && maxLines >= 1) {
        if (textAlignVertical === "CENTER") {
          addStyle("-webkit-box-pack", "center")
        }
        if (textAlignVertical === "BOTTOM") {
          addStyle("-webkit-box-pack", "end")
        }
      } else {
        addStyle("display", "flex")
        addStyle("flex-flow", "column")
        if (textAlignVertical === "CENTER") {
          addStyle("justify-content", "center")
        }
        if (textAlignVertical === "BOTTOM") {
          addStyle("justify-content", "flex-end")
        }
      }
    }
  }

  // opacity
  if (opacity !== 1) {
    addStyle("opacity", makeNumber(opacity))
  }

  // textContents
  const textContents =
    segments.length === 1
      ? nl2br(node.characters)
      : segments
          .map((segment) => {
            const {addStyle, generateHTML} = createClassBuilder(node)

            const s: Partial<StyledTextSegment> = {}
            Object.entries(segment).forEach(([key, value]) => {
              if (JSON.stringify(value) !== JSON.stringify(commonFontStyle[key])) {
                s[key] = value
              }
            })
            addStyleFont(s, addStyle)

            return generateHTML(node, nl2br(segment.characters), "span")
          })
          .join("")

  return generateHTML(node, textContents)
}

const isAsset2 = (node: SceneNode) => node.isAsset || (node.type === "GROUP" && node.children.every(isAsset2))

const isAsset = (node: SceneNode) => {
  // @TODO: Vertor이지만 LINE이거나 ELLIPSE일 경우는 그릴 수 있어서 Asset가 아니어야 한다!
  if (Array.isArray(node.fills) && node.fills.find((f) => f.visible && f.type === "IMAGE")) return true
  if (node.type === "ELLIPSE") return false
  if (isAsset2(node)) return true
  if (node.findChild && node.findChild((child) => child.isMask)) return true
  if (node.exportSettings && node.exportSettings.find((e) => e.format === "SVG" || e.format === "PNG")) {
    if (node.parent.type === "SECTION" || node.parent.type === "PAGE") {
      return false
    }
    return true
  }
  return false
}

const generateAsset = (node: SceneNode) => {
  let code = ""

  const {addStyle, generateHTML} = createClassBuilder(node)

  try {
    if (isAbsoluteLayout(node)) {
      addStylePosition(node, addStyle)
    }

    const isVector = node.exportSettings.length
      ? node.exportSettings.find((es) => es.format === "SVG")
      : !(node.findChild && node.findChild((child) => child.fills && child.fills.find((f) => f.visible && f.type === "IMAGE")))

    if (figma.mode !== "codegen") {
      if (isVector) {
        addStyleWidth(node, addStyle)
        addStyleHeight(node, addStyle)
        if (node.type === "ELLIPSE") {
          addStyle("border-radius", "100%")
        }

        node
          .exportAsync({format: "SVG_STRING", useAbsoluteBounds: true})
          .then((content) => {
            const inlineSVG = content.replace(/pattern\d/g, (a) => a + node.id.replace(/[^a-zA-z0-9]/g, "-")).replace(/\n/g, "")
            figma.ui.postMessage({type: "assets", id: node.id, name: node.name, svg: inlineSVG})
          })
          .catch((e) => {
            console.warn("export failed: ", e)
          })
      } else {
        node
          .exportAsync({format: "PNG", useAbsoluteBounds: true, constraint: {type: "SCALE", value: 2}})
          .then((content) => {
            figma.ui.postMessage({type: "assets", id: node.id, name: node.name, png: content})
          })
          .catch((e) => {
            console.warn("export failed: ", e)
          })
      }
    }

    code = generateHTML(node, code, isVector ? "picture" : "img")
  } catch (e) {
    console.error(e)
    console.error("asset error node:", node)
  }

  return code
}

const generateCode = (node: SceneNode) => {
  if (!node.visible) return ""
  else if (isAsset(node)) return generateAsset(node)
  else if (node.type === "TEXT") return generateText(node)
  return generateFrame(node)
}

export const getGeneratedCode = (node: FrameNode, builderFactory = createInlineStyleBuilder) => {
  createClassBuilder = builderFactory
  const builder = createClassBuilder(node)
  builder.init?.()
  const code = generateCode(node).trim()
  return builder.build(code, builder)
}
