import {makeColor, OPTIONS} from "./libs/utils"
import {getGeneratedCode} from "./codegen"

import {getGeneratedCode as getGeneratedHTML} from "./codegen/inlineStyle"

// OPTIONS.type = "inlineStyle"
OPTIONS.type = "adorablecss"
// OPTIONS.type = "tailwindcss"
// OPTIONS.type = "styledComponent"
// OPTIONS.type = "flutterAdorable"

let selectedFlag = false

const generateCodeWithUI = () => {
  selectedFlag = false

  const selection = figma.currentPage.selection
  if (!selection.length) return

  const node = selection[0]
  console.log("selectedNode: ", node)

  const html = getGeneratedHTML(node)
  const {code} = getGeneratedCode(node)

  // 배경색상 찾기
  const pageBackgroundColor = makeColor(figma.currentPage.backgrounds[0].color)
  const getBackgroundColor = (node: SceneNode) => node.fills?.find((fill) => fill.visible && fill.type === "SOLID")

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
  void generateCodeWithUI()
}
