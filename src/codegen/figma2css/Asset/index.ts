import {isAbsoluteLayout, type Style} from "../../shared"
import {getCssStylePosition} from "../Position"
import {addStyleHeight, addStyleWidth} from "../Layout/size"

export const generateAsset = (node: SceneNode, voidTag) => {
  let code = ""
  let style: Style = {}

  try {
    if (isAbsoluteLayout(node)) {
      style = {...style, ...getCssStylePosition(node)}
    }

    const isVector = node.exportSettings.length
      ? node.exportSettings.find((es) => es.format === "SVG")
      : !(node.findChild && node.findChild((child) => child.fills && child.fills.find((f) => f.visible && f.type === "IMAGE")))

    if (figma.mode !== "codegen") {
      if (isVector) {
        style = {...style, ...addStyleWidth(node)}
        style = {...style, ...addStyleHeight(node)}
        if (node.type === "ELLIPSE") {
          style["border-radius"] = "100%"
        }

        node
          .exportAsync({format: "SVG_STRING", useAbsoluteBounds: true})
          .then((content) => {
            const inlineSVG = content.replace(/pattern\d/g, (a) => a + node.id.replace(/[^a-zA-z0-9]/g, "-")).replace(/\n/g, "")
            figma.ui.postMessage({type: "assets", id: node.id, name: node.name, svg: inlineSVG})
          })
          .catch((e) => {
            console.warn("export failed: ", e)
          })
      } else {
        node
          .exportAsync({format: "PNG", useAbsoluteBounds: true, constraint: {type: "SCALE", value: 2}})
          .then((content) => {
            figma.ui.postMessage({type: "assets", id: node.id, name: node.name, png: content})
          })
          .catch((e) => {
            console.warn("export failed: ", e)
          })
      }
    }

    code = voidTag(isVector ? "picture" : "img", {style, "data-node-id": node.id}, code)
  } catch (e) {
    console.error(e)
    console.error("asset error node:", node)
  }

  return code
}
