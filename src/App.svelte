<script lang="ts">
import TreeItem from "./components/TreeItem.svelte";
import Preview from "./components/Preview/Preview.svelte"
import JSZip from "jszip"
import TreeItemItem from "./components/TreeItemItem.svelte"
import Assets from "./components/Panel/Assets.svelte"

let scriptCode = ""
let html = ""
let bg = ""
let pageBg = "#111"
let width = document.body.offsetWidth
let height = document.body.offsetHeight

let assetMap = {}

window.onmessage = (event) => {
  const type = event.data?.pluginMessage?.type

  if (type === "code") {
    console.warn("code", event.data.pluginMessage)

    assetMap = {}
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
    console.warn("assets", event.data.pluginMessage)

    const asset = event.data.pluginMessage
    const {id, svg, png} = asset

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

    assetMap[id] = asset
    return
  }
}

$: dom = new DOMParser().parseFromString(html, "text/html").body
</script>

<main class="layer hbox(fill) clip">
  <div class="w(200) bg(#f9f9f9) br(#000.5) c(#000) scroll">
    <div class="w(hug) ml(-20)">
      <TreeItemItem node={dom}/>
    </div>
  </div>

  <Preview {pageBg} {bg} {width} {height} {html} {scriptCode}/>

  <div class="w(400) c(#000) scroll-y">
    <Assets {assetMap}/>

    <section class="bb(#000.05)">
      <div class="font(12) bold p(10) bb(#000.05)">Code</div>
      <div class="relative font(10/1.6) c(#000) scroll-x">
        <div class="w(hug) p(10) code pre no-border" contenteditable="plaintext-only" spellcheck="false">{scriptCode}</div>
      </div>
    </section>
  </div>
</main>


<style>
.checkboard {
  --size: 12px;
  --color: rgba(0, 0, 0, .2);
  background-color: rgba(0, 0, 0, .05);
  background-size: var(--size) var(--size);
  background-position: 0 0, calc(var(--size) / 2) calc(var(--size) / 2);
  background-image: linear-gradient(45deg, var(--color) 25%, transparent 25%, transparent 75%, var(--color) 75%, var(--color)),
  linear-gradient(45deg, var(--color) 25%, transparent 25%, transparent 75%, var(--color) 75%, var(--color));
}
</style>