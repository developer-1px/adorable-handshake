import {px} from "../libs/utils"
import {getGeneratedCode as i} from "./inlineStyle";

const makeAdorableValue = (value:string) => value.replace(/(\d+)px/g, (_, n) => n).replace(/\s+/g, "/")

const t = (prop:string, value:string|number) => {
  if (!value && value !== 0) return prop
  return `${prop}${value ? "(" + makeAdorableValue(value) + ")" : ""}`
}

// @TODO: TBD
const isReact = false
const CLASS_NAME = isReact ? "className" : "class"

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

    // @TODO: #000a -> #000.8, #000000aa -> #000000.5
    // value = value.replace(/#([0-9a-fA-F]{3,8})/g, (_, hex) => {
    //   if (hex.length === 3) return "#" + hex.split("").map(h => h + h).join("")
    //   if (hex.length === 4) return "#" + hex.split("").map(h => h + h).join("") + "ff"
    //   if (hex.length === 6) return "#" + hex + "ff"
    //   return "#" + hex
    // })

    switch (prop) {
      case "top": {return ["y", value]}
      case "left": {return ["x", value]}

      case "width": {return ["w", value]}
      case "min-width": {return ["min-w", value]}
      case "max-width": {return ["max-w", value]}

      case "height": {return ["h", value]}
      case "min-height": {return ["min-h", value]}
      case "max-height": {return ["max-h", value]}

      case "background": {return ["bg", value]}
      case "padding":
        return ["p", value]

      case "border":
        return ["b", value.split(" ").filter(v => v !== "1px" && v !== "solid").join(" ")]
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
      case "color": {return ["c", value]}
      case "text-align": {return ["text", value]}
      case "white-space": {return [value]}

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
            cls["hbox"] = "top";
            return [""]
          }
          if (value === "center") {return [""]}
          if (value === "baseline") {
            cls["hbox"] = "baseline";
            return [""]
          }
          if (value === "flex-end") {
            cls["hbox"] = "bottom";
            return [""]
          }
        }

        if ("vbox" in cls) {
          if (value === "flex-start") {
            cls["vbox"] = "left";
            return [""]
          }
          if (value === "center") {
            cls["vbox"] = "center";
            return [""]
          }
          if (value === "flex-end") {
            cls["vbox"] = "right";
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
            cls["hbox"] = plus(cls["hbox"], "center");
            return [""]
          }
          if (value === "flex-end") {
            cls["hbox"] = plus(cls["hbox"], "right");
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
            cls["vbox"] = plus("bottom", cls["vbox"]);
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
    const classList = Object.entries(cls).map(([prop, value]) => t(prop, value)).join(" ")

    if (tag === "span" && !content) return ""
    if (tag === "span" && !classList) return content

    return `<${tag} ${CLASS_NAME}="${classList}">${content}</${tag}>`
  }

  return {root, init, addClass, generateHTML}
})()

export const getGeneratedCode = (node:SceneNode) => {
  return i(node, createAdorableCSSBuilder)
}