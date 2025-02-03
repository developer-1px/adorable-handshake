import {nl2br} from "../libs/utils"
import {getCssStyleBackground} from "./figma2css/Fill"
import {getCssStyleFlexbox, getCssStyleOverflow} from "./figma2css/Layout"
import {getCssStylePosition} from "./figma2css/Position"
import {getCssStyleSize} from "./figma2css/Layout/size"
import {addStyleFont} from "./figma2css/text/font"
import {type Style} from "./shared"
import {getCssEffectClass} from "./figma2css/Effect"
import {textStyles} from "../mock/textStyles"
import {getCssStyleBorder} from "./figma2css/stroke"
import {getCssOpacity, getCssStyleBorderRadius} from "./figma2css/Appearance"
import {traverseFigmaNode, traverseParallelNodes} from "./shared/traverse"
import {styleToTailwind} from "./modes/tailwindCSS"
import {getCssStyleTextAlign} from "./figma2css/text/textAlign"
import {getCssStyleTextLayout} from "./figma2css/text/textLayout"
import {generateAsset} from "./figma2css/Asset"
import type {SceneNode} from "@figma/plugin-typings/plugin-api-standalone"
import {generateCVA} from "./cva"

type StyleBuilderFactory = (node: FrameNode | TextNode) => StyleBuilder

interface StyleBuilder {
  root?: string[]
  init: () => void
  generateHTML: (node: SceneNode, cls: Style, content: string, tag?: string) => string
  build: (code: string, self: StyleBuilder) => string
}

let createClassBuilder: StyleBuilderFactory

const createInlineStyleBuilder = (node: FrameNode | TextNode): StyleBuilder => {
  function init() {}

  function generateHTML(node: FrameNode | TextNode, cls: Style, content: string, tag = "div") {
    let code = ""
    const attrForPreview = `data-node-id="${node.id}"`

    if (tag === "div") {
      textStyles.forEach((ts) => {
        const isSame = node.textStyleId?.startsWith(ts.id)
        if (isSame) {
          tag = ts.name.split("/")[1].split(" ")[0]

          // cls에서 같은 style값이면 delete 한다.
          Object.entries(ts.style).forEach(([prop, value]) => {
            if (cls[prop] === value) {
              delete cls[prop]
            }
          })

          console.log(">>>>>>", tag, ts.name)
        }
      })
    }

    const style = Object.entries(cls)
      .map(([prop, value]) => `${prop}:${value};`)
      .join(" ")

    const classList = styleToTailwind(cls)

    if (tag === "span" && !content) return ""
    if (tag === "span" && style.length === 0) return content

    if (node.type !== "TEXT" && tag !== "span") code += `\n<!-- ${node.name} -->\n`
    if (tag === "img") {
      const width = Math.floor(node.width) || 0
      const height = Math.floor(node.height) || 0
      code += `<img style="${style}" width="${width}" height="${height}" src="" alt="" ${attrForPreview}/>`
    }
    //
    else {
      code += `<${tag} class="${classList}" ${attrForPreview}>${content}</${tag}>`
    }

    return code
  }

  function build(code: string) {
    return code
  }

  return {init, generateHTML, build}
}

// ----------------------------------------------------------------

export const getCommonFontStyle = (segments: StyledTextSegment[]): Partial<StyledTextSegment> => {
  if (segments.length === 0) return {}

  return segments.reduce((prev, curr) => {
    const style: Partial<StyledTextSegment> = {}
    Object.keys(prev).forEach((key) => {
      if (JSON.stringify(prev[key]) === JSON.stringify(curr[key])) style[key] = prev[key]
    })
    return style
  })
}

const getStyledTextSegments = (node: TextNode): StyledTextSegment[] => {
  return node.getStyledTextSegments([
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
  ]) as StyledTextSegment[]
}

const getCssTextStyle = (node: TextNode): Style => {
  return {
    ...getCssStylePosition(node),
    ...getCssStyleTextLayout(node),
    ...addStyleFont(getCommonFontStyle(getStyledTextSegments(node))),
    ...getCssStyleTextAlign(node),
    ...getCssOpacity(node),
  }
}

const generateText = (node: TextNode) => {
  let res: Style = {}

  // Text Segment
  const segments: StyledTextSegment[] = getStyledTextSegments(node)
  const commonFontStyle: Partial<StyledTextSegment> = getCommonFontStyle(segments)

  // textContents
  const textContents =
    segments.length === 1
      ? nl2br(node.characters)
      : segments
          .map((segment) => {
            const {generateHTML} = createClassBuilder(node)
            const s: Partial<StyledTextSegment> = {}
            Object.entries(segment).forEach(([key, value]) => {
              if (JSON.stringify(value) !== JSON.stringify(commonFontStyle[key])) {
                s[key] = value
              }
            })
            const res = addStyleFont(s)
            return generateHTML(node, res, nl2br(segment.characters), "span")
          })
          .join("")

  res = {
    ...res,
    ...getCssTextStyle(node),
  }

  const {generateHTML} = createClassBuilder(node)
  return generateHTML(node, res, textContents)
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

//
// ----------------------------------------------------------------
const getCssStyle = (node: SceneNode) => {
  if (node.type === "TEXT") {
    return getCssTextStyle(node as TextNode)
  }

  return getCssBoxStyle(node as FrameNode)
}

const getCssBoxStyle = (node: FrameNode) => {
  if (!node) {
    console.error("[getCssStyle] node is null")
    return {}
  }

  return {
    // Position
    ...getCssStylePosition(node),

    // Size(width x height): hug, fixed, fill
    ...getCssStyleSize(node),

    // AutoLayout -> hbox / vbox / wrap
    ...getCssStyleFlexbox(node),

    // Fill -> Backgrounds
    ...getCssStyleBackground(node),

    // Stroke -> Border
    ...getCssStyleBorder(node),

    // Border Radius
    ...getCssStyleBorderRadius(node),

    // clip: Overflow
    ...getCssStyleOverflow(node),

    // Appearance: Opacity
    ...getCssOpacity(node),

    // Effects: Style
    ...getCssEffectClass(node),
  }
}

//
//
// ----------------------------------------------------------------
const extractCommonKeys = (objects: any[]): string[] =>
  Object.keys(objects[0]).filter((key) => objects.every((obj) => obj.hasOwnProperty(key)))

const generateComponentSet = (node: SceneNode) => {
  if (node.type !== "COMPONENT_SET") {
    return ""
  }

  const codes = []

  console.warn("node.variantGroupProperties", node.variantGroupProperties)

  const variantGroupProperties = node.variantGroupProperties

  traverseParallelNodes(node.children, ({nodes, path, level, index}) => {
    const variantsData = nodes.map((child, i) => {
      const component = node.children[i]
      const variants = component.variantProperties || {}
      const style = getCssStyle(child)

      return {
        variants,
        style,
      }
    })

    const cva = generateCVA(variantsData, variantGroupProperties)

    console.log(">>>", cva)

    // const code = generateCVACode(variantsData, camelCase(nodes[0].name))
    codes.push(JSON.stringify(cva, null, 2))
    // console.log("Analysis Result:", code)

    if (isAsset2(nodes[0])) {
      return false
    }
  })

  return `
import { cva } from "class-variance-authority";
 
${codes.join("\n\n")}
`.trim()
}

const camelCase = (str: string): string => {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
}

///
const getTailwindCSS = (node: SceneNode) => {
  const style = getCssStyle(node as FrameNode)
  return styleToTailwind(style)
}

const generateCode = (node: SceneNode) => {
  let codes: string[] = []

  // Component Set
  if (node.type === "COMPONENT_SET") {
    const head = generateComponentSet(node)
    codes.push("<script setup lang='ts'>")
    codes.push(head)
    codes.push("</script>")
    codes.push(generateCode(node.children[0]))
    return codes.join("\n")
  }

  // Single Node
  traverseFigmaNode(node, ({node, next, path, level}) => {
    const tab = "  ".repeat(level)

    // ASSET
    if (isAsset2(node)) {
      codes.push(tab + generateAsset(node, createClassBuilder))
    }
    // TEXT
    else if (node.type === "TEXT") {
      codes.push(tab + generateText(node as TextNode))
    }
    // BOX
    else {
      const classList = getTailwindCSS(node)
      codes.push(tab)
      codes.push(tab + `<!-- ${node.name} -->`)
      codes.push(tab + `<div class="${classList}">`)
      next()
      codes.push(tab + "</div>")
    }
  })

  return codes.join("\n")
}

export const getGeneratedCode = (node: FrameNode, builderFactory = createInlineStyleBuilder) => {
  createClassBuilder = builderFactory
  const builder = createClassBuilder(node)
  builder.init?.()
  const code = generateCode(node).trim()
  return builder.build(code, builder)
}
