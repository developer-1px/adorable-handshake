import {writable} from "svelte/store";

export const selectedNodeId$ = writable<string>(null)

export const _hoverNode = (nodeId:string) => {
  document.querySelector(".hovered-guide")?.classList.remove("hovered-guide")
  const el = document.querySelector(`[data-node-id="${nodeId}"]`)
  if (!el) return
  el.classList.add("hovered-guide")
}

export const _selectNode = (nodeId:string) => {
  selectedNodeId$.set(nodeId)
  parent.postMessage({pluginMessage: {type: "selectNode", id: nodeId}}, "*")

  document.querySelector(".selected")?.classList.remove("selected")
  const el = document.querySelector(`[data-node-id="${nodeId}"]`)
  if (!el) return
  el.classList.add("selected")
}