<script lang="ts">
import Preview from "./components/Preview/Preview.svelte"
import Assets from "./components/Panel/Assets.svelte"

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
</script>

<main class="layer hbox(fill) clip">
<!--  <div class="w(200) bg(#f9f9f9) br(#000.5) c(#000) scroll">-->
<!--    <div class="w(hug) ml(-20)">-->
<!--      <TreeItemItem node={dom}/>-->
<!--    </div>-->
<!--  </div>-->

  <Preview {pageBg} {bg} {width} {height} {html} {scriptCode}/>

  <div class="w(400) c(#000) scroll-y">
    <Assets {assetMap}/>

    <section class="bb(#000.05)">
      <div class="font(12) bold p(10) bb(#000.05)">Code</div>
      <div class="relative font(10/1.6) c(#000) scroll-x">
        <div class="w(hug) p(10) code pre no-border" contenteditable="plaintext-only"
             spellcheck="false" oncopy={e => e.stopPropagation()}>{scriptCode}</div>
      </div>
    </section>
  </div>
</main>