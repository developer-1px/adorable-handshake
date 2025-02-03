import {indent, makeComponentName} from "../../libs/utils"
import {getGeneratedCode as i} from "../inlineStyle"

// @TODO: TBD
const isReact = false
const CLASS_NAME = isReact ? "style" : "style"
const COMMENT_START = isReact ? "{/*" : "<!--"
const COMMENT_END = isReact ? "*/}" : "-->"

const prefixAddOne = (str: string) => str.replace(/(\d*)$/, (_, p1) => String(Number(p1) + 1))

const createStyledComponentBuilder = (
  (root = [], styledMap1 = {}, styledMap2 = {}) =>
  (node, cls: string[] = []) => {
    function init() {
      root.length = 0
      styledMap1 = {}
      styledMap2 = {}
    }

    function addClass(prop: string, value: string) {
      cls.push(`${prop}:${value};`)
    }

    function generateHTML(node, content: string, tag = "div") {
      if (tag === "span" && !content) return ""
      if (tag === "span" && cls.length === 0) return content
      if (tag !== "span") tag = "div"

      // Styled Component
      let componentName = node.type === "TEXT" ? (tag === "span" ? "Span" : "Text") : makeComponentName(node.name)
      if (node.textStyleId && typeof node.textStyleId === "string") {
        const style = figma.getStyleById(node.textStyleId)
        if (style) {
          componentName = makeComponentName("Text_" + style.name)
        }
      }
      const code = "styled." + tag + "`\n  " + cls.join("\n  ") + "\n`\n"

      if (styledMap2[code]) {
        componentName = styledMap2[code]
      } else if (styledMap1[componentName] === code) {
      } else {
        while (styledMap1[componentName] && styledMap1[componentName] !== code) {
          componentName = prefixAddOne(componentName)
        }
        styledMap1[componentName] = code
        styledMap2[code] = componentName
        root.unshift(`const ${componentName}` + " = " + code)
      }

      return `<${componentName}>${content}</${componentName}>`
    }

    return {root, init, addClass, generateHTML}
  }
)()

export const getGeneratedCode = (node: SceneNode) => {
  const {root} = createStyledComponentBuilder()
  const code = i(node, createStyledComponentBuilder)
  const componentName = makeComponentName(node.name)
  return (
    root.join("\n") +
    "\n" +
    `function ${componentName}() {
  return (
    ${indent(indent(code)).trim()}
  )
}

export default ${componentName}`
  )
}
