// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {themeColors: true, width: 360, height: 600})



const returnPluginMessage = async (guid:string, callback:Function) => {
  try {
    const value = await callback()
    figma.ui.postMessage({type: "returnValue", guid, value})
    refresh()
  }
  catch (e) {
    figma.ui.postMessage({type: "returnValue", guid, value: e, reject: true})
    refresh()
  }
}

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  const [guid, type, ...args] = msg

  switch (type) {
    case "startKlean": {
      return returnPluginMessage(guid, async () => {
        return sendSelection()
      })
    }

    case "selectNode": {
      return returnPluginMessage(guid, async () => {
        return (figma.currentPage.selection = [figma.getNodeById(args[0])])
      })
    }

    case "notify": {
      return returnPluginMessage(guid, async () => {
        return figma.notify(...args)
      })
    }

    case "applyFillStyle": {
      const [style, nodeId] = args

      return returnPluginMessage(guid, async () => {
        // localPaintStyles
        if (figma.getLocalPaintStyles().find(s => s.id === style.id)) {
          const node = figma.getNodeById(nodeId)
          node.fillStyleId = style.id
          return style
        }

        // remotePaintStyles
        return figma.importStyleByKeyAsync(style.key || style.id).then(importedStyle => {
          const node = figma.getNodeById(nodeId)
          node.fillStyleId = importedStyle.id

          return Object.assign({}, style, importedStyle)
        })
      })
    }

    case "applyStorkeStyle": {
      const [style, nodeId] = args

      return returnPluginMessage(guid, async () => {
        // localPaintStyles
        if (figma.getLocalPaintStyles().find(s => s.id === style.id)) {
          const node = figma.getNodeById(nodeId)
          node.strokeStyleId = style.id
          return style
        }

        // remotePaintStyles
        return figma.importStyleByKeyAsync(style.key || style.id).then(importedStyle => {
          const node = figma.getNodeById(nodeId)
          node.strokeStyleId = style.id
          return Object.assign({}, style, importedStyle)
        })
      })
    }

    case "applyTextStyle": {
      const [style, nodeId] = args

      return returnPluginMessage(guid, async () => {
        // localTextStyles, localTextStyles
        if (figma.getLocalTextStyles().find(s => s.id === style.id)) {
          const node = figma.getNodeById(nodeId)
          node.textStyleId = style.id
          return style
        }

        return figma.importStyleByKeyAsync(style.key || style.id.slice(2, -1)).then(importedStyle => {
          const node = figma.getNodeById(nodeId)
          node.textStyleId = importedStyle.id
          return Object.assign({}, style, importedStyle)
        })
      })
    }
  }
}


const traverse = (node, callback) => {
  callback(node)
  if (node.children && node.children.length) {
    node.children.forEach(child => traverse(child, callback))
  }
}

const makeNode = (node) => {
  if (!node) return null

  try {
    let {id, name, type, fills, fillStyleId, strokes, strokeStyleId, backgroundStyleId, characters, children, textStyleId, fontName, fontSize, lineHeight} = node

    if (fills === figma.mixed) {
      fills = node.getRangeFills(0, 1)
      fillStyleId = node.getRangeFills(0, 1)
    }

    if (fontName === figma.mixed) {
      fontName = node.getRangeFontName(0, 1)
      fontSize = node.getRangeFontSize(0, 1)
      lineHeight = node.getRangeLineHeight(0, 1)
    }

    if (children) {
      children = children.map(makeNode).filter(Boolean)
    }

    return {id, name, type, fills, fillStyleId, strokes, strokeStyleId, backgroundStyleId, characters, children, textStyleId, fontName, fontSize, lineHeight}
  }
  catch (e) {
    return null
  }
}

const makePaintStyle = (style) => {
  const {id, name, description, key, paints} = style
  return {id, name, description, key, paints}
}

const makeTextStyle = (style) => {
  const {id, name, type, fontSize, textDecoration, fontName, letterSpacing, lineHeight, paragraphIndent, paragraphSpacing, textCase} = style
  return {id, name, type, fontSize, textDecoration, fontName, letterSpacing, lineHeight, paragraphIndent, paragraphSpacing, textCase}
}

const doLint = (selection) => {
  const selectionNodes = selection.map(makeNode).filter(Boolean)
  const localPaintStyles = figma.getLocalPaintStyles().map(makePaintStyle)
  const localTextStyles = figma.getLocalTextStyles().map(makeTextStyle)
  figma.ui.postMessage({type: "lint", selectionNodes, localPaintStyles, localTextStyles})
}

let currentSelectionIds = []
const sendSelection = () => {
  const selection = figma.currentPage.selection || []
  currentSelectionIds = selection.map(node => node.id)
  doLint(selection)
}

const refresh = () => {
  console.warn("currentSelectionIdscurrentSelectionIds", currentSelectionIds)
  const selection = currentSelectionIds.map(id => figma.getNodeById(id)).filter(Boolean)
  doLint(selection)
}

figma.on("documentchange", (e) => {
  console.warn("documentchangedocumentchangedocumentchange", e)
  refresh()
})
