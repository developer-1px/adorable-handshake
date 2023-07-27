import {capitalize, makeColor, makeFourSideValues, makeGradientLinear, makeInt, makeNumber, nl2br, unitValue} from "./libs/util"

type AddClass = (prop, value?) => number

// @TODO: TBD
const isReact = false
const CLASS_NAME = isReact ? "className" : "class"
const COMMENT_START = isReact ? "{/*" : "<!--"
const COMMENT_END = isReact ? "*/}" : "-->"

figma.showUI(__html__, {width: 300, height: 300})

const traverse = (node, callback) => {
  callback(node)
  if (node.children && node.children.length) {
    node.children.forEach(child => traverse(child, callback))
  }
}

const createClassBuilder = (cls:string[]) => {
  const addClass = (prop, value?) => cls.push(`${prop}${value ? "(" + value + ")" : ""}`)
  return {addClass, cls}
}

const generateChild = async (depth, children, callback) => {
  const contents = await Promise.all((children || []).map(params => generateCode(params, depth)))
  const content = contents.join("")
  return callback(content)
}

const wrapInstance = (node, code) => {
  const mainComponent = node.mainComponent || node
  const mainComponentSet = (mainComponent.parent && mainComponent.parent?.type === "COMPONENT_SET") ? mainComponent.parent : mainComponent

  const name = capitalize(mainComponentSet.name.trim().replace(/\s*\/\s*/g, "_").replace(/-|\s+/g, "_").replace(/\s+/g, "_"))
  return `\n${COMMENT_START} <${name}/> ${COMMENT_END}\n${code}\n${COMMENT_START} </${name}> ${COMMENT_END}\n`
}

const generateGroup = async (node:GroupNode, depth) => {
  if (node.parent && node.parent.layoutMode && (node.parent.layoutMode !== "NONE")) {
    return generateFrame(node, depth)
  }

  return await generateChild(depth, node.children, content => content)
}

const generateComponentSet = async (node, depth) => {
  const children = await generateChild(depth, node.children, content => content)
  return `<div ${CLASS_NAME}="vbox gap(20)">${children}</div>`
}


const generateInstance = async (node, depth) => {
  const code = await generateFrame(node, depth)
  return wrapInstance(node, code)
}

const addClassWidth = (node:FrameNode, addClass:AddClass) => {
  const {layoutSizingHorizontal, width, minWidth, maxWidth} = node

  if (layoutSizingHorizontal === "HUG") {}
  else if (node?.parent?.layoutMode === "VERTICAL" && layoutSizingHorizontal === "FILL") addClass("w", "fill")
  else if (layoutSizingHorizontal === "FIXED") addClass("w", makeInt(width))

  if (minWidth !== null || maxWidth !== null) {
    const _minWidth = minWidth !== null ? makeInt(minWidth) : ""
    const _maxWidth = maxWidth !== null ? makeInt(maxWidth) : ""
    addClass("w", _minWidth + "~" + _maxWidth)
  }
}

const addClassHeight = (node:FrameNode, addClass:AddClass) => {
  const {layoutSizingVertical, height} = node
  if (layoutSizingVertical === "HUG") {}
  else if (node?.parent?.layoutMode === "HORIZONTAL" && layoutSizingVertical === "FILL") addClass("h", "fill")
  else if (layoutSizingVertical === "FIXED") addClass("h", makeInt(height))
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

const addEffectStyle = (node, addClass:AddClass) => {
  if (node.effectStyleId) {
    const style = figma.getStyleById(node.effectStyleId)
    addClass(style.name.toLowerCase())
  }
}


const addClassFlexGrow = (node, addClass:AddClass) => {
  const {layoutGrow} = node
  if (layoutGrow > 0) layoutGrow === 1 ? addClass("flex") : addClass(`flex(${layoutGrow})`)
}

const everyChildrenHasStretchVbox = (node) => node.children?.every(c => c.layoutSizingHorizontal === "FILL")

const isAbsoluteLayout = (node) => {
  const selection = figma.currentPage.selection
  if (node === selection[0]) {
    return false
  }

  if (node.parent?.layoutMode && node.parent?.layoutMode !== "NONE") {
    return false
  }

  return true
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
    width, height
  } = node

  if (layoutMode !== "NONE" && hasChildren) {

    // hbox
    if (layoutMode === "HORIZONTAL") {
      if (primaryAxisAlignItems === "CENTER" && counterAxisAlignItems === "CENTER") {
        if (numChildren > 1) addClass("hbox")
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
        if (numChildren > 1) addClass("vbox")
        addClass("pack")
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

        if (layoutWrap === "WRAP") {
          addClass("gap", itemSpacing)
        }
        else {
          layoutMode === "HORIZONTAL" ? addClass("hgap", itemSpacing) : addClass("vgap", itemSpacing)
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

const generateFrame = async (node:FrameNode, depth:number) => {

  const {addClass, cls} = createClassBuilder([])

  // Position
  addClassPosition(node, addClass)


  // Size: width / fill
  addClassWidth(node, addClass)

  // Size: height / fill
  addClassHeight(node, addClass)


  // AutoLayout hbox / vbox
  addClassFlexbox(node, addClass)


  // bg
  addClassBackground(node, addClass)

  // Border Radius
  addClassBorderRadius(node, addClass)

  // Border
  addClassBorder(node, addClass)

  // effectStyle
  addEffectStyle(node, addClass)

  // opacity
  addOpacity(node, addClass)

  // overflow
  const numChildren = node.children?.filter(child => child.visible).length
  const hasChildren = numChildren > 0
  if (hasChildren && node.clipsContent) addClass("clip")
  else if (node.findOne(child => child.type === "TEXT" && child.textTruncation === "ENDING")) addClass("clip")

  // Dev Log
  if (node.itemReverseZIndex) {
    addClass("itemReverseZIndex")
  }

  const className = cls.join(" ")
  return await generateChild(depth + 1, node.children, content => `<div ${CLASS_NAME}="${className}">\n${content}</div>`)
}

const generateText = async (node:TextNode) => {
  const cls = []
  const {addClass} = createClassBuilder(cls)

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
  ])

  console.log({segments})

  // Constraints
  addClassPosition(node, addClass)

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

  // font-weight
  if (node.fontName?.style) {
    const fontStyleName = node.fontName?.style.toLowerCase()
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

  // font-family
  const fontFamilyName = node.fontName?.family?.replace(/\s/g, "-")
  if (fontFamilyName) {
    addClass(fontFamilyName)
  }

  // color
  const fill = node.fills[0]
  if (fill?.visible && fill?.type === "SOLID") {
    addClass("c", makeColor(fill.color, fill.opacity))
  }

  // opacity
  if (node.opacity !== 1) {
    addClass("opacity", makeNumber(node.opacity))
  }

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

  // textCase
  switch (node.textCase) {
    case "UPPER": {
      addClass("uppercase")
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

  // textTruncation
  if (textTruncation === "ENDING") {
    if (maxLines > 1) {
      addClass("line-clamp", maxLines)
    }
    else {
      addClass("nowrap...")
    }
  }

  const className = cls.join(" ")
  const textContent = nl2br(node.characters)

  console.log("textContent: ", node.characters)

  return `<div ${CLASS_NAME}="${className}">${textContent}</div>`
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
  addEffectStyle(node, addClass)

  // opacity
  addOpacity(node, addClass)

  const className = cls.join(" ")
  return `<div ${CLASS_NAME}="${className}"></div>`
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
      const content = await node.exportAsync({format: "SVG_STRING"})

      if (cls.length) {
        code = `<div ${CLASS_NAME}="${cls}">${content}</div>`
      }
      else {
        code = content
      }
    } catch (e) {
      code = ""
    }
  }
  else if (node.type === "COMPONENT" || node.type === "INSTANCE") code = await generateInstance(node, depth)
  else if (node.type === "FRAME" || node.type === "GROUP") code = await generateFrame(node as FrameNode, depth)
  else if (node.type === "TEXT") code = await generateText(node)
  else if (node.type === "RECTANGLE") code = await generateShape(node)
  else if (node.type === "COMPONENT_SET") code = await generateComponentSet(node, depth)

  return Array(depth).fill("  ").join("") + code + "\n"
}

const generate = async () => {
  const selection = figma.currentPage.selection
  if (!selection.length) return

  // 선택한 코드를
  const node = selection[0]
  const record = {}

  console.log("selectedNode!!: ", node)
  // console.log("inferredAutoLayout: ", node.inferredAutoLayout)

  traverse(node, (node) => {
    if (node.type === "INSTANCE") {
      const mainComponent = node.mainComponent
      const mainComponentSet = mainComponent.parent?.type === "COMPONENT_SET" ? mainComponent.parent : mainComponent
      record[node.mainComponent.id] = mainComponentSet.name
    }
  })

  const code = await generateCode(node, 0)

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
  figma.showUI(__html__, {
    width: Math.floor(rect.width) || 0,
    height: (Math.floor(rect.height) || 0) + 200
  })
  figma.ui.postMessage({code, backgroundColor, pageBackgroundColor})
}

generate()
figma.on("selectionchange", generate)
figma.on("currentpagechange", generate)