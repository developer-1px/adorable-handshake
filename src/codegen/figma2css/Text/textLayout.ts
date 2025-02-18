import {addStyleHeight, addStyleWidth} from "../Layout/size"
import type {Style} from "../../shared"

export const getCssStyleTextLayout = (node: TextNode) => {
  let res: Style = {}

  const {textAutoResize} = node

  // Width, Height with Auto Resize
  switch (textAutoResize) {
    case "WIDTH_AND_HEIGHT":
      break

    case "HEIGHT":
      res = {...res, ...addStyleWidth(node)}
      break

    case "NONE":
    case "TRUNCATE":
      res = {...res, ...addStyleWidth(node)}
      res = {...res, ...addStyleHeight(node)}
      break
  }

  return res
}
