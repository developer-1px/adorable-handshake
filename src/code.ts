import {capitalize, makeColor, makeFourSideValues, makeGradientLinear, makeInt, makeNumber, nl2br, unitValue} from "./libs/util"

type AddClass = (prop, value?) => number

// @TODO: TBD
const isReact = false
const CLASS_NAME = isReact ? "className" : "class"
const COMMENT_START = isReact ? "{/*" : "<!--"
const COMMENT_END = isReact ? "*/}" : "-->"

const traverse = (node, callback) => {
  callback(node)
  if (node.children && node.children.length) {
    node.children.forEach(child => traverse(child, callback))
  }
}

const createClassBuilder = (cls:string[] = []) => {
  const addClass = (prop, value?) => cls.push(`${prop}${value ? "(" + value + ")" : ""}`)
  return {addClass, cls}
}

const addClassWidth = (node:FrameNode, addClass:AddClass) => {
  const {layoutSizingHorizontal, width, minWidth, maxWidth} = node

  if (layoutSizingHorizontal === "HUG") {}
  else if (layoutSizingHorizontal === "FILL") addClass("w", "fill")
  else if (layoutSizingHorizontal === "FIXED") addClass("w", makeInt(width))

  if (minWidth !== null || maxWidth !== null) {
    const _minWidth = minWidth !== null ? makeInt(minWidth) : ""
    const _maxWidth = maxWidth !== null ? makeInt(maxWidth) : ""
    addClass("w", _minWidth + "~" + _maxWidth)
  }
}

const addClassHeight = (node:FrameNode, addClass:AddClass) => {
  const {layoutSizingVertical, height, minHeight, maxHeight} = node

  if (layoutSizingVertical === "HUG") {}
  else if (layoutSizingVertical === "FILL") addClass("h", "fill")
  else if (layoutSizingVertical === "FIXED") addClass("h", makeInt(height))

  if (minHeight !== null || maxHeight !== null) {
    const _minHeight = minHeight !== null ? makeInt(minHeight) : ""
    const _maxHeight = maxHeight !== null ? makeInt(maxHeight) : ""
    addClass("h", _minHeight + "~" + _maxHeight)
  }
}

const addClassBorderRadius = (node:FrameNode|EllipseNode, addClass:AddClass) => {
  if (node.type === "ELLIPSE") addClass("r", "100%")
  else {
    const {topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius} = node
    if (topLeftRadius > 0 || topRightRadius > 0 || bottomRightRadius > 0 || bottomLeftRadius > 0) {
      if (node.width === node.height && topLeftRadius === topRightRadius && topLeftRadius === bottomRightRadius && topLeftRadius === bottomLeftRadius && topLeftRadius >= node.width / 2) {
        addClass(`r(100%)`)
      }
      else {
        addClass(`r(${makeFourSideValues(topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius)})`)
      }
    }
  }
}

const addClassBorder = (node, addClass:AddClass) => {
  try {
    const {strokes, strokeAlign, strokeWeight} = node

    const border = strokes.filter(stroke => stroke.visible)[0]

    // @ts-ignore
    if (border && border.color && strokeWeight > 0) {

      if (strokeAlign === "OUTSIDE") {
        addClass("ring", [strokeWeight > 1 ? strokeWeight : null, makeColor(border.color, border.opacity)].filter(Boolean).join("/"))
      }
      else {
        // @ts-ignore
        addClass("b", `${makeColor(border.color, border.opacity)}`)
        if (strokeWeight > 1) {
          addClass("bw", node.strokeWeight)
        }
      }
    }
  } catch (e) {
  }
}

const addEffectClass = (node:FrameNode, addClass:AddClass) => {
  // if (node.effectStyleId) {
  //   const style = figma.getStyleById(node.effectStyleId)
  //   addClass(style.name.toLowerCase())
  // }

  console.log("node.effects", node.effects)

  node.effects.forEach(effect => {
    if (!effect.visible) return

    switch (effect.type) {
      case "DROP_SHADOW":
      case "INNER_SHADOW": {
        const {color, offset, radius, spread} = effect
        const {x, y} = offset
        const inset = effect.type === "INNER_SHADOW" ? "inset/" : ""
        addClass("box-shadow", `${inset}${x}/${y}/${radius}` + (spread ? "/" + spread : "") + `/${makeColor(color, color.a)}`)
        break
      }

      case "LAYER_BLUR": {
        addClass("blur", Math.round(effect.radius/2))
        break
      }

      case "BACKGROUND_BLUR": {
        addClass("backdrop-blur", Math.round(effect.radius/2))
        break
      }
    }
  })
}

const everyChildrenHasStretchVbox = (node) => node.children?.every(c => c.layoutSizingHorizontal === "FILL")

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

const addClassPosition = (node:SceneNode, addClass:AddClass) => {
  if (isAbsoluteLayout(node)) {
    const rect1 = node.parent.absoluteBoundingBox
    const rect2 = node.absoluteBoundingBox

    addClass("absolute", Math.floor(rect2.x - rect1.x) + "," + Math.floor(rect2.y - rect1.y))
    return
  }

  if (node.findChild && node.findChild(isAbsoluteLayout)) {
    addClass("relative")
  }
}


// @TODO: Group에도 opacity가 있다. display:contents를 활용하는 방법을 고민해보자.
const addOpacity = (node:SceneNode, addClass:AddClass) => {
  // opacity
  if (node.opacity !== 1) addClass("opacity", makeNumber(node.opacity))
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
      if (primaryAxisAlignItems === "CENTER" && counterAxisAlignItems === "CENTER") {
        addClass("pack")
      }
      else {
        const value:string[] = []

        if (counterAxisAlignItems === "MIN") value.push("top")
        else if (counterAxisAlignItems === "MAX") value.push("bottom")

        if (primaryAxisAlignItems === "CENTER") value.push("center")
        else if (primaryAxisAlignItems === "MAX") value.push("right")

        addClass("hbox", value.join("+"))
      }
    }

    // vbox
    else if (layoutMode === "VERTICAL") {
      if (primaryAxisAlignItems === "CENTER" && counterAxisAlignItems === "CENTER") {
        addClass("vpack")
      }
      else {
        const value:string[] = []

        if (everyChildrenHasStretchVbox(node)) {}
        else if (counterAxisAlignItems === "MIN") value.push("left")
        else if (counterAxisAlignItems === "CENTER") value.push("center")
        else if (counterAxisAlignItems === "MAX") value.push("right")
        if (primaryAxisAlignItems === "CENTER") value.push("middle")
        if (primaryAxisAlignItems === "MAX") value.push("bottom")

        addClass("vbox", value.join("+"))
      }
    }

    // flex-wrap
    if (layoutWrap === "WRAP") {
      addClass("flex-wrap")
    }

    // gap
    if (hasMoreChildren) {
      if (primaryAxisAlignItems === "SPACE_BETWEEN") {
        addClass("space-between")
      }
      else if (node.itemSpacing !== 0) {
        const {itemSpacing} = node

        if (itemSpacing < 0) {
          layoutMode === "HORIZONTAL" ? addClass("hgap", itemSpacing) : addClass("vgap", itemSpacing)
        }
        else {
          addClass("gap", itemSpacing)
        }
      }
    }

    // padding
    const {paddingTop, paddingRight, paddingBottom, paddingLeft} = node
    if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
      addClass("p", makeFourSideValues(paddingTop, paddingRight, paddingBottom, paddingLeft))
    }
  }
}

const addClassBackground = (node:FrameNode, addClass:AddClass) => {
  try {
    const bg = node.fills.filter(fill => fill.visible)[0]
    if (bg?.type === "SOLID") {
      addClass("bg", makeColor(bg.color, bg.opacity))
    }
    else if (bg?.type === "GRADIENT_LINEAR") {
      addClass("bg", makeGradientLinear(bg))
    }
  } catch (e) {
  }
}

const addClassOverflow = (node:FrameNode, addClass:AddClass) => {
  if (!node.children) return
  const numChildren = node.children.filter(child => child.visible).length
  const hasChildren = numChildren > 0
  if (hasChildren && node.clipsContent) addClass("clip")
  else if (node.findOne(child => child.type === "TEXT" && child.textTruncation === "ENDING")) addClass("clip")
}


const wrapInstance = (node, code) => {
  const mainComponent = node.mainComponent || node
  const mainComponentSet = (mainComponent.parent && mainComponent.parent?.type === "COMPONENT_SET") ? mainComponent.parent : mainComponent

  const name = capitalize(mainComponentSet.name.trim().replace(/\s*\/\s*/g, "_").replace(/-|\s+/g, "_").replace(/\s+/g, "_"))
  return `\n${COMMENT_START} <${name}> ${COMMENT_END}\n${code}\n${COMMENT_START} </${name}> ${COMMENT_END}\n`
}

const generateChild = async (depth, children, callback) => {
  const contents = await Promise.all((children || []).map(params => generateCode(params, depth + 1)))
  const content = contents.join("")
  return callback(content)
}

const generateComponentSet = async (node, depth) => {
  const children = await generateChild(depth, node.children, content => content)
  return `<div ${CLASS_NAME}="vbox gap(20)">\n${children}\n</div>\n`
}

const generateInstance = async (node, depth) => {
  const code = await generateFrame(node, depth)
  return wrapInstance(node, code)
}

const generateFrame = async (node:FrameNode, depth:number) => {

  const {addClass, cls} = createClassBuilder()

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

  // Dev Log
  const className = cls.join(" ")
  return await generateChild(depth, node.children, content => `<div ${CLASS_NAME}="${className}">\n${content}\n</div>\n`)
}

const addClassFont = (node:TextNode, addClass:AddClass) => {
  if (node.fontSize) {
    // font( font-size / line-height / letter-spacing )
    const font = [node.fontSize]

    // line-height
    if (node.lineHeight?.value && node.lineHeight?.unit !== "AUTO") {
      font.push(unitValue(node.lineHeight))
    }

    // letter-spacing
    if (node.letterSpacing?.value) {
      if (font.length === 1) font.push("-")
      font.push(unitValue(node.letterSpacing))
    }

    addClass("font", font.filter(Boolean).map(v => v.toString()).join("/"))
  }
  else {
    // line-height
    if (node.lineHeight?.value && node.lineHeight?.unit !== "AUTO") {
      addClass("line-height", unitValue(node.lineHeight))
    }

    // letter-spacing
    if (node.letterSpacing?.value) {
      addClass("letter-spacing", unitValue(node.letterSpacing))
    }
  }

  // font-weight
  if (node.fontWeight) {
    const fontStyleName = node.fontWeight.toLowerCase()
    switch (fontStyleName) {
      case "regular":
        break

      case "black": {
        addClass("heavy")
        break
      }

      default: {
        addClass(fontStyleName)
      }
    }
  }

  // text-decoration
  switch (node.textDecoration) {
    case "UNDERLINE": {
      addClass("underline")
      break
    }
    case "STRIKETHROUGH": {
      addClass("line-through")
      break
    }
  }

  // font-family
  const fontFamilyName = node.fontFamily?.replace(/\s/g, "-")
  if (fontFamilyName) {
    addClass(fontFamilyName)
  }

  // color
  const fill = node.fills?.find(fill => fill?.visible && fill?.type === "SOLID")
  if (fill) {
    addClass("c", makeColor(fill.color, fill.opacity))
  }

  // textCase
  switch (node.textCase) {
    case "UPPER": {
      addClass("uppercase");
      break
    }
    case "LOWER": {
      addClass("lowercase")
      break
    }
    case "TITLE": {
      addClass("capitalize")
      break
    }
    case "SMALL_CAPS": {
      addClass("small-caps")
      break
    }
    case "SMALL_CAPS_FORCED": {
      addClass("capitalize small-caps")
      break
    }
  }
}

const generateText = async (node:TextNode) => {
  const {addClass, cls} = createClassBuilder()

  // Position
  addClassPosition(node, addClass)

  // Size
  const {textAutoResize, textTruncation, maxLines, width, height} = node
  switch (textAutoResize) {
    case "WIDTH_AND_HEIGHT":
      break

    case "HEIGHT":
      addClass("w", makeInt(width))
      break

    case "NONE":
      addClass("w", makeInt(width))
      addClass("h", makeInt(height))
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
    "openTypeFeatures"
  ]).map(segment => ({...segment, fontFamily: segment.fontName?.family, fontWeight: segment.fontName?.style}))

  // get common segments style
  const commonFontStyle = segments.reduce((prev, curr) => {
    const style = {}
    Object.keys(prev).forEach(key => {
      if (JSON.stringify(prev[key]) === JSON.stringify(curr[key])) style[key] = prev[key]
    })
    return style
  })

  addClassFont(commonFontStyle, addClass)

  // text-align
  const HORIZONTAL_ALIGN = {
    // LEFT: "left", // @NOTE: default (don't remove this comment)
    CENTER: "center",
    RIGHT: "right",
    JUSTIFIED: "justify"
  }

  const VERTICAL_ALIGN = {
    // TOP: "top",  // @NOTE: default (don't remove this comment)
    CENTER: "middle",
    BOTTOM: "bottom"
  }

  switch (textAutoResize) {
    case "NONE": {
      let textClass = [HORIZONTAL_ALIGN[node.textAlignHorizontal], VERTICAL_ALIGN[node.textAlignVertical]].filter(Boolean).join("+")
      if (textClass === "center+middle") textClass = "pack"
      if (textClass) {
        addClass("text", textClass)
      }
      break;
    }

    case "HEIGHT": {
      addClass("text", HORIZONTAL_ALIGN[node.textAlignHorizontal])
      break
    }
  }

  // textTruncation
  if (textTruncation === "ENDING") {
    if (maxLines > 1) {
      addClass("line-clamp", maxLines)
    }
    else {
      addClass("nowrap...")
    }
  }

  // opacity
  if (node.opacity !== 1) {
    addClass("opacity", makeNumber(node.opacity))
  }


  const textContent = segments.length === 1 ? nl2br(node.characters) : segments.map(segment => {
    const {addClass, cls} = createClassBuilder()
    // remove common style
    Object.keys(commonFontStyle).forEach(key => {
      if (JSON.stringify(commonFontStyle[key]) === JSON.stringify(segment[key])) delete segment[key]
    })
    addClassFont(segment, addClass)

    const className = cls.join(" ")
    return `<span ${CLASS_NAME}="${className}">${nl2br(segment.characters)}</span>`
  }).join("")

  const className = cls.join(" ")
  return `<div ${CLASS_NAME}="${className}">${textContent}</div>\n`
}


const generateShape = async (node) => {

  const cls = []
  const {addClass} = createClassBuilder(cls)

  // Constraints
  addClassPosition(node, addClass)

  // width
  addClassWidth(node, addClass)

  // height
  addClassHeight(node, addClass)

  // Radius
  addClassBorderRadius(node, addClass)

  // bg
  const bg = node.fills.filter(fill => fill.visible)[0]
  if (bg?.type === "SOLID") {
    addClass("bg", makeColor(bg.color, bg.opacity))
  }

  // border
  addClassBorder(node, addClass)

  // effectStyle
  addEffectClass(node, addClass)

  // opacity
  addOpacity(node, addClass)

  const className = cls.join(" ")
  return `<div ${CLASS_NAME}="${className}"></div>\n`
}


const isAsset = (node) => {
  if (node.isAsset) return true
  if (node.children && node.children.length > 0 && node.children.every(c => c.isAsset)) return true
  console.log(node, node.children && node.children.map(c => [c, c.isAsset]))
  return false
}

const generateCode = async (node:SceneNode, depth:number = 0) => {
  if (node.visible === false) return ""

  let code = ""

  if (isAsset(node)) {
    const cls = []
    const {addClass} = createClassBuilder(cls)

    try {
      addClassPosition(node, addClass)
      const content = await node.exportAsync({format: "SVG_STRING", useAbsoluteBounds: true})

      if (cls.length) {
        code = `<div ${CLASS_NAME}="${cls}">\n${content}\n</div>\n`
      }
      else {
        code = content
      }
    } catch (e) {
      code = ""
    }
  }
  else if (node.type === "COMPONENT" || node.type === "INSTANCE") code = await generateInstance(node, depth)
  else if (node.type === "FRAME" || node.type === "GROUP" || node.type === "RECTANGLE") code = await generateFrame(node as FrameNode, depth)
  else if (node.type === "TEXT") code = await generateText(node)
  else if (node.type === "COMPONENT_SET") code = await generateComponentSet(node, depth)

  const space = "  "
  return code.split("\n").map(line => space + line).join("\n")
}

const getGeneratedCode = async (node) => {
  // 선택한 코드를
  // const record = {}
  //
  // console.log("selectedNode!!: ", node)
  // // console.log("inferredAutoLayout: ", node.inferredAutoLayout)
  //
  // traverse(node, (node) => {
  //   if (node.type === "INSTANCE") {
  //     const mainComponent = node.mainComponent
  //     const mainComponentSet = mainComponent.parent?.type === "COMPONENT_SET" ? mainComponent.parent : mainComponent
  //     record[node.mainComponent.id] = mainComponentSet.name
  //   }
  // })

  return await generateCode(node, 0)
}

const generate = async () => {
  const selection = figma.currentPage.selection
  if (!selection.length) return

  const node = selection[0]
  console.log("selectedNode: ", node)

  const code = await getGeneratedCode(node)

  // 배경색상 찾기
  const pageBackgroundColor = makeColor(figma.currentPage.backgrounds[0].color)
  const getBackgroundColor = (node:SceneNode) => node.fills?.find(fill => fill.visible && fill.type === "SOLID")

  let it = node.parent
  let backgroundColor = pageBackgroundColor
  while (it) {
    const bg = getBackgroundColor(it)
    if (getBackgroundColor(it)) {
      backgroundColor = makeColor(bg.color, bg.opacity)
      console.log(backgroundColor)
      break
    }
    it = it.parent
  }

  // 피그마로 분석한 코드 전달 및 화면크기 조절 요청
  const rect = node.absoluteBoundingBox
  const width = Math.floor(rect.width) || 0
  const height = (Math.floor(rect.height) || 0) + 200
  figma.ui.resize(width, height)
  figma.ui.postMessage({code, backgroundColor, pageBackgroundColor})
}

if (figma.editorType === "figma") {
  figma.showUI(__html__)
  figma.on("selectionchange", generate)
  figma.on("currentpagechange", generate)
  void generate()
}

// Make sure that we're in Dev Mode and running codegen
if (figma.editorType === "dev" && figma.mode === "codegen") {
  // Register a callback to the "generate" event
  figma.codegen.on("generate", async ({node}) => {

    console.log("codegen!!: ", node)

    const code = await getGeneratedCode(node)
    return [{
      title: "HTML",
      language: "HTML",
      code: code,
    }]
  })
}