import {fourSideValues, indent, isNumber, isValid, makeColor, makeGradientLinear, makeNumber, nl2br, percent, px, unitValue} from "../libs/utils"

type AddClass = (prop:string, value:string|number) => void

type StyleBuilderFactory = (node:FrameNode|TextNode) => StyleBuilder


interface StyleBuilder {
  root?:string[]
  init:() => void
  addClass:AddClass
  generateHTML:(node:FrameNode, content:string, tag?:string) => string
}

let createClassBuilder:StyleBuilderFactory

const createInlineStyleBuilder = (node:FrameNode|TextNode, cls:string[] = []) => {

  function init() {}

  function addClass(prop:string, value:string|number) {
    cls.push(`${prop}:${value};`)
  }

  function generateHTML(node:FrameNode|TextNode, content:string, tag = "div") {
    if (tag === "span" && !content) return ""
    if (tag === "span" && cls.length === 0) return content
    return `<${tag} style="${cls.join(" ")}" data-node-name="${node.name}" data-node-id="${node.id}">${content}</${tag}>`
  }

  return {init, addClass, generateHTML}
}

const addClassWidth = (node:FrameNode, addClass:AddClass) => {
  const {
    constraints,
    layoutSizingHorizontal,
    absoluteRenderBounds,
    width: _width,
    minWidth,
    maxWidth,
  } = node
  const {horizontal = "MIN"} = constraints ?? {}
  const width = node.type === "Text" ? absoluteRenderBounds?.width ?? _width : _width

  if (isAbsoluteLayout(node) && (horizontal === "STRETCH" || horizontal === "SCALE")) {}
  else if (layoutSizingHorizontal === "HUG") {}
  else if (layoutSizingHorizontal === "FIXED") {addClass("width", px(width))}
  else if (layoutSizingHorizontal === "FILL") {
    if (node.parent.layoutMode === "HORIZONTAL") addClass("flex", 1)
    else if (node.parent.layoutMode === "VERTICAL") addClass("align-self", "stretch")
    else addClass("width", "100%")
  }

  minWidth !== null && addClass("min-width", px(minWidth))
  maxWidth !== null && addClass("max-width", px(maxWidth))
}

const addClassHeight = (node:FrameNode, addClass:AddClass) => {
  const {
    constraints,
    layoutSizingVertical,
    height,
    minHeight,
    maxHeight
  } = node
  const {vertical = "MIN"} = constraints ?? {}

  if (isAbsoluteLayout(node) && (vertical === "STRETCH" || vertical === "SCALE")) {}
  else if (layoutSizingVertical === "HUG") {}
  else if (layoutSizingVertical === "FIXED") {addClass("height", px(height))}
  else if (layoutSizingVertical === "FILL") {
    if (node.parent.layoutMode === "VERTICAL") addClass("flex", 1)
    else if (node.parent.layoutMode === "HORIZONTAL") addClass("align-self", "stretch")
    else addClass("height", "100%")
  }

  minHeight !== null && addClass("min-height", px(minHeight))
  maxHeight !== null && addClass("max-height", px(maxHeight))
}

const addClassSize = (node:FrameNode, addClass:AddClass) => {
  addClassWidth(node, addClass)
  addClassHeight(node, addClass)

  const {
    layoutSizingHorizontal,
    layoutSizingVertical,
  } = node

  if ((layoutSizingHorizontal === "FIXED" && node.parent.layoutMode === "HORIZONTAL")
    || (layoutSizingVertical === "FIXED" && node.parent.layoutMode === "VERTICAL")) {
    addClass("flex-shrink", "0")
  }
}

const isAbsoluteLayout = (node:FrameNode) => {
  const selection = figma.currentPage.selection
  if (node === selection[0]) {
    return false
  }

  if (node.layoutPositioning === "ABSOLUTE") {
    return true
  }

  if (!node.parent.layoutMode || node.parent.layoutMode === "NONE") {
    return true
  }

  return false
}

const addClassPosition = (node:FrameNode, addClass:AddClass) => {
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
    addClass("position", "absolute")

    // 'CENTER' origin
    if (horizontal === "CENTER" && vertical === "CENTER") {
      addClass("transform", "translate(-50%,-50%)")
    }
    else if (horizontal === "CENTER") {
      addClass("transform", "translateX(-50%)")
    }
    else if (vertical === "CENTER") {
      addClass("transform", "translateY(-50%)")
    }

    // x: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    switch (horizontal) {
      case "MIN": {
        addClass("left", px(x));
        break
      }
      case "MAX": {
        addClass("right", px(right));
        break
      }
      case "CENTER": {
        if (Math.abs(offsetXFromCenter) <= 1) addClass("left", "50%")
        else addClass("left", `calc(50% + ${px(offsetXFromCenter)})`)
        break
      }
      case "STRETCH": {
        addClass("left", px(x))
        addClass("right", px(right))
        break
      }
      case "SCALE": {
        addClass("left", percent(percentLeft))
        addClass("right", percent(percentRight))
      }
    }

    // y: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    switch (vertical) {
      case "MIN": {
        addClass("top", px(y));
        break
      }
      case "MAX": {
        addClass("bottom", px(bottom));
        break
      }
      case "CENTER": {
        if (Math.abs(offsetYFromCenter) <= 1) addClass("top", "50%")
        else addClass("top", `calc(50% + ${px(offsetYFromCenter)})`)
        break
      }
      case "STRETCH": {
        addClass("top", px(y))
        addClass("bottom", px(bottom))
        break
      }
      case "SCALE": {
        addClass("top", percent(percentTop))
        addClass("bottom", percent(percentBottom))
      }
    }
    return
  }

  if (node.findChild && node.findChild(child => isAbsoluteLayout(child))) {
    addClass("position", "relative")
  }
}


// Flex Layout
const addClassFlexbox = (node:FrameNode, addClass:AddClass) => {

  const {
    layoutMode,
    layoutWrap,

    primaryAxisAlignItems,
    counterAxisAlignItems,

    itemSpacing,
    paddingTop, paddingRight, paddingBottom, paddingLeft,

    itemReverseZIndex,
  } = node

  const numChildren = node.children?.filter(child => child.visible).length
  const hasChildren = numChildren > 0
  const hasMoreChildren = numChildren > 1

  if (layoutMode === "NONE" || !hasChildren) {
    return
  }

  // Flow: hbox / vbox / wrap
  addClass("display", "flex")
  if (layoutMode === "HORIZONTAL" && layoutWrap === "WRAP") addClass("flex-flow", "wrap")
  else if (layoutMode === "HORIZONTAL") addClass("flex-flow", "row")
  else if (layoutMode === "VERTICAL") addClass("flex-flow", "column")

  // Alignment: hbox / vbox / wrap
  if (counterAxisAlignItems === "MIN") addClass("align-items", "flex-start")
  else if (counterAxisAlignItems === "CENTER") addClass("align-items", "center")
  else if (counterAxisAlignItems === "BASELINE") addClass("align-items", "baseline")
  else if (counterAxisAlignItems === "MAX") addClass("align-items", "flex-end")

  if (primaryAxisAlignItems === "MIN") addClass("justify-content", "flex-start")
  else if (primaryAxisAlignItems === "CENTER") addClass("justify-content", "center")
  else if (primaryAxisAlignItems === "MAX") addClass("justify-content", "flex-end")

  // Spacing: gap
  if (primaryAxisAlignItems === "SPACE_BETWEEN") {
    addClass("justify-content", "space-between")
    if (numChildren === 1) {
      addClass("justify-content", "center")
    }
  }
  else if (hasMoreChildren && isNumber(itemSpacing) && itemSpacing !== 0) {
    addClass("gap", px(itemSpacing))
  }

  // Spacing: padding
  if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
    addClass("padding", fourSideValues(paddingTop, paddingRight, paddingBottom, paddingLeft).map(px).join(" "))
  }

  // AutoLayout Advanced

  // @TODO: First on Top
  if (itemReverseZIndex) {
    addClass("--itemReverseZIndex", "1")
  }
}

const addClassOverflow = (node:FrameNode, addClass:AddClass) => {
  if (!node.children) {
    return
  }

  const hasChildren = node.children.filter(child => child.visible).length > 0
  if (hasChildren && node.clipsContent) {
    addClass("overflow", "hidden")
  }
}

const addClassBackground = (node:FrameNode, addClass:AddClass) => {
  if (!Array.isArray(node.fills)) {
    return
  }

  const fills = [...node.fills].reverse().filter(fill => fill.visible)
  if (fills.length === 0) {
    return
  }

  // @TODO: Image

  // multiple backgrounds -> mix!
  const gradients = fills.map((fill, index, A) => {
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
  }).filter(isValid).join(",")

  addClass("background", gradients)
}


const addClassBorderRadius = (node:FrameNode|EllipseNode, addClass:AddClass) => {
  if (node.type === "ELLIPSE") {
    addClass("border-radius", "100%")
    return
  }

  const {topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius} = node
  if (topLeftRadius > 0 || topRightRadius > 0 || bottomRightRadius > 0 || bottomLeftRadius > 0) {
    addClass("border-radius", fourSideValues(topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius).map(px).join(" "))
  }
}

const addClassBorder = (node:FrameNode, addClass:AddClass) => {
  if (!Array.isArray(node.strokes)) {
    return
  }

  const border = node.strokes.find(stroke => stroke.visible)
  if (!border) return

  const {
    dashPattern,
    strokeWeight,
    strokeTopWeight,
    strokeRightWeight,
    strokeBottomWeight,
    strokeLeftWeight
  } = node

  const borderStyle = dashPattern?.length ? "dashed" : "solid"

  if (typeof strokeWeight === "number" && strokeWeight >= 0) {
    addClass("border", `${px(strokeWeight)} ${borderStyle} ${makeColor(border.color, border.opacity)}`)
  }
  else {
    addClass("border", `${borderStyle} ${makeColor(border.color, border.opacity)}`)
    addClass("border-width", fourSideValues(strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight).map(px).join(" "))
  }
}

const addEffectClass = (node:FrameNode, addClass:AddClass) => {
  if (!Array.isArray(node.effects)) {
    return
  }

  node.effects.filter(e => e.visible).forEach((effect:Effect) => {
    switch (effect.type) {
      case "DROP_SHADOW":
      case "INNER_SHADOW": {
        const {color, offset, radius, spread} = effect
        if (spread) {
          const {x, y} = offset
          const inset = effect.type === "INNER_SHADOW" ? "inset" : ""
          addClass("box-shadow", [inset, x, y, radius, spread, makeColor(color, color.a)].filter(isValid).map(px).join(" "))
        }
        break
      }

      case "LAYER_BLUR": {
        addClass("filter", "blur(" + px(effect.radius / 2) + ")")
        break
      }

      case "BACKGROUND_BLUR": {
        addClass("filter", "backdrop-blur(" + px(effect.radius / 2) + ")")
        break
      }
    }
  })
}

// @TODO: Group에도 opacity가 있다. display:contents를 활용하는 방법을 고민해보자.
const addOpacity = (node:FrameNode, addClass:AddClass) => {
  if (node.opacity === 1) {
    return
  }

  addClass("opacity", makeNumber(node.opacity))
}

// ----------------------------------------------------------------
const generateChild = (children, callback) => {
  const contents = (children || []).map(params => generateCode(params))
  const content = contents.filter(isValid).join("\n")
  return callback(content)
}

const generateComponentSet = (node:FrameNode) => {
  const children = generateChild(node.children, content => content)
  return `<section style="display:flex; flex-flow:column; gap:20px" data-node-id="${node.id}">\n${children}\n</section>`
}

const generateFrame = (node:FrameNode) => {

  const {addClass, generateHTML} = createClassBuilder(node)

  // Position
  addClassPosition(node, addClass)

  // Size(width x height): hug, fixed, fill
  addClassSize(node, addClass)

  // AutoLayout -> hbox / vbox / wrap
  addClassFlexbox(node, addClass)

  // Fill -> Backgrounds
  addClassBackground(node, addClass)

  // Stroke -> Border
  addClassBorder(node, addClass)

  // Border Radius
  addClassBorderRadius(node, addClass)

  // clip: Overflow
  addClassOverflow(node, addClass)

  // Effects: Style
  addEffectClass(node, addClass)

  // Layer: opacity
  addOpacity(node, addClass)

  return generateChild(node.children, content => generateHTML(node, indent(content)))
}

const addClassFont = (node:Partial<StyledTextSegment>, addClass:AddClass) => {

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
    addClass("font-size", px(fontSize))
  }

  // line-height
  if (lineHeight && lineHeight.unit !== "AUTO") {
    addClass("line-height", unitValue(lineHeight))
  }

  // letter-spacing
  if (letterSpacing && letterSpacing.value) {
    addClass("letter-spacing", makeNumber(letterSpacing.value / 100) + "em")
  }

  // font-weight
  if (fontWeight && fontWeight !== 400) {
    addClass("font-weight", fontWeight)
  }

  // font-family
  const fontFamily = fontName?.family
  if (fontFamily) {
    addClass("font-family", "'" + fontFamily + "'")
  }

  // text-decoration
  switch (textDecoration) {
    case "UNDERLINE": {
      addClass("text-decoration", "underline")
      break
    }
    case "STRIKETHROUGH": {
      addClass("text-decoration", "line-through")
      break
    }
  }

  // textCase
  switch (textCase) {
    case "UPPER": {
      addClass("text-transform", "uppercase");
      break
    }
    case "LOWER": {
      addClass("text-transform", "lowercase")
      break
    }
    case "TITLE": {
      addClass("text-transform", "capitalize")
      break
    }
    case "SMALL_CAPS": {
      addClass("font-variant-caps", "small-caps")
      break
    }
    case "SMALL_CAPS_FORCED": {
      addClass("text-transform", "capitalize")
      addClass("font-variant-caps", "small-caps")
      break
    }
  }

  // @TODO: listOptions
  // if (listOptions && listOptions.type) {
  //   switch (listOptions.type) {
  //     case "UNORDERED": {
  //       addClass("list-style", "disc")
  //       break
  //     }
  //     case "ORDERED": {
  //       addClass("list-style", "decimal")
  //       break
  //     }
  //   }
  // }

  // @TODO: indentation
  // if (indentation) {
  //   addClass("text-indent", px(indentation))
  // }

  // color
  const fill = fills?.find(fill => fill?.visible && fill?.type === "SOLID")
  if (fill) {
    addClass("color", makeColor(fill.color, fill.opacity))
  }
}

const generateText = (node:TextNode) => {
  const {addClass, generateHTML} = createClassBuilder(node)

  // Position
  addClassPosition(node, addClass)

  const {
    textAutoResize,
    textAlignHorizontal,
    textAlignVertical,
    textTruncation,
    maxLines: _maxLines,
    opacity
  } = node

  const maxLines = _maxLines || (textTruncation === "ENDING" ? 1 : 0)

  // Width, Height with Auto Resize
  switch (textAutoResize) {
    case "WIDTH_AND_HEIGHT":
      break

    case "HEIGHT":
      addClassWidth(node, addClass)
      break

    case "NONE":
      addClassWidth(node, addClass)
      addClassHeight(node, addClass)
      break
  }

  // Text Segment
  // @TODO: 세그먼트에서 공통은 위로 보내고 다른 점만 span에 class로 넣기 기능
  const segments:StyledTextSegment[] = node.getStyledTextSegments([
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
  const commonFontStyle:Partial<StyledTextSegment> = segments.length > 0 ? segments.reduce((prev, curr) => {
    const style:Partial<StyledTextSegment> = {}
    Object.keys(prev).forEach(key => {
      if (JSON.stringify(prev[key]) === JSON.stringify(curr[key])) style[key] = prev[key]
    })
    return style
  }) : {}

  addClassFont(commonFontStyle, addClass)

  // textAlign
  if (textAutoResize !== "WIDTH_AND_HEIGHT" || (textTruncation !== "ENDING" || (textTruncation === "ENDING" && maxLines > 1))) {

    // textAlign Horizontal
    const HORIZONTAL_ALIGN = {
      "LEFT": "left",
      "CENTER": "center",
      "RIGHT": "right",
      "JUSTIFIED": "justify"
    }
    if (textAlignHorizontal !== "LEFT") {
      addClass("text-align", HORIZONTAL_ALIGN[textAlignHorizontal])
    }

    // textAlign Vertical
    if (textAutoResize === "NONE") {
      if (textAlignVertical === "CENTER" || textAlignVertical === "BOTTOM") {
        addClass("display", "flex")
        addClass("flex-flow", "column")
        if (textAlignVertical === "CENTER") {
          addClass("justify-content", "center")
        }
        if (textAlignVertical === "BOTTOM") {
          addClass("justify-content", "flex-end")
        }
      }
    }
  }

  // textTruncation
  if (textTruncation === "ENDING" && maxLines >= 1) {
    !node.maxWidth && addClass("max-width", "100%")
    addClass("overflow", "hidden")
    addClass("display", "-webkit-box")
    addClass("-webkit-box-orient", "vertical")
    addClass("-webkit-line-clamp", maxLines)
  }
  else if (textAutoResize === "WIDTH_AND_HEIGHT") {
    addClass("white-space", "nowrap")
  }

  // opacity
  if (opacity !== 1) {
    addClass("opacity", makeNumber(opacity))
  }

  // textContents
  const textContents = segments.length === 1 ? nl2br(node.characters) : segments.map(segment => {
    const {addClass, generateHTML} = createClassBuilder(node)

    const s:Partial<StyledTextSegment> = {}
    Object.entries(segment).forEach(([key, value]) => {
      if (key in commonFontStyle && value !== JSON.stringify(commonFontStyle[key])) {
        s[key] = value
      }
    })
    addClassFont(s, addClass)

    return generateHTML(node, nl2br(segment.characters), "span")
  }).join("")

  return generateHTML(node, textContents)
}

const isAsset = (node:FrameNode) => {
  // @TODO: Vertor이지만 LINE이거나 ELLIPSE일 경우는 그릴 수 있어서 Asset가 아니어야 한다!
  if (node.isAsset) return true
  if (node.findChild && node.findChild(child => child.isMask)) return true
  if (node.exportSettings && node.exportSettings.length) {
    if (node.parent.type === "SECTION" || node.parent.type === "PAGE") {
      return false
    }
    return true
  }
  return false
}

const generateAsset = (node:SceneNode) => {
  let code = ""

  const {addClass, generateHTML} = createClassBuilder(node)

  try {
    if (isAbsoluteLayout(node)) {
      addClassPosition(node, addClass)
    }

    addClassWidth(node, addClass)
    addClassHeight(node, addClass)
    if (node.type === "ELLIPSE") {
      addClass("border-radius", "100%")
    }

    if (figma.mode !== "codegen") {
      node.exportAsync({format: "SVG_STRING", useAbsoluteBounds: true})
        .then((content) => {
          const inlineSVG = content.replace(/pattern\d/g, (a) => a + node.id.replace(/[^a-zA-z0-9]/g, "-")).replace(/\n/g, "")
          figma.ui.postMessage({type: "assets", id: node.id, svg: inlineSVG})
        })
        .catch(e => {
          console.warn("export failed: ", e)
        })
    }
    code = generateHTML(node, code, "figure")
  } catch (e) {
    console.error(e)
    console.error("asset error node:", node)
  }

  return code
}

const generateCode = (node:SceneNode) => {
  if (!node.visible) return ""

  if (isAsset(node)) return generateAsset(node)
  else if (node.type === "COMPONENT_SET") return generateComponentSet(node)
  else if (node.type === "TEXT") return generateText(node)
  return generateFrame(node)
}

export const getGeneratedCode = (node:FrameNode, builder = createInlineStyleBuilder) => {
  createClassBuilder = builder
  const {init} = createClassBuilder(node)
  init()
  return generateCode(node)
}