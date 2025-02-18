import type {Style} from "../../shared"

// 수평 정렬 스타일
function getHorizontalAlignmentStyle(node: TextNode): Style {
  const {textAutoResize, textAlignHorizontal} = node

  // WIDTH_AND_HEIGHT일때는 width: max-content로 처리 (한 줄로 고정)
  if (textAutoResize === "WIDTH_AND_HEIGHT") {
    return {
      "white-space": "nowrap",
      "width": "max-content",
    }
  }

  // LEFT는 기본값이므로 스타일 적용하지 않음
  if (textAlignHorizontal === "LEFT") {
    return {}
  }

  const alignmentMap = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    JUSTIFIED: "justify",
  }

  return {"text-align": alignmentMap[textAlignHorizontal]}
}

// 수직 정렬 스타일
function getVerticalAlignmentStyle(node: TextNode): Style {
  const {textAutoResize, textAlignVertical, textTruncation, maxLines} = node

  // 수직 정렬이 필요한 경우만 처리
  if (textAutoResize !== "NONE" && textAutoResize !== "TRUNCATE") {
    return {}
  }

  if (textAlignVertical === "TOP") {
    return {}
  }

  // 말줄임이 있는 경우
  if (textTruncation === "ENDING" && maxLines && maxLines >= 1) {
    return {
      "-webkit-box-pack": textAlignVertical === "CENTER" ? "center" : "end",
    }
  }

  // 일반적인 수직 정렬
  return {
    "display": "flex",
    "flex-flow": "column",
    "justify-content": textAlignVertical === "CENTER" ? "center" : "flex-end",
  }
}

// 텍스트 잘림 처리 스타일
function getTruncationStyle(node: TextNode): Style {
  const {textAutoResize, textTruncation, maxLines} = node

  if (textTruncation !== "ENDING") {
    return {}
  }

  // Case 1: 한 줄로 고정 (WIDTH_AND_HEIGHT)
  if (textAutoResize === "WIDTH_AND_HEIGHT") {
    return {}
  }

  // Case 2: 높이 자동 조절 (HEIGHT)
  if (textAutoResize === "HEIGHT") {
    // 한 줄 말줄임
    if (maxLines === 1) {
      return {
        "text-overflow": "ellipsis",
        "white-space": "nowrap",
        "overflow": "hidden",
      }
    }
    // 여러 줄 말줄임
    if (maxLines && maxLines > 1) {
      return {
        "overflow": "hidden",
        "display": "-webkit-box",
        "-webkit-box-orient": "vertical",
        "-webkit-line-clamp": maxLines,
      }
    }
  }

  return {}
}

// 텍스트 정렬 스타일
export const getCssStyleTextAlign = (node: TextNode): Style => {
  return {
    ...getHorizontalAlignmentStyle(node),
    ...getVerticalAlignmentStyle(node),
    ...getTruncationStyle(node),
  }
}
