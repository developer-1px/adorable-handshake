import {getGeneratedCode as i} from "./inlineStyle"
import {makeFileName} from "../libs/utils"

const shortHex = (hex:string) => {
  // #000000 -> #000
  return hex.length === 6 && hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5] ? hex[0] + hex[2] + hex[4] : hex
}
const makeAdorableValue = (value:string) => {
  return value
    .replace(/(\d+)px/g, (_, n) => n)
    .replace(/\s+/g, "/")
    .replace(/#([0-9a-fA-F]{4,8})/g, (_, hex) => {
      if (hex.length === 4) return "#" + hex.slice(0, 3) + (parseInt(hex.slice(3), 16) / 255).toFixed(2).slice(1)
      if (hex.length === 8) return "#" + shortHex(hex.slice(0, 6)) + (parseInt(hex.slice(6), 16) / 255).toFixed(2).replace(/0$/, "").slice(1)
        return "#" + hex
    })
}

const t = (prop:string, value:string|number) => {
  if (!value && value !== 0) return prop
  return `${prop}${value ? "(" + makeAdorableValue(value) + ")" : ""}`
}

// @TODO: TBD
const isJSX = true
const isClassName = false

const COMMENT_START = isJSX ? "{/*" : "<!--"
const COMMENT_END = isJSX ? "*/}" : "-->"
const CLASS_NAME = isClassName ? "className" : "class"

const createAdorableCSSBuilder = ((root = [], styledMap1 = {}, styledMap2 = {}) => (node:FrameNode, cls:Record<string, string> = {}) => {

  const plus = (a:string, b:string) => {
    if (!a) return b
    if (!b) return a
    return a + "+" + b
  }

  function init() {
    root.length = 0
    styledMap1 = {}
    styledMap2 = {}
  }

  function transform(prop:string, value:string|number):[string, string?] {
    value = String(value)

    switch (prop) {
      case "left": {
        if (value === "50%") {
          delete cls["transform"]
          return ["x", "center"]
        }

        if (value.startsWith("calc(50% + ")) {
          value = value.slice("calc(50% + ".length, -1)
          value = "center" + (value.startsWith("-") ? value : "+" + value)
          delete cls["transform"]
        }
        return ["x", value]
      }
      case "top": {
        if (value === "50%") {
          delete cls["transform"]
          return ["y", "center"]
        }

        if (value.startsWith("calc(50% + ")) {
          value = value.slice("calc(50% + ".length, -1)
          value = "center" + (value.startsWith("-") ? value : "+" + value)
          delete cls["transform"]
        }
        return ["y", value]
      }

      case "bottom": {
        // layer
        if ("absolute" in cls && cls["x"] === "0" && cls["y"] === "0" && cls["right"] === "0" && value === "0") {
          delete cls["absolute"]
          delete cls["x"]
          delete cls["y"]
          delete cls["right"]
          return ["layer"]
        }
        return [prop, value]
      }

      case "width": {return ["w", value]}
      case "min-width": {return ["min-w", value]}
      case "max-width": {return ["max-w", value]}

      case "height": {return ["h", value]}
      case "min-height": {return ["min-h", value]}
      case "max-height": {return ["max-h", value]}

      case "background": {return ["bg", value]}
      case "padding": {return ["p", value]}

      case "border": {
        return ["b", value.split(" ").filter(v => v !== "1px" && v !== "solid").join(" ")]
      }
      case "border-width":
        return ["bw", value]
      case "border-radius":
        return ["r", value]

      case "font-family": {return ["@font", value.replace(/\s/g, "_")]}
      case "font-size": {return ["font", value]}
      case "line-height": {
        if (cls["font"]) return ["font", cls["font"] + "/" + value]
        return ["line-height", value]
      }
      case "letter-spacing": {
        if (cls["font"]) return ["font", cls["font"] + "/" + value]
        return ["letter-spacing", value]
      }
      case "font-weight": {
        switch (value) {
          case "100": {return ["thin"]}
          case "200": {return ["light"]}
          case "300": {return ["demiLight"]}
          case "500": {return ["medium"]}
          case "600": {return ["semibold"]}
          case "700": {return ["bold"]}
          case "900": {return ["heavy"]}
        }
        return [value]
      }

      case "text-decoration": {return [value]}
      case "text-transform": {return [value]}

      case "color": {return ["c", value]}
      case "text-align": {return ["text", value]}
      case "white-space": {return [value]}

      //
      case "position": {return [value]}

      case "display": {
        if (value === "flex") return [""]
        return [value]
      }
      case "flex-flow": {
        if (value === "row") return ["hbox", ""]
        if (value === "column") return ["vbox", ""]
        if (value === "wrap") return ["wrap", ""]
        return [prop, value]
      }

      case "align-items": {
        if ("hbox" in cls) {
          if (value === "flex-start") {
            cls["hbox"] = "top"
            return [""]
          }
          if (value === "center") {return [""]}
          if (value === "baseline") {
            cls["hbox"] = "baseline"
            return [""]
          }
          if (value === "flex-end") {
            cls["hbox"] = "bottom"
            return [""]
          }
        }

        if ("vbox" in cls) {
          if (value === "flex-start") {
            cls["vbox"] = "left"
            return [""]
          }
          if (value === "center") {
            cls["vbox"] = "center"
            return [""]
          }
          if (value === "flex-end") {
            cls["vbox"] = "right"
            return [""]
          }
        }

        if ("wrap" in cls) {
          if (value === "flex-start") {
            cls["wrap"] = "top"
            return [""]
          }
          if (value === "center") {return [""]}
          if (value === "baseline") {
            cls["wrap"] = "baseline"
            return [""]
          }
          if (value === "flex-end") {
            cls["wrap"] = "bottom"
            return [""]
          }
        }

        return ["items-" + value.replace(/^flex-/, "")]
      }

      case "justify-content": {
        if (value === "space-between") return ["gap(auto)"]

        if ("hbox" in cls) {
          if (value === "flex-start") {return [""]}
          if (value === "center") {
            if (cls["hbox"] === "") {
              delete cls["hbox"]
              return ["pack"]
            }
            cls["hbox"] = plus(cls["hbox"], "center")
            return [""]
          }
          if (value === "flex-end") {
            cls["hbox"] = plus(cls["hbox"], "right")
            return [""]
          }
        }

        if ("vbox" in cls) {
          if (value === "flex-start") {return [""]}
          if (value === "center") {
            if (cls["vbox"] === "center") {
              delete cls["vbox"]
              return ["vpack"]
            }
            cls["vbox"] = plus("middle", cls["vbox"])
            return [""]
          }
          if (value === "flex-end") {
            cls["vbox"] = plus("bottom", cls["vbox"])
            return [""]
          }
        }

        if ("wrap" in cls) {
          if (value === "flex-start") {return [""]}
          if (value === "center") {
            if (cls["wrap"] === "") {
              delete cls["wrap"]
              return ["pack"]
            }
            cls["wrap"] = plus(cls["wrap"], "center")
            return [""]
          }
          if (value === "flex-end") {
            cls["wrap"] = plus(cls["wrap"], "right")
            return [""]
          }
        }

        return ["justify-" + value.replace(/^flex-|^space-/, "")]
      }

      case "flex-shrink": { return [""]}
      case "flex": {
        if (node.parent.layoutMode === "HORIZONTAL") {
          return ["w", "fill"]
        }
        if (node.parent.layoutMode === "VERTICAL") {
          return ["h", "fill"]
        }
        return ["flex", value]
      }
      case "align-self": {
        if (node.parent.layoutMode === "HORIZONTAL") {
          return ["h", "fill"]
        }
        if (node.parent.layoutMode === "VERTICAL") {
          return ["w", "fill"]
        }
        return ["self-" + value.replace(/^flex-/, "")]
      }

      case "overflow": {
        if (value === "hidden") return ["clip"]
        return ["overflow", value]
      }

      case "-webkit-line-clamp": {
        if (cls["max-w"] === "100%") delete cls["max-w"]
        delete cls["clip"]
        delete cls["-webkit-box"]
        delete cls["-webkit-box-orient"]
        delete cls["nowrap"]
        return value === "1" ? ["nowrap..."] : ["max-lines", value]
      }

      case "-webkit-text-fill-color": {
        // @TODO:
        const color = cls["bg"]
        delete cls["bg"]
        delete cls["-webkit-background-clip"]
        delete cls["-webkit-text-fill-color"]
        return ["c", color]
      }

      case "filter": {
        return [value]
      }
    }

    return [prop, value]
  }

  function addClass(prop:string, value:string) {
    if (arguments.length === 2 && (value === null || value === undefined)) return
    [prop, value] = transform(prop, value)
    if (!prop) return
    cls[prop] = value
  }

  function generateHTML(node:SceneNode, content:string, tag = "div") {
    let code = ""
    const attrForPreview = ""//` data-node-name="${node.name}" data-node-id="${node.id}"`
    const classList = Object.entries(cls).map(([prop, value]) => t(prop, value)).join(" ")

    if (tag === "span" && !content) return ""
    if (tag === "span" && !classList) return content

    if (node.type !== "TEXT" && tag !== "span") code += `\n${COMMENT_START} ${node.name} ${COMMENT_END}\n`
    if (tag === "img") {
      const width = Math.floor(node.width) || 0
      const height = Math.floor(node.height) || 0
      const src = makeFileName(`${node.name}${node.id}.png`)
      code += `<img ${CLASS_NAME}="${classList}" width="${width}" height="${height}" src="${src}" alt=""${attrForPreview}/>`
    }
    else if (tag === "picture") {
      const width = Math.floor(node.width) || 0
      const height = Math.floor(node.height) || 0
      const src = makeFileName(`${node.name}${node.id}.svg`)
      code += `<${tag} ${CLASS_NAME}="${classList} pack"${attrForPreview}>\n`
      code += `  <img width="${width}" height="${height}" src="${src}" alt=""${attrForPreview}/>\n`
      code += `</${tag}>\n`
    }
    else code += `<${tag} ${CLASS_NAME}="${classList}"${attrForPreview}>${content}</${tag}>`

    return code
  }

  function build(code:string, node:FrameNode) {

    console.warn(root)

    const head = root.join("\n")

    return code
  }

  return {init, addClass, generateHTML, build}
})()

export const getGeneratedCode = (node:FrameNode) => {
  return i(node, createAdorableCSSBuilder)
}