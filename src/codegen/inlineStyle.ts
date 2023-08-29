import {fourSideValues, indent, isNumber, isValid, makeColor, makeGradientLinear, makeInt, makeNumber, nl2br, percent, px, unitValue} from "../libs/utils"

type AddClass = (prop, value?) => void

// @TODO: TBD
const isReact = false
const CLASS_NAME = isReact ? "style" : "style"

const createClassBuilder = ((root = [], styledMap1 = {}, styledMap2 = {}) => (cls:string[] = []) => {

  function init() {
    root.length = 0
    styledMap1 = {}
    styledMap2 = {}
  }

  function addClass(prop, value?) {
    if (arguments.length === 2 && (value === null || value === undefined)) return
    if (prop === "opacity" || prop === "z-index" || prop === "flex" || prop === "flex-shrink" || prop === "font-weight") cls.push(`${prop}:${value};`)
    else cls.push(`${prop}:${px(value)};`)
  }

  function generateHTML(node, content, tag = "div") {
    if (tag === "span" && !content) return ""
    if (tag === "span" && cls.length === 0) return content
    return `<${tag} ${CLASS_NAME}="${cls.join(" ")}" data-node-name="${node.name}" data-node-id="${node.id}">${content}</${tag}>`
  }

  return {root, init, addClass, generateHTML}
})()

const addClassWidth = (node:FrameNode, addClass:AddClass) => {
  const {layoutSizingHorizontal, width, minWidth, maxWidth} = node

  if (isAbsoluteLayout(node) && (node.constraints?.horizontal === "STRETCH" || node.constraints?.horizontal === "SCALE")) {}
  else if (layoutSizingHorizontal === "HUG") {}
  else if (layoutSizingHorizontal === "FIXED") {
    if (node.parent.layoutMode === "HORIZONTAL") {
      addClass("flex-shrink", "0")
    }
    addClass("width", makeInt(width))
  }
  else if (layoutSizingHorizontal === "FILL") {
    if (node.parent.layoutMode === "HORIZONTAL") addClass("flex", "1")
    else if (node.parent.layoutMode === "VERTICAL") addClass("align-self", "stretch")
    else addClass("width", "100%")
  }

  minWidth !== null && addClass("min-width", makeInt(minWidth))
  maxWidth !== null && addClass("max-width", makeInt(maxWidth))
}

const addClassHeight = (node:FrameNode, addClass:AddClass) => {
  const {layoutSizingVertical, height, minHeight, maxHeight} = node

  if (isAbsoluteLayout(node) && (node.constraints?.vertical === "STRETCH" || node.constraints?.vertical === "SCALE")) {}
  else if (layoutSizingVertical === "HUG") {}
  else if (layoutSizingVertical === "FIXED") {
    if (node.parent.layoutMode === "VERTICAL") {
      addClass("flex-shrink", "0")
    }
    addClass("height", makeInt(height))
  }
  else if (layoutSizingVertical === "FILL") {
    if (node.parent.layoutMode === "VERTICAL") addClass("flex", "1")
    else if (node.parent.layoutMode === "HORIZONTAL") addClass("align-self", "stretch")
    else addClass("height", "100%")
  }

  minHeight !== null && addClass("min-height", makeInt(minHeight))
  minHeight !== null && addClass("max-height", makeInt(minHeight))
}

const addClassBorderRadius = (node:FrameNode|EllipseNode, addClass:AddClass) => {
  if (node.type === "ELLIPSE") addClass("border-radius", "100%")
  else {
    let {topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius} = node
    topLeftRadius = Math.round(topLeftRadius)
    topRightRadius = Math.round(topRightRadius)
    bottomRightRadius = Math.round(bottomRightRadius)
    bottomLeftRadius = Math.round(bottomLeftRadius)

    if (topLeftRadius > 0 || topRightRadius > 0 || bottomRightRadius > 0 || bottomLeftRadius > 0) {
      addClass("border-radius", fourSideValues(topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius).map(px).join(" "))
    }
  }
}

const addClassBorder = (node, addClass:AddClass) => {
  let {strokes, strokeAlign, dashPattern, strokeWeight, strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight} = node
  if (!strokes) return
  const border = strokes.find(stroke => stroke.visible)
  if (!border) return

  const borderStyle = dashPattern?.length ? "dashed" : "solid"

  if (typeof strokeWeight === "number" && strokeWeight >= 0) {
    strokeWeight = Math.round(strokeWeight)
    addClass("border", `${px(strokeWeight)} ${borderStyle} ${makeColor(border.color, border.opacity)}`)
  }
  else {
    strokeTopWeight = Math.round(strokeTopWeight)
    strokeRightWeight = Math.round(strokeRightWeight)
    strokeBottomWeight = Math.round(strokeBottomWeight)
    strokeLeftWeight = Math.round(strokeLeftWeight)

    addClass("border", `${borderStyle} ${makeColor(border.color, border.opacity)}`)
    addClass("border-width", fourSideValues(strokeTopWeight, strokeRightWeight, strokeBottomWeight, strokeLeftWeight).map(px).join(" "))
  }
}

const addEffectClass = (node:FrameNode, addClass:AddClass) => {
  // if (node.effectStyleId) {
  //   const style = figma.getStyleById(node.effectStyleId)
  //   addClass(style.name.toLowerCase())
  // }

  node.effects.filter(e => e.visible).forEach(effect => {
    switch (effect.type) {
      case "DROP_SHADOW":
      case "INNER_SHADOW": {
        const {color, offset, radius, spread} = effect
        const {x, y} = offset
        const inset = effect.type === "INNER_SHADOW" ? "inset" : ""
        addClass("box-shadow", [inset, x, y, radius, spread, makeColor(color, color.a)].filter(isValid).map(px).join(" "))
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

const isAbsoluteLayout = (node) => {
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
    const x = Math.floor(rect2.x - rect1.x)
    const y = Math.floor(rect2.y - rect1.y)

    addClass("position", "absolute")
    const {horizontal = "MIN", vertical = "MIN"} = node.constraints ?? {}
    if (horizontal === "MIN" && vertical === "MIN" && x === 0 && y === 0) {
      return
    }

    const right = Math.floor(rect1.x + rect1.width - rect2.x - rect2.width)
    const bottom = Math.floor(rect1.y + rect1.height - rect2.y - rect2.height)

    const offsetXFromCenter = Math.floor(rect2.x - rect1.x - (rect1.width / 2 - rect2.width / 2))
    const offsetYFromCenter = Math.floor(rect2.y - rect1.y - (rect1.height / 2 - rect2.height / 2))

    const percentLeft = Math.round((x / rect1.width) * 100)
    const percentRight = Math.round((right / rect1.width) * 100)

    const percentTop = Math.round((y / rect1.height) * 100)
    const percentBottom = Math.round((bottom / rect1.height) * 100)

    // 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'
    switch (horizontal) {
      case "MIN": {
        addClass("left", x);
        break
      }
      case "MAX": {
        addClass("right", right);
        break
      }
      case "CENTER": {
        if (Math.abs(offsetXFromCenter) <= 1) addClass("left", "50%")
        else addClass("left", `calc(50% + ${px(offsetXFromCenter)})`)
        if (vertical !== "CENTER") {
          addClass("transform", "translateX(-50%)")
        }
        break
      }
      case "STRETCH": {
        addClass("left", x)
        addClass("right", right)
        break
      }
      case "SCALE": {
        addClass("left", percent(percentLeft))
        addClass("right", percent(percentRight))
      }
    }

    switch (vertical) {
      case "MIN": {
        addClass("top", y);
        break
      }
      case "MAX": {
        addClass("bottom", bottom);
        break
      }
      case "CENTER": {
        if (Math.abs(offsetYFromCenter) <= 1) addClass("top", "50%")
        else addClass("top", `calc(50% + ${px(offsetYFromCenter)})`)
        if (horizontal === "CENTER") {
          addClass("transform", "translate(-50%,-50%)")
        }
        else {
          addClass("transform", "translateY(-50%)")
        }
        break
      }
      case "STRETCH": {
        addClass("top", y)
        addClass("bottom", bottom)
        break
      }
      case "SCALE": {
        addClass("top", percent(percentTop))
        addClass("bottom", percent(percentBottom))
      }
    }

    return
  }

  if (node.findChild && node.findChild(isAbsoluteLayout)) {
    addClass("position", "relative")
  }
}


const addClassFlexbox = (node:FrameNode, addClass:AddClass) => {
  // Flex Layout
  const numChildren = node.children?.filter(child => child.visible).length
  const hasChildren = numChildren > 0
  const hasMoreChildren = numChildren > 1

  const {
    layoutMode,
    layoutWrap,
    primaryAxisAlignItems,
    counterAxisAlignItems,
  } = node

  if (layoutMode !== "NONE" && hasChildren) {

    // hbox
    if (layoutMode === "HORIZONTAL") {
      addClass("display", "flex")
      addClass("flex-flow", ["row", layoutWrap === "WRAP" && "wrap"].filter(isValid).join(" "))
    }

    // vbox
    else if (layoutMode === "VERTICAL") {
      addClass("display", "flex")
      addClass("flex-flow", ["column", layoutWrap === "WRAP" && "wrap"].filter(isValid).join(" "))
    }

    if (counterAxisAlignItems === "MIN") addClass("align-items", "flex-start")
    else if (counterAxisAlignItems === "CENTER") addClass("align-items", "center")
    else if (counterAxisAlignItems === "MAX") addClass("align-items", "flex-end")

    if (primaryAxisAlignItems === "MIN") addClass("justify-content", "flex-start")
    else if (primaryAxisAlignItems === "CENTER") addClass("justify-content", "center")
    else if (primaryAxisAlignItems === "MAX") addClass("justify-content", "flex-end")

    // gap
    if (hasMoreChildren) {
      if (primaryAxisAlignItems === "SPACE_BETWEEN") {
        addClass("justify-content", "space-between")
      }
      else if (isNumber(node.itemSpacing) && node.itemSpacing !== 0) {
        const {itemSpacing} = node

        if (itemSpacing < 0) {
          // @TODO: not support!
          addClass("gap", itemSpacing)
        }
        else {
          addClass("gap", itemSpacing)
        }
      }
    }

    // padding
    const {paddingTop, paddingRight, paddingBottom, paddingLeft} = node
    if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
      if (paddingTop === paddingBottom && paddingRight === paddingLeft && paddingTop === paddingLeft && paddingTop > 0) addClass("padding", paddingTop)
      else {
        addClass("padding", fourSideValues(paddingTop, paddingRight, paddingBottom, paddingLeft).map(px).join(" "))
      }
    }
  }
}

const addClassBackground = (node:FrameNode, addClass:AddClass) => {
  try {
    const fills = [...node.fills].reverse().filter(fill => fill.visible)
    if (fills.length === 0) {
      return
    }

    if (fills.length === 1) {
      const fill = fills[0]
      if (fill.type === "SOLID") {
        addClass("background-color", makeColor(fill.color, fill.opacity))
      }
      else if (fill.type === "GRADIENT_LINEAR") {
        addClass("background-image", makeGradientLinear(fill))
      }
      return
    }

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

  } catch (e) {}
}

const addClassOverflow = (node:FrameNode, addClass:AddClass) => {
  if (!node.children) return

  const numChildren = node.children.filter(child => child.visible).length
  const hasChildren = numChildren > 0

  if (hasChildren && node.clipsContent) addClass("overflow", "hidden")
  else if (node.findOne(child => child.type === "TEXT" && child.textTruncation === "ENDING")) {
    addClass("overflow", "hidden")
    if (node.parent.layoutMode === "HORIZONTAL" || node.parent.layoutMode === "VERTICAL") {
      addClass("flex-shrink", "1")
    }
  }
}

// @TODO: Group에도 opacity가 있다. display:contents를 활용하는 방법을 고민해보자.
const addOpacity = (node:FrameNode, addClass:AddClass) => {
  // opacity
  if (node.opacity !== 1) addClass("opacity", makeNumber(node.opacity))
}

// ----------------------------------------------------------------

const wrapInstance = (node:InstanceNode, code:string) => {
  return code
  // const mainComponent = node.mainComponent || node
  // const mainComponentSet = (mainComponent.parent && mainComponent.parent?.type === "COMPONENT_SET") ? mainComponent.parent : mainComponent
  //
  // const name = makeComponentName(mainComponentSet.name)
  // return `\n${COMMENT_START} <${name}> ${COMMENT_END}\n${code}\n${COMMENT_START} </${name}> ${COMMENT_END}\n`
}

const generateChild = (depth, children, callback) => {
  const contents = (children || []).map(params => generateCode(params, depth + 1))
  const content = contents.filter(isValid).join("\n")
  return callback(content)
}

const generateComponentSet = (node, depth) => {
  const children = generateChild(depth, node.children, content => content)
  return `<div ${CLASS_NAME}="vbox gap(20)" data-node-id="${node.id}">\n${children}\n</div>`
}

const generateInstance = (node, depth) => {
  const code = generateFrame(node, depth)
  return wrapInstance(node, code)
}

const generateFrame = (node:FrameNode, depth:number) => {

  const {addClass, generateHTML} = createClassBuilder()

  // Position
  addClassPosition(node, addClass)

  // Size: width,height: hug, fixed, fill
  addClassWidth(node, addClass)
  addClassHeight(node, addClass)

  // AutoLayout: hbox / vbox
  addClassFlexbox(node, addClass)

  // Fill: Backgrounds
  addClassBackground(node, addClass)

  // Border
  addClassBorder(node, addClass)

  // Border Radius
  addClassBorderRadius(node, addClass)

  // clip: Overflow
  addClassOverflow(node, addClass)

  // Effects: Style
  addEffectClass(node, addClass)

  // Layer: opacity
  addOpacity(node, addClass)

  // @TODO: First on Top
  if (node.itemReverseZIndex) {
    addClass("itemReverseZIndex")
  }

  return generateChild(depth, node.children, content => generateHTML(node, indent(content)))
}

const addClassFont = (node:TextNode, addClass:AddClass) => {
  // font-size
  if (node.fontSize) {
    addClass("font-size", node.fontSize)
  }

  // line-height
  if (node.lineHeight?.value && node.lineHeight?.unit !== "AUTO") {
    addClass("line-height", unitValue(node.lineHeight))
  }

  // letter-spacing
  if (node.letterSpacing?.value) {
    addClass("letter-spacing", unitValue(node.letterSpacing))
  }

  // font-weight
  if (node.fontWeight) {
    const fontStyleName = node.fontWeight.toString()
    switch (fontStyleName) {
      case "Regular": {
        break
      }
      case "Bold": {
        addClass("font-weight", "bold")
        break
      }
      case "Black": {
        addClass("font-weight", "900")
        break
      }
      case "Medium": {
        addClass("font-weight", "500")
        break
      }
      case "DemiLight": {
        addClass("font-weight", "300")
        break
      }
      case "Light": {
        addClass("font-weight", "200")
        break
      }
      case "Thin": {
        addClass("font-weight", "100")
        break
      }
    }
  }

  // font-family
  const fontFamilyName = node.fontFamily
  if (fontFamilyName) {
    addClass("font-family", "'" + fontFamilyName + "'")
  }

  // text-decoration
  switch (node.textDecoration) {
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
  switch (node.textCase) {
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
      addClass("font-variant-caps", "small-caps")
      addClass("text-transform", "capitalize")
      break
    }
  }

  // color
  const fill = node.fills?.find(fill => fill?.visible && fill?.type === "SOLID")
  if (fill) {
    addClass("color", makeColor(fill.color, fill.opacity))
  }
}

const generateText = (node:TextNode) => {
  const {addClass, generateHTML} = createClassBuilder()

  // Position
  addClassPosition(node, addClass)

  // Size
  const {textAutoResize, textTruncation, maxLines, textAlignHorizontal, textAlignVertical} = node
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
  const segments = node.getStyledTextSegments([
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
    // "openTypeFeatures"
  ]).map(segment => ({...segment, fontFamily: segment.fontName?.family, fontWeight: segment.fontName?.style}))

  // get common segments style
  const commonFontStyle = segments.length > 0 ? segments.reduce((prev, curr) => {
    const style = {}
    Object.keys(prev).forEach(key => {
      if (JSON.stringify(prev[key]) === JSON.stringify(curr[key])) style[key] = prev[key]
    })
    return style
  }) : {}

  addClassFont(commonFontStyle, addClass)

  // text-align
  const HORIZONTAL_ALIGN = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    JUSTIFIED: "justify"
  }

  // textAutoResize
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
      addClass("text-align", HORIZONTAL_ALIGN[textAlignHorizontal])
    }
  }
  else {
    addClass("text-align", HORIZONTAL_ALIGN[textAlignHorizontal])
  }

  // textTruncation
  if (textTruncation === "ENDING") {
    if (maxLines > 1) {
      addClass(`display`, "-webkit-box")
      addClass(`-webkit-box-orient`, "vertical")
      addClass(`-webkit-line-clamp`, maxLines)
      addClass(`overflow`, "hidden")
    }
    else {
      addClass("white-space", "nowrap")
      addClass("text-overflow", "ellipsis")
      addClass("overflow", "hidden")
    }
  }

  // textAutoResize: nowrap
  if (!(textTruncation === "ENDING" && maxLines <= 1) && textAutoResize === "WIDTH_AND_HEIGHT") {
    addClass("white-space", "nowrap")
  }

  // opacity
  if (node.opacity !== 1) {
    addClass("opacity", makeNumber(node.opacity))
  }

  const textContent = segments.length === 1 ? nl2br(node.characters) : segments.map(segment => {
    const {addClass, generateHTML} = createClassBuilder()
    // remove common style
    Object.keys(commonFontStyle).forEach(key => {
      if (JSON.stringify(commonFontStyle[key]) === JSON.stringify(segment[key])) delete segment[key]
    })
    addClassFont(segment, addClass)

    return generateHTML(node, nl2br(segment.characters), "span")
  }).join("")

  return generateHTML(node, textContent)
}

const isAsset = (node) => {
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

  const {addClass, generateHTML} = createClassBuilder()

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

    if (node.type === "COMPONENT" || node.type === "INSTANCE") {
      code = wrapInstance(node, code)
    }
    else {
      code = "\n" + code + "\n"
    }
  } catch (e) {
    console.error(e)
    console.error("asset error node:", node)
  }

  return code
}

const generateCode = (node:SceneNode, depth:number = 0) => {
  if (node.visible === false) return ""

  if (isAsset(node)) return generateAsset(node)
  else if (node.type === "COMPONENT" || node.type === "INSTANCE") return generateInstance(node, depth)
  else if (node.type === "COMPONENT_SET") return generateComponentSet(node, depth)
  else if (node.type === "TEXT") return generateText(node)

  return generateFrame(node as FrameNode, depth)
}

export const getGeneratedCode = (node:SceneNode) => {
  const {init} = createClassBuilder()
  init()
  return generateCode(node, 0)
}