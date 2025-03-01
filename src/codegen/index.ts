import {getGeneratedCode as t} from "./modes/tailwindCSS"
import {getGeneratedCode as i} from "./inlineStyle"
import {getGeneratedCode as s} from "./modes/styledComponents"
import {getGeneratedCode as a} from "./modes/adorableCSS"
import {getGeneratedCode as f} from "./figmaDSL/figmaDSL"

export const OPTIONS = {
  type: "inlineStyle",
}

export const getGeneratedCode = (node) => {
  if (OPTIONS.type === "tailwindcss") return {title: "TailwindCSS", language: "HTML", code: t(node)}
  if (OPTIONS.type === "inlineStyle") return {title: "InlineStyle", language: "HTML", code: i(node)}
  if (OPTIONS.type === "styledComponent") return {title: "Styled Component", language: "JAVASCRIPT", code: s(node)}
  if (OPTIONS.type === "adorablecss") return {title: "AdorableCSS", language: "HTML", code: a(node)}
  if (OPTIONS.type === "figmaDSL") return {title: "figmaDSL", language: "javascript", code: f(node)}
  return {title: "InlineStyle", language: "HTML", code: i(node)}
}
