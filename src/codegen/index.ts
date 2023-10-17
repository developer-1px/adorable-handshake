import {OPTIONS} from "../libs/utils";
import {getGeneratedCode as a} from "./adorableCSS";
import {getGeneratedCode as t} from "./tailwindCSS"
import {getGeneratedCode as i} from "./inlineStyle"
import {getGeneratedCode as s} from "./styledComponents"
import {getGeneratedCode as fa} from "./flutterAdorable"

export const getGeneratedCode = (node) => {
  if (OPTIONS.type === "adorablecss") return {title: "AdorableCSS", language: "HTML", code: a(node)}
  if (OPTIONS.type === "tailwindcss") return {title: "TailwindCSS", language: "HTML", code: t(node)}
  if (OPTIONS.type === "inlineStyle") return {title: "InlineStyle", language: "HTML", code: i(node)}
  if (OPTIONS.type === "styledComponent") return {title: "Styled Component", language: "JAVASCRIPT", code: s(node)}
  if (OPTIONS.type === "flutterAdorable") return {title: "FlutterAdorable", language: "DART", code: fa(node)}
  return {title: "InlineStyle", language: "HTML", code: i(node)}
}