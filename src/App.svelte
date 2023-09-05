<script lang="ts">
import TreeItem from "./components/TreeItem.svelte";
import Preview from "./components/Preview/Preview.svelte"

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
    const {id, svg} = asset
    document.querySelectorAll(`[data-node-id="${id}"]`).forEach((el) => {
      el.innerHTML = svg
    })

    assetMap[id] = asset
    return
  }
}

$: dom = new DOMParser().parseFromString(html, "text/html").body.children
</script>

<main class="layer hbox(fill) clip">
  <div class="w(200) bg(#f9f9f9) br(#000.5) c(#000) scroll">
    <div class="w(hug) ml(-20)">
      <TreeItem nodes={dom} depth={0}/>
    </div>
  </div>

  <Preview {pageBg} {bg} {width} {height} {html} {scriptCode}/>

  <div class="w(400) c(#000) scroll-y">

    <section class="b(#000.05)">
      <div class="font(12) bold p(10) bb(#000.05)">Assets</div>

      <div class="hbox flex-wrap gap(4) p(10)">
        {#each Object.values(assetMap) as {svg}}
          <div class="w(48) h(48) b(#000.05) pack clip >svg:cover">{@html svg}</div>
        {/each}
      </div>
    </section>

    <section class="b(#000.05)">
      <div class="font(12) bold p(10) bb(#000.05)">Code</div>
      <div class="relative font(10/1.6) c(#000)">
        <div class="w(hug) p(10) code pre no-border" contenteditable="true" spellcheck="false">{scriptCode}</div>
      </div>
    </section>
  </div>
</main>