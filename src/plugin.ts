import {makeColor} from "./libs/utils"
import {getGeneratedCode, OPTIONS} from "./codegen"

import {getGeneratedCode as getGeneratedHTML} from "./codegen/inlineStyle"
import {addStyleFont} from "./codegen/figma2css/Text/font"
import {makeCSSColor} from "./codegen/figma2css/Fill"
import {dsl2html} from "./codegen/figmaDSL/dsl2html"

// OPTIONS.type = "inlineStyle"
// OPTIONS.type = "tailwindcss"
// OPTIONS.type = "adorablecss"
OPTIONS.type = "figmaDSL"

let selectedFlag = false

function generateLocalTextStyles() {
  const localTextStyles = figma.getLocalTextStyles()

  if (localTextStyles.length === 0) {
    // console.log("No local text styles found.")
  } else {
    // console.log("Local Text Styles:")
    localTextStyles.forEach((style) => {
      // addStyleFont(style)
      // console.log("style", style.id, style.name, style)
    })
  }
}

//
const generateCodeWithUI = () => {
  // @FIXME:
  generateLocalTextStyles()

  //
  selectedFlag = false

  const selection = figma.currentPage.selection
  if (!selection.length) return

  const node = selection[0]
  console.warn("selectedNode: ", node)

  let html = getGeneratedHTML(node)
  const {code} = getGeneratedCode(node)
  if (OPTIONS.type === "figmaDSL") {
    html = dsl2html(code)
  }

  // 배경색상 찾기
  const pageBackgroundColor = makeColor(figma.currentPage.backgrounds[0].color)
  const getBackgroundColor = (node: SceneNode) => node.fills?.find((fill) => fill.type === "SOLID")

  let it = node
  let backgroundColor = pageBackgroundColor
  while (it) {
    const bg = getBackgroundColor(it)
    console.log("backgroundColorbackgroundColor", it, bg)
    if (bg) {
      backgroundColor = makeCSSColor(bg.color, bg.opacity)
      break
    }
    it = it.parent
  }

  // 피그마로 분석한 코드 전달 및 화면크기 조절 요청
  const rect = (node.type === "COMPONENT_SET" ? node.children[0] || node : node).absoluteBoundingBox
  const width = Math.floor(rect.width) || 0
  const height = Math.floor(rect.height) || 0
  figma.ui.resize(width + 800, Math.max(600, height))
  // figma.ui.resize(9999, 9999)
  figma.ui.postMessage({
    type: "code",
    html,
    code,
    backgroundColor,
    pageBackgroundColor,
    width,
    height,
  })
}

// Make sure that we're in Dev Mode and running codegen
if (figma.editorType === "dev" && figma.mode === "codegen") {
  // Register a callback to the "generate" event
  figma.codegen.on("generate", async ({node}) => {
    const {title, language, code} = getGeneratedCode(node)
    return [
      {
        title,
        language,
        code,
      },
    ]
  })
} else {
  figma.showUI(__html__)
  figma.on("selectionchange", () => !selectedFlag && generateCodeWithUI())
  figma.on("documentchange", generateCodeWithUI)

  generateTextStyles()
  void generateCodeWithUI()
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "resize") {
    figma.ui.resize(msg.size.width, msg.size.height)
  }
}

//
function generateTextStyles() {
  const textStyles = figma.getLocalTextStyles()

  const r = textStyles.map((style) => ({
    id: style.id,
    type: style.type,
    name: style.name,
    description: style.description,
    tag: style.name.split("/")[1]?.split(" ")[0],
    style: {display: "block", ...addStyleFont(style)},
  }))

  console.warn(JSON.stringify(r, null, 2))
}
