export interface Style {
  [key: string]: string | number
}

export const isAbsoluteLayout = (node: FrameNode | TextNode) => {
  const selection = figma.currentPage.selection
  if (node === selection[0]) {
    return false
  }

  if (node.layoutPositioning === "ABSOLUTE") {
    return true
  }

  if (!node.parent?.layoutMode || node.parent?.layoutMode === "NONE") {
    return true
  }

  return false
}
