<script lang="ts">
import {_hoverNode, _selectNode} from "../../store/store"

export let pageBg:string
export let bg:string
export let width:number
export let height:number
export let html:string

export let scriptCode:string


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


<div class="w(fill) vbox clip bg(--bg)" style:--bg={pageBg}>
  <div class="h(fill) relative"
       on:wheel|preventDefault|stopPropagation={handleWheel}
       on:mousemove|preventDefault|stopPropagation={handleMouseMove}
  >
    <section class="layer pack >>cursor(default)"
             style:transform-origin="0 0"
             style:transform="{zoomPanMatrix.toString()}"
             bind:this={content}
             on:mouseover={hoverNode}
             on:mouseleave={hoverNode}
             on:mouseenter={hoverNode}
             on:click={selectNode}
             on:dblclick={selectNestedNode}
    >
      <div class="relative bg(--bg) >relative!+w(100%)+h(100%)"
           style:--bg={bg}
           style:width="{width}px"
           style:height="{height}px">{@html html}</div>
    </section>
  </div>
</div>
