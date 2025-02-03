import {getGeneratedCode as i} from "../inlineStyle"
import {textStyles} from "../../mock/textStyles"
import {generateCVATemplate} from "../vartiant"
import type {Style} from "../shared"

const makeTailwindValue = (value: string) => String(value).replace(/\s+/g, "_")

function transform(prop: string, value: string | number): [string, string?] {
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
      if (value === "fit-content") return ["w-fit"]
      return ["w", value]
    }
    case "min-width": {
      return ["min-w", value]
    }
    case "max-width": {
      return ["max-w", value]
    }

    case "height": {
      if (value === "100%") return ["h-full"]
      if (value === "fit-content") return ["h-fit"]
      return ["h", value]
    }
    case "min-height": {
      return ["min-h", value]
    }
    case "max-height": {
      return ["max-h", value]
    }

    case "position": {
      return [value]
    }
    case "display": {
      if (value === "none") return ["hidden"]
      return [value]
    }

    case "flex": {
      if (value === "1") return ["flex-1"]
      return ["flex", value]
    }
    case "flex-shrink": {
      switch (value) {
        case "0": {
          return ["shrink-0"]
        }
        case "1": {
          return ["shrink-1"]
        }
      }
      return ["shrink", value]
    }

    case "flex-flow": {
      if (value === "row") return ["flex-row"]
      if (value === "column") return ["flex-col"]
      if (value === "wrap") return ["flex-wrap"]
      return [prop, value]
    }
    case "align-items": {
      return ["items-" + value.replace(/^flex-/, "")]
    }
    case "align-self": {
      return ["self-" + value.replace(/^flex-/, "")]
    }
    case "justify-content": {
      return ["justify-" + value.replace(/^flex-|^space-/, "")]
    }

    case "padding": {
      const values = String(value).split(" ")
      const [top, right, bottom, left] = values
      switch (values.length) {
        case 1: {
          return ["p", value]
        }
        case 2: {
          return [[t("py", top), t("px", right)].join(" ")]
        }
        case 3: {
          return [[t("pt", top), t("px", right), t("pb", bottom)].join(" ")]
        }
        case 4: {
          return [[t("pt", top), t("pr", right), t("pb", bottom), t("pl", left)].join(" ")]
        }
      }
      return ["p", value]
    }

    case "background": {
      return ["bg", value]
    }
    case "box-shadow": {
      return ["shadow", value]
    }
    case "border": {
      // border to tailwind
      const values = value.split(" ")
      const [width, style, color] = values
      const classes = []

      // Width handling
      if (width) {
        const numWidth = parseInt(width)
        if (numWidth === 1) {
          classes.push("border")
        } else if ([0, 2, 4, 8].includes(numWidth)) {
          classes.push(`border-${numWidth}`)
        } else {
          // Default to closest supported value
          const supportedWidths = [0, 1, 2, 4, 8]
          const closest = supportedWidths.reduce((prev, curr) => (Math.abs(curr - numWidth) < Math.abs(prev - numWidth) ? curr : prev))
          classes.push(closest === 1 ? "border" : `border-${closest}`)
        }
      }

      // Style handling
      if (style) {
        const supportedStyles = ["solid", "dashed", "dotted", "double", "none"]
        if (supportedStyles.includes(style)) {
          classes.push(`border-${style}`)
        }
      }

      // Color handling
      if (color) {
        const colorClass = t("border", color)
        if (colorClass) {
          classes.push(colorClass)
        }
      }

      return [classes.join(" ")]
    }
    case "border-width": {
      return ["border", value]
    }

    // outline
    case "outline": {
      return [
        value
          .split(/\s+/)
          .map((v) => {
            // px -> number
            if (v.endsWith("px")) {
              return "outline-" + Number(v.replace("px", ""))
            }
            // color
            if (v.startsWith("#")) {
              return t("outline", v)
            }

            return "outline-" + v
          })
          .join(" "),
      ]
    }

    case "outline-offset": {
      if (value === "0") return ["outline-offset-0"]
      if (parseInt(value) < 0) return ["-outline-offset-" + Math.abs(parseInt(value))]
      return ["outline-offset", value]
    }

    case "border-radius": {
      if (value === "0") return ["rounded-none"]
      if (value === "100%") return ["rounded-full"]

      // @TODO: four side value to top, right, bottom, left

      const values = String(value).split(" ")
      const [top, right, bottom, left] = values
      switch (values.length) {
        case 1: {
          return ["rounded", value]
        }
        case 2: {
          return [[t("rounded-t", top), t("rounded-b", bottom)].join(" ")]
        }
        case 3: {
          return [[t("rounded-tl", top), t("rounded-tr", right), t("rounded-b", left)].join(" ")]
        }
        case 4: {
          return [[t("rounded-tl", top), t("rounded-tr", right), t("rounded-br", bottom), t("rounded-bl", left)].join(" ")]
        }
      }
      return ["rounded", value]
    }

    case "overflow": {
      if (value === "hidden") return ["overflow-hidden"]
      return ["overflow-" + value]
    }

    case "font-family": {
      return ["font", value]
    }
    case "font-weight": {
      switch (value) {
        case "100": {
          return ["font-thin"]
        }
        case "200": {
          return ["font-extralight"]
        }
        case "300": {
          return ["font-light"]
        }
        case "400": {
          return ["font-normal"]
        }
        case "500": {
          return ["font-medium"]
        }
        case "600": {
          return ["font-semibold"]
        }
        case "700": {
          return ["font-bold"]
        }
        case "800": {
          return ["font-extrabold"]
        }
        case "900": {
          return ["font-black"]
        }
      }
      return ["font-" + value]
    }
    case "font-size": {
      return ["text", value]
    }
    case "color": {
      return ["_text", value]
    }
    case "text-align": {
      return ["text-" + value]
    }
    case "line-height": {
      return ["leading", value]
    }
    case "letter-spacing": {
      return ["tracking", value]
    }
    case "white-space": {
      return ["whitespace-" + value]
    }

    case "text-decoration": {
      return [value]
    }
    case "text-transform": {
      return [value]
    }

    case "-webkit-line-clamp": {
      // if (cls["max-w"] === "100%") delete cls["max-w"]
      // delete cls["overflow-hidden"]
      // delete cls["-webkit-box"]
      // delete cls["-webkit-box-orient"]
      // delete cls["nowrap"]
      return +value <= 6 ? ["line-clamp-" + value] : ["line-clamp", value]
    }
  }

  // @TODO: nowrap...
  return [prop, value]
}

const t = (prop: string, value: string) => {
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

export const styleToTailwind = (style: Style) => {
  let classList = Object.entries(style)
    .map(([prop, value]) => transform(prop, value))
    .map(([prop, value]) => t(prop, value))
    .filter((value) => {
      // tailwind css의 기본값들은 제거
      if (value === "items-start") return false
      if (value === "justify-start") return false
      return true
    })
    .join(" ")

  classList = classList.replace(/left-0 right-0 top-0 bottom-0/g, "inset-0")
  classList = classList.replace(/overflow-hidden -webkit-box -webkit-box-orient-\[vertical] line-clamp-/g, "line-clamp-")

  return classList
}
const createTailwindCSSBuilder = (node: FrameNode) => {
  function init() {}

  function generateHTML(node: SceneNode, cls, content: string, tag = "div") {
    // @FIXME: 중복코드
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

    let classList = Object.entries(cls)
      .map(([prop, value]) => transform(prop, value))
      .map(([prop, value]) => t(prop, value))
      .filter((value) => {
        // tailwind css의 기본값들은 제거
        if (value === "items-start") return false
        if (value === "justify-start") return false
        return true
      })
      .join(" ")

    classList = classList.replace(/left-0 right-0 top-0 bottom-0/g, "inset-0")
    classList = classList.replace(/overflow-hidden -webkit-box -webkit-box-orient-\[vertical] line-clamp-/g, "line-clamp-")

    if (tag === "span" && !content) return ""
    if (tag === "span" && !classList) return content

    let code = ""
    // let attrForPreview = `data-node-name="${node.name}" data-node-id="${node.id}"`
    let attrForPreview = ``

    if (node.type !== "TEXT" && tag === "div") code += `\n<!-- ${node.name} -->\n`
    code += `<${tag} ${CLASS_NAME}="${classList}" ${attrForPreview}>${content}</${tag}>`
    return code
  }

  function build(code: string) {
    const variants = node.variantGroupProperties || {
      style: {values: ["white"]},
      state: {values: ["enabled", "hover"]},
      device: {values: ["pc", "mobile"]},
    }

    console.log("variantsvariants", variants)
    // variantGroupProperties

    code = [`<script setup lang="ts">\n${generateCVATemplate(variants)}\n</script>`, code].join("\n\n")

    return code
  }

  return {init, generateHTML, build}
}

export const getGeneratedCode = (node: SceneNode) => i(node, createTailwindCSSBuilder)
