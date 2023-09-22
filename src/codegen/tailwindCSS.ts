import {getGeneratedCode as i} from "./inlineStyle";

const makeTailwindValue = (value:string) => value.replace(/\s+/g, "_")
const t = (prop:string, value:string) => {
  prop = prop.replace(/^[_]+/g, "")
  if (!value) return prop
  if (value === "0") return prop + "-0"
  return `${prop}${value ? "-[" + makeTailwindValue(value) + "]" : ""}`
}

// @TODO: TBD
const isReact = false
const CLASS_NAME = isReact ? "className" : "class"
const COMMENT_START = isReact ? "{/*" : "<!--"
const COMMENT_END = isReact ? "*/}" : "-->"

const createTailwindCSSBuilder = (node:FrameNode, cls:Record<string, string> = {}) => {

  function init() {}

  function transform(prop:string, value:string|number):[string, string?] {
    value = String(value)

    switch (prop) {
      case "top":
      case "right":
      case "bottom":
      case "left": {
        value = value.replace(/\s/g, "")
        if (value === "100%") return [prop + "-full"]
        if (value === "50%") return [prop + "-1/2"]
        return [prop, value]
      }

      case "transform": {
        if (value === "translate(-50%,-50%)") return ["-translate-x-1/2 -translate-y-1/2"]
        if (value === "translateX(-50%)") return ["-translate-x-1/2"]
        if (value === "translateY(-50%)") return ["-translate-y-1/2"]
        return ["transform", value]
      }

      case "width": {
        if (value === "100%") return ["w-full"]
        return ["w", value]
      }
      case "min-width": {return ["min-w", value]}
      case "max-width": {return ["max-w", value]}

      case "height": {
        if (value === "100%") return ["h-full"]
        return ["h", value]
      }
      case "min-height": {return ["min-h", value]}
      case "max-height": {return ["max-h", value]}

      case "position": {return [value]}
      case "display": {return [value]}

      case "flex": {
        if (value === "1") return ["flex-1"]
        return ["flex", value]
      }
      case "flex-shrink": {
        switch (value) {
          case "0": {return ["shrink-0"]}
          case "1": {return ["shrink-1"]}
        }
        return ["shrink", value]
      }

      case "flex-flow": {
        if (value === "row") return ["flex-row"]
        if (value === "column") return ["flex-col"]
        if (value === "wrap") return ["flex-wrap"]
        return [prop, value]
      }
      case "align-items": {return ["items-" + value.replace(/^flex-/, "")]}
      case "align-self": {return ["self-" + value.replace(/^flex-/, "")]}
      case "justify-content": {return ["justify-" + value.replace(/^flex-|^space-/, "")]}

      case "padding": {
        const values = String(value).split(" ")
        const [top, right, bottom, left] = values
        switch (values.length) {
          case 1: {return ["p", value]}
          case 2: {return [[t("py", top), t("px", right)].join(" ")]}
          case 3: {return [[t("pt", top), t("px", right), t("pb", bottom)].join(" ")]}
          case 4: {return [[t("pt", top), t("pr", right), t("pb", bottom), t("pl", left)].join(" ")]}
        }
        return ["p", value]
      }

      case "background": {return ["bg", value]}
      case "box-shadow": {return ["shadow", value]}
      case "border-width":
        return ["border", value]

      case "border-radius": {
        if (value === "0") return ["rounded-none"]
        if (value === "100%") return ["rounded-full"]

        // @TODO: four side value to top, right, bottom, left

        const values = String(value).split(" ")
        const [top, right, bottom, left] = values
        switch (values.length) {
          case 1: {return ["rounded", value]}
          case 2: {return [[t("rounded-t", top), t("rounded-b", bottom)].join(" ")]}
          case 3: {return [[t("rounded-tl", top), t("rounded-tr", right), t("rounded-b", left)].join(" ")]}
          case 4: {return [[t("rounded-tl", top), t("rounded-tr", right), t("rounded-br", bottom), t("rounded-bl", left)].join(" ")]}
        }
        return ["rounded", value]
      }

      case "overflow": {
        if (value === "hidden") return ["overflow-hidden"]
        return ["overflow-" + value]
      }

      case "font-family": {return ["font", value]}
      case "font-weight": {
        switch (value) {
          case "100": {return ["font-thin"]}
          case "200": {return ["font-extralight"]}
          case "300": {return ["font-light"]}
          case "400": {return ["font-normal"]}
          case "500": {return ["font-medium"]}
          case "600": {return ["font-semibold"]}
          case "700": {return ["font-bold"]}
          case "800": {return ["font-extrabold"]}
          case "900": {return ["font-black"]}
        }
        return ["font-" + value]
      }
      case "font-size": {return ["text", value]}
      case "color": {return ["_text", value]}
      case "text-align": {return ["text-" + value]}
      case "line-height": {return ["leading", value]}
      case "letter-spacing": {return ["tracking", value]}
      case "white-space": {return ["whitespace-" + value]}

      case "text-decoration": {return [value]}
      case "text-transform": {return [value]}

      case "-webkit-line-clamp": {
        if (cls["max-w"] === "100%") delete cls["max-w"]
        delete cls["overflow-hidden"]
        delete cls["-webkit-box"]
        delete cls["-webkit-box-orient"]
        delete cls["nowrap"]
        return +value <= 6 ? ["line-clamp-" + value] : ["line-clamp", value]
      }
    }

    // @TODO: nowrap...

    return [prop, value]
  }

  function addClass(prop:string, value:string) {
    if (arguments.length === 2 && (value === null || value === undefined)) return
    [prop, value] = transform(prop, value)
    if (!prop) return
    cls[prop] = value
  }

  function generateHTML(node:SceneNode, content:string, tag = "div") {
    const classList = Object.entries(cls).map(([prop, value]) => t(prop, value)).join(" ")

    if (tag === "span" && !content) return ""
    if (tag === "span" && !classList) return content

    let code = ""
    let attrForPreview = `data-node-name="${node.name}" data-node-id="${node.id}"`

    if (node.type !== "TEXT" && tag === "div") code += `\n<!-- ${node.name} -->\n`
    code += `<${tag} ${CLASS_NAME}="${classList}" ${attrForPreview}>${content}</${tag}>`
    return code
  }

  return {init, addClass, generateHTML}
}

export const getGeneratedCode = (node:SceneNode) => i(node, createTailwindCSSBuilder)