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
    const {code, backgroundColor, pageBackgroundColor, width: w, height: h} = event.data.pluginMessage
    scriptCode = code
    html = code
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

const hoverNode = (e) => {
  if (isWheeling) return
  const el = e.target.closest("[data-node-id]")
  if (!el) return _hoverNode(null)
  const nodeId = el.getAttribute("data-node-id")
  _hoverNode(nodeId)
}

const selectNode = (e) => {
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


let wheelMatrix = new DOMMatrix()

let debounceTimer
let isWheeling = false

const handleWheel = (event) => {
  isWheeling = true
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    isWheeling = false
  }, 250)

  if (event.ctrlKey || event.metaKey || event.shiftKey) {
    const {pageX, pageY} = event
    const rect = event.currentTarget.getBoundingClientRect()
    const point = new DOMPoint(pageX - rect.x, pageY - rect.y)
    const newPoint = wheelMatrix.inverse().transformPoint(point)
    const deltaScale = 1 - event.deltaY / (Math.abs(event.wheelDeltaY) === 240 ? 200 : 500)
    if (wheelMatrix.a * deltaScale < 0.25) return
    if (wheelMatrix.a * deltaScale > 4) return

    wheelMatrix = wheelMatrix.translate(newPoint.x, newPoint.y).scale(deltaScale).translate(-newPoint.x, -newPoint.y)
    wheelMatrix.a = Math.max(0.25, Math.min(wheelMatrix.a, 4))
  }
  else {
    const scale = wheelMatrix.a
    wheelMatrix = wheelMatrix.translate(-event.deltaX / scale, -event.deltaY / scale)
  }
}
</script>

<main class="layer hbox(fill) bg(--bg) clip" style:--bg={pageBg}>
  <div class="w(280) bg(#f9f9f9) br(#000.5) c(#000) scroll">
    <TreeItem nodes={dom} depth={0} />
  </div>
  <div class="w(fill) vbox clip">
    <div class="h(fill) relative" on:wheel|preventDefault|stopPropagation={handleWheel}>
      <section class="layer pack >>cursor(default)"
               style:--bg={bg}
               style:transform-origin="0 0"
               style:transform="{wheelMatrix.toString()}"
               bind:this={content}
               on:mouseover={hoverNode}
               on:mouseleave={hoverNode}
               on:mouseenter={hoverNode}
               on:click={selectNode}
               on:dblclick={selectNestedNode}
      >
        <div class="relative bg(--bg) >static!+w(100%~)+h(100%~) clip"
             style:width="{width}px"
             style:height="{height}px">{@html html}</div>
      </section>
    </div>
    <div>{wheelMatrix.toString()}</div>
    <textarea class="w(fill) h(100) bg(#000) c(#fff) font(8/12)! monospace no-border" spellcheck="false"
              wrap="off">{scriptCode}</textarea>
  </div>
</main>