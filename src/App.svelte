<script lang="ts">
import Preview from "./components/Preview/Preview.svelte"
import TreeItemItem from "./components/TreeItemItem.svelte"
import Assets from "./components/Panel/Assets.svelte"
import {writable} from "svelte/store"

let scriptCode = ""
let html = ""
let bg = ""
let pageBg = "#111"
let width = document.body.offsetWidth
let height = document.body.offsetHeight

const assetMap$ = writable({})

window.onmessage = (event) => {
  const type = event.data?.pluginMessage?.type

  if (type === "code") {
    console.warn("code", event.data.pluginMessage)

    assetMap$.set({})
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

    assetMap$.update((assetMap) => ({...assetMap, [id]: asset}))
    return
  }
}

$: assetMap = $assetMap$
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
    <Assets assetMap={$assetMap$}/>

    <section class="bb(#000.05)">
      <div class="font(12) bold p(10) bb(#000.05)">Code</div>
      <div class="relative font(10/1.6) c(#000) scroll-x">
        <div class="w(hug) p(10) code pre no-border" contenteditable="plaintext-only"
             spellcheck="false" on:copy|stopPropagation>{scriptCode}</div>
      </div>
    </section>
  </div>
</main>