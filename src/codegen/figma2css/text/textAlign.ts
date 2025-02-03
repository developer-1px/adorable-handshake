import type {Style} from "../../shared"

export const getCssStyleTextAlign = (node: TextNode) => {
  const {textAutoResize, textAlignHorizontal, textAlignVertical, textTruncation, maxLines} = node

  const res: Style = {}

  // textAlign
  if (textAutoResize !== "WIDTH_AND_HEIGHT") {
    // textAlign Horizontal
    const HORIZONTAL_ALIGN = {
      LEFT: "left",
      CENTER: "center",
      RIGHT: "right",
      JUSTIFIED: "justify",
    }
    if (textAlignHorizontal !== "LEFT") {
      res["text-align"] = HORIZONTAL_ALIGN[textAlignHorizontal]
    }
  }

  // textTruncation
  if (textTruncation === "ENDING") {
    // one line
    if (textAutoResize === "WIDTH_AND_HEIGHT") {
      res["white-space"] = "nowrap"
    }
    // auto-height
    else if (textAutoResize === "HEIGHT") {
      if (maxLines && maxLines === 1) {
        res["text-overflow"] = "ellipsis"
        res["white-space"] = "nowrap"
        res["overflow"] = "hidden"
      } else if (maxLines && maxLines > 1) {
        res["overflow"] = "hidden"
        res["display"] = "-webkit-box"
        res["-webkit-box-orient"] = "vertical"
        res["-webkit-line-clamp"] = maxLines
      }
    }
  }

  // textAlign Vertical
  if (textAutoResize === "NONE" || textAutoResize === "TRUNCATE") {
    if (textAlignVertical === "CENTER" || textAlignVertical === "BOTTOM") {
      if (textTruncation === "ENDING" && maxLines >= 1) {
        if (textAlignVertical === "CENTER") {
          res["-webkit-box-pack"] = "center"
        }
        if (textAlignVertical === "BOTTOM") {
          res["-webkit-box-pack"] = "end"
        }
      } else {
        res.display = "flex"
        res.flexFlow = "column"
        if (textAlignVertical === "CENTER") {
          res["justify-content"] = "center"
        }
        if (textAlignVertical === "BOTTOM") {
          res["justify-content"] = "flex-end"
        }
      }
    }
  }

  return res
}
