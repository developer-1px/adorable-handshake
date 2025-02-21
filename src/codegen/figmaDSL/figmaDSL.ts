import {unitValue} from "../../libs/utils"
import type {SceneNode} from "@figma/plugin-typings/plugin-api-standalone"
import {traverseFigmaNode} from "../shared/traverse"
import {makeColorFromFill} from "../figma2css/Fill"
import {createFigmaDSLStyleBuilder} from "./styleGenerator/createFigmaDSLStyleBuilder"
import {addPositionStyles} from "./styleGenerator/Position"
import {addVisualStyles} from "./styleGenerator/Visual"
import {nl2br} from "./utils"
import {addSizeStyles} from "./styleGenerator/Size"
import {addLayoutStyles} from "./styleGenerator/Layout"

const generateFrameStyle = (node: FrameNode) => {
  const styles = createFigmaDSLStyleBuilder()

  // Size
  addSizeStyles(node, styles)

  // Position
  addPositionStyles(node, styles)

  // Layout
  addLayoutStyles(node, styles)

  // Visual
  addVisualStyles(node, styles)

  return styles.toString()
}

// Text
const generateTextStyle = (node: TextNode) => {
  const styles = createFigmaDSLStyleBuilder()

  // Text Width, Height with Auto Resize
  addSizeStyles(node as FrameNode, styles)

  // Position
  addPositionStyles(node as FrameNode, styles)

  // font-size
  const {fontSize, lineHeight, letterSpacing, fontWeight, fontName, textDecoration, textCase, hyperlink, fills, textStyleId, fillStyleId} =
    node

  const values = [fontSize]
  if (lineHeight && lineHeight.unit !== "AUTO") {
    values.push(unitValue(lineHeight))
  }
  if (letterSpacing && letterSpacing.value) {
    values.push(unitValue(letterSpacing))
  }
  styles.font(...values)

  // font-weight
  if (fontWeight && fontWeight !== 400) {
    styles.add(fontWeight)
  } else if (fontName?.style) {
    switch (fontName.style) {
      case "Medium":
        styles.add(500)
        break
      case "Semibold":
        styles.add(600)
        break
      case "Bold":
        styles.add(700)
        break
    }
  }

  // color
  const color = makeColorFromFill(node.fills)
  if (color) {
    styles.c(color)
  }

  // text-align
  const alignmentMap = {
    LEFT: "",
    CENTER: "center",
    RIGHT: "right",
    JUSTIFIED: "justify",
  }

  const alignmentVerticalMap = {
    TOP: "",
    CENTER: "middle",
    BOTTOM: "bottom",
  }

  if (node.textAlignHorizontal === "CENTER" && node.textAlignVertical === "CENTER") {
    styles.text("pack")
  } else if (!(node.textAlignHorizontal === "LEFT" && node.textAlignVertical === "TOP")) {
    styles.text(alignmentMap[node.textAlignHorizontal], alignmentVerticalMap[node.textAlignVertical])
  }

  // Text Truncate
  if (node.textAutoResize === "WIDTH_AND_HEIGHT") {
    if (node.textTruncation === "ENDING") {
      styles.add("nowrap...")
    } else {
      styles.add("nowrap")
    }
  } else if (typeof node.maxLines === "number" && node.maxLines > 1) {
    styles.maxLines(node.maxLines)
  }

  return styles.toString()
}

const generateStyle = (node: SceneNode) => {
  if (node.type === "TEXT") {
    return generateTextStyle(node as TextNode)
  } else {
    return generateFrameStyle(node as FrameNode)
  }
}

//
const camelCase = (str: string) => str.replace(/\s/g, "").replace(/[-_/]([a-z])/g, (_, letter) => letter.toUpperCase())
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const generateCode = (node: SceneNode) => {
  let types = new Set<string>()
  let codes: string[] = []

  // Component Set
  // if (node.type === "COMPONENT_SET") {
  //   const head = generateComponentSet(node)
  //   codes.push("<script setup lang='ts'>")
  //   codes.push(head)
  //   codes.push("</script>")
  //   codes.push(generateCode(node.children[0]))
  //   return codes.join("\n")
  // }

  // Single Node
  traverseFigmaNode(node, ({node, next, path, level}) => {
    const tab = "  ".repeat(level)

    const style = generateStyle(node as TextNode)
    const type = capitalize(node.type.toLowerCase())
    const attr = {"@name": node.name, "@id": node.id}
    types.add(type)

    // Asset
    if (node.isAsset) {
      // node.exportAsync({format: "SVG_STRING", useAbsoluteBounds: true}).then((content) => {
      //   const inlineSVG = content.replace(/pattern\d/g, (a) => a + node.id.replace(/[^a-zA-z0-9]/g, "-")).replace(/\n/g, "")
      //   // figma.ui.postMessage({type: "assets", id: node.id, name: node.name, svg: inlineSVG})
      // })
      // codes.push(`${tab}<${capitalize(node.name)}("${node.id}"),`)
      // codes.push(`${tab}<${capitalize(camelCase(node.name))} />`)

      codes.push(`\n${tab}// Asset: ${node.name}`)
      codes.push(`${tab}${type}(${JSON.stringify(style)}, ${JSON.stringify(attr)}),`)
    }
    // Text
    else if (node.type === "TEXT") {
      codes.push(`\n${tab}// ${node.characters.replace(/\s+/g, " ")}`)
      codes.push(`${tab}${type}(${JSON.stringify(style)}, ${JSON.stringify(attr)}, ${JSON.stringify(nl2br(node.characters))}),`)
    }
    // Etc: Frame, Group, Component, ...
    else {
      if (node.children && node.children.length > 0) {
        codes.push(`\n${tab}// ${node.name}`)
        codes.push(`${tab}${type}(${JSON.stringify(style)}, ${JSON.stringify(attr)},`)
        next()
        codes.push(`${tab}),`)
      } else {
        codes.push(`\n${tab}// ${node.name}`)
        codes.push(`${tab}${type}(${JSON.stringify(style)}, ${JSON.stringify(attr)}),`)
      }
    }
  })

  return [codes.join("\n").trim().slice(0, -1), types]
}

export const getGeneratedCode = (node: SceneNode) => {
  const [code, types] = generateCode(node)
  return `
function _($) {return function (...props) {const {${Array.from(types).join(", ")}} = $(props); return (

${code}

)}}
`.trim()
}
