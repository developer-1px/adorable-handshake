<script lang="ts">
import TreeItem from "./components/TreeItem.svelte";
import {_hoverNode, _selectNode} from "./store/store";

let scriptCode = ""
let html = ""
let bg = ""
let pageBg = "#111"
let width = document.body.offsetWidth
let height = document.body.offsetHeight

window.onmessage = (event) => {
  const type = event.data?.pluginMessage?.type

  if (type === "code") {
    const msg = event.data.pluginMessage
    const {code, backgroundColor, pageBackgroundColor, width: w, height: h} = msg

    html = msg.html
    scriptCode = code
    html = html
    bg = backgroundColor
    pageBg = pageBackgroundColor
    width = w
    height = h
    return
  }

  if (type === "assets") {
    const {id, svg} = event.data.pluginMessage
    document.querySelectorAll(`[data-node-id="${id}"]`).forEach((el) => {
      el.innerHTML = svg
    })
    return
  }
}

$: dom = new DOMParser().parseFromString(html, "text/html").body.children
$: console.log({dom})

let content:HTMLElement

let debounceTimer
let isPanning = false


const hoverNode = (e) => {
  if (isPanning) return

  const el = e.target.closest("[data-node-id]")
  if (!el) return _hoverNode(null)
  const nodeId = el.getAttribute("data-node-id")
  _hoverNode(nodeId)
}

const selectNode = (e) => {
  if (isPanning) return

  const el = e.target.closest("[data-node-id]")
  if (!el) return _selectNode(null)
  const nodeId = el.getAttribute("data-node-id")
  _selectNode(nodeId)
}

const selectNestedNode = (e) => {
  e.preventDefault()
  const el = e.target.closest("[data-node-id].selected")
  if (!el) return
  const nodeId = el.parentNode.getAttribute("data-node-id")
  if (!nodeId) return
  _selectNode(nodeId)
}


let zoomPanMatrix = new DOMMatrix()

const handleWheel = (event) => {
  isPanning = true
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    isPanning = false
  }, 250)

  if (event.ctrlKey || event.metaKey || event.shiftKey) {
    const {pageX, pageY} = event
    const rect = event.currentTarget.getBoundingClientRect()
    const mousePoint = new DOMPoint(pageX - rect.x, pageY - rect.y)
    const offsetPoint = zoomPanMatrix.inverse().transformPoint(mousePoint)
    const deltaScale = 1 - event.deltaY / (Math.abs(event.deltaY) === 240 ? 200 : 500)
    if (zoomPanMatrix.a * deltaScale < 0.25) return
    if (zoomPanMatrix.a * deltaScale > 4) return

    zoomPanMatrix = zoomPanMatrix.translate(offsetPoint.x, offsetPoint.y).scale(deltaScale).translate(-offsetPoint.x, -offsetPoint.y)
    zoomPanMatrix.a = Math.max(0.25, Math.min(zoomPanMatrix.a, 4))
  }
  else {
    const scale = zoomPanMatrix.a
    zoomPanMatrix = zoomPanMatrix.translate(-event.deltaX / scale, -event.deltaY / scale)
  }
}

const handleMouseMove = (e:MouseEvent) => {
  if (e.buttons === 1) {
    isPanning = true
    const scale = zoomPanMatrix.a
    zoomPanMatrix = zoomPanMatrix.translate(e.movementX / scale, e.movementY / scale)
  }
  else {
    isPanning = false
  }
}
</script>

<main class="layer hbox(fill) bg(--bg) clip" style:--bg={pageBg}>
  <div class="w(200) bg(#f9f9f9) br(#000.5) c(#000) scroll">
    <div class="ml(-20)">
      <TreeItem nodes={dom} depth={0}/>
    </div>
  </div>
  <div class="w(fill) vbox clip">
    <div class="h(fill) relative"
         on:wheel|preventDefault|stopPropagation={handleWheel}
         on:mousemove|preventDefault|stopPropagation={handleMouseMove}
    >
      <section class="layer pack >>cursor(default)"
               style:--bg={bg}
               style:transform-origin="0 0"
               style:transform="{zoomPanMatrix.toString()}"
               bind:this={content}
               on:mouseover={hoverNode}
               on:mouseleave={hoverNode}
               on:mouseenter={hoverNode}
               on:click={selectNode}
               on:dblclick={selectNestedNode}
      >
        <div class="relative bg(--bg) >static!+w(100%)+h(100%)"
             style:width="{width}px"
             style:height="{height}px">{@html html}</div>
      </section>
    </div>
  </div>
  <textarea class="w(400) h(fill) bg(#000) c(#fff) font(8/12)! monospace no-border" spellcheck="false"
            wrap="off">{scriptCode}</textarea>
</main>