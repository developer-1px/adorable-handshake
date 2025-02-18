import {nl2br} from "../libs/utils"
import {getCssStyleBackground} from "./figma2css/Fill"
import {getCssStyleFlexbox, getCssStyleOverflow} from "./figma2css/Layout"
import {getCssStylePosition} from "./figma2css/Position"
import {getCssStyleSize} from "./figma2css/Layout/size"
import {addStyleFont} from "./figma2css/Text/font"
import {type Style} from "./shared"
import {getCssEffectClass} from "./figma2css/Effect"
import {getCssStyleBorder} from "./figma2css/Stroke"
import {getCssOpacity, getCssStyleBorderRadius} from "./figma2css/Appearance"
import {traverseFigmaNode, traverseParallelNodes} from "./shared/traverse"
import {styleToTailwind} from "./modes/tailwindCSS"
import {getCssStyleTextAlign} from "./figma2css/Text/textAlign"
import {getCssStyleTextLayout} from "./figma2css/Text/textLayout"
import {generateAsset} from "./figma2css/Asset"
import type {SceneNode} from "@figma/plugin-typings/plugin-api-standalone"
import {generateCVA} from "./cva"

// 속성 객체를 문자열로 변환하는 헬퍼 함수
const attributesToString = (attributes) => {
  if (!attributes || Object.keys(attributes).length === 0) return ""

  return Object.entries(attributes)
    .map(([key, value]) => {
      // class나 style 같은 특별한 속성들 처리
      if (value === undefined || value === null) return ""
      if (typeof value === "boolean" && value) return key
      if (typeof value === "boolean" && !value) return ""

      // 객체인 경우 (style 객체 등) 처리
      if (typeof value === "object") {
        if (key === "style") {
          const styleString = Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ")
          return `${key}="${styleString}"`
        }
        return `${key}='${JSON.stringify(value)}'`
      }

      return `${key}="${value}"`
    })
    .filter(Boolean)
    .join(" ")
}

// 여는 태그 생성
const openTag = (tag, attributes = {}) => {
  const attrs = attributesToString(attributes)
  return attrs ? `<${tag} ${attrs}>` : `<${tag}>`
}

// 닫는 태그 생성
const closeTag = (tag) => {
  return `</${tag}>`
}

// void 태그 생성 (자체 닫힘 태그)
const voidTag = (tag, attributes = {}, contents = "") => {
  const attrs = attributesToString(attributes)
  return `<${tag} ${attrs}>${contents}</${tag}>`
}

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

    // if (tag === "div") {
    //   textStyles.forEach((ts) => {
    //     const isSame = node.textStyleId?.startsWith(ts.id)
    //     if (isSame) {
    //       tag = ts.name.split("/")[1].split(" ")[0]
    //
    //       // cls에서 같은 style값이면 delete 한다.
    //       Object.entries(ts.style).forEach(([prop, value]) => {
    //         if (cls[prop] === value) {
    //           delete cls[prop]
    //         }
    //       })
    //
    //       console.log(">>>>>>", tag, ts.name)
    //     }
    //   })
    // }

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

export const getCssStyle = (node: SceneNode) => {
  if (node.type === "TEXT") {
    return getCssTextStyle(node as TextNode)
  }

  return getCssBoxStyle(node as FrameNode)
}

//
//
// ----------------------------------------------------------------
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
            const s: Partial<StyledTextSegment> = {}
            Object.entries(segment).forEach(([key, value]) => {
              if (JSON.stringify(value) !== JSON.stringify(commonFontStyle[key])) {
                s[key] = value
              }
            })
            const res = addStyleFont(s)
            return voidTag("span", {style: res}, nl2br(segment.characters))
          })
          .join("")

  res = {
    ...res,
    ...getCssTextStyle(node),
  }

  return voidTag("div", {style: res}, textContents)
}

const isAsset2 = (node: SceneNode) => node.isAsset || (node.type === "GROUP" && node.children.every(isAsset2))

export const isAsset = (node: SceneNode) => {
  // @TODO: Vertor이지만 LINE이거나 ELLIPSE일 경우는 그릴 수 있어서 Asset가 아니어야 한다!
  if (node.isAsset) return true
  if (Array.isArray(node.fills) && node.fills.find((f) => f.visible && f.type === "IMAGE")) return true
  if (node.type === "ELLIPSE") return false
  if (node.exportSettings && node.exportSettings.find((e) => e.format === "SVG")) {
    if (node.parent.type === "SECTION" || node.parent.type === "PAGE") {
      return false
    }
    return true
  }
  return false
}

// ----------------------------------------------------------------
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

    if (isAsset(nodes[0])) {
      return false
    }
  })

  return `
import { cva } from "class-variance-authority";
 
${codes.join("\n\n")}
`.trim()
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
    if (isAsset(node)) {
      codes.push(tab + generateAsset(node, voidTag))
    }
    // TEXT
    else if (node.type === "TEXT") {
      codes.push(tab + generateText(node as TextNode))
    }
    // BOX
    else {
      // COMPONENT INSTANCE
      if (node.type === "INSTANCE") {
        codes.push(tab)
        // codes.push(tab + `<!-- ${generateJSXFromInstance(node)} -->`)
      }

      const style = getCssStyle(node)
      codes.push(tab)
      codes.push(tab + `<!-- ${node.name} -->`)
      codes.push(tab + openTag("div", {style}))
      next()
      codes.push(tab + closeTag("div"))
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
