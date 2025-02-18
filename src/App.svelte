<script lang="ts">
import "./adorable-css@2.js"
import Preview from "./components/Preview/Preview.svelte"
import Assets from "./components/Panel/Assets.svelte"
import ResizeHandle from "./components/Window/ResizeHandle.svelte"

let html = $state("")
let scriptCode = $state("")
let bg = $state("")
let pageBg = $state("#111")
let width = $state(document.body.offsetWidth)
let height = $state(document.body.offsetHeight)
let assetMap$ = $state({})

window.onmessage = (event) => {
  const type = event.data?.pluginMessage?.type

  if (type === "code") {
    assetMap$ = {}
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
    const asset = event.data.pluginMessage
    const {id, svg, png} = asset

    console.warn("asset", asset)

    if (png) {
      const blob = new Blob([png], {type: "image/png"})
      const src = window.URL.createObjectURL(blob)
      asset.src = src
      document.querySelectorAll(`[data-node-id="${id}"]`).forEach((el) => {
        el.src = src
      })
    }
    else {
      document.querySelectorAll(`[data-node-id="${id}"]`).forEach((el) => {
        el.innerHTML = svg
      })
    }

    assetMap$[id] = asset
    return
  }
}

const assetMap = $derived(assetMap$)
const dom = $derived(new DOMParser().parseFromString(html, "text/html").body)


let codeWidth = $state(400)

function handleResize(e:PointerEvent) {
  e.preventDefault()
  e.stopPropagation()

  // drag
  const el = e.currentTarget as HTMLElement

  el.onpointermove = (e:PointerEvent) => {
    codeWidth += -e.movementX
  }

  el.onpointerup = () => {
    el.releasePointerCapture(e.pointerId); // 캡처 해제 추가
    el.onpointermove = null;
    el.onpointerup = null;
  };

  el.setPointerCapture(e.pointerId)
}
</script>

<main class="layer hbox(fill) clip">
<!--  <div class="w(200) bg(#f9f9f9) br(#000.5) c(#000) scroll">-->
<!--    <div class="w(hug) ml(-20)">-->
<!--      <TreeItemItem node={dom}/>-->
<!--    </div>-->
<!--  </div>-->

  <Preview {pageBg} {bg} {width} {height} {html} {scriptCode}/>

  <div class="w(400) relative c(#000) scroll-y" style:width="{codeWidth}px">
    <section class="bb(#000.05)">
      <div class="font(12) bold p(10) bb(#000.05)">Code</div>
      <div class="relative font(10/1.5) c(#000) scroll-x">
        <div class="p(10) code pre no-border nowrap" contenteditable="plaintext-only"
             spellcheck="false" oncopy={e => e.stopPropagation()}>{scriptCode}</div>
      </div>
    </section>

    <Assets {assetMap}/>

    <div class="layer(left) w(8) ew-resize" onpointerdown={handleResize}></div>
  </div>
</main>

<ResizeHandle/>