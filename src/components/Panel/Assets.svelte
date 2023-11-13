<script lang="ts">
import JSZip from "jszip"
import {makeFileName} from "../../libs/utils"

export let assetMap = {}

const saveAs = (blob:Blob, filename:string) => {
  const link = document.createElement("a")
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  link.click()
  link.remove()
  window.URL.revokeObjectURL(link.href)
}

const downloadZip = () => {
  const zip = new JSZip()

  Object.values(assetMap).forEach(({name, id, svg, png}) => {
    svg && zip.file(makeFileName(`${name}${id}.svg`), svg)
    png && zip.file(makeFileName(`${name}${id}.png`), png)
  })

  zip.generateAsync({type: "blob"})
    .then((content) => {
      saveAs(content, "assets.zip")
    })
}

let selectedAsset = null

const test = (asset) => {
  selectedAsset = asset
}

const handleCopy = (e:ClipboardEvent) => {
  if (!selectedAsset.svg) return

  e.preventDefault()
  e.clipboardData?.setData(
    "text/plain",
    selectedAsset.svg
  )
}
</script>

<section class="bb(#000.05)">
  <div class="hbox space-between p(10) bb(#000.05)">
    <div class="font(12) bold">Assets</div>
    <button class="r(8) pack font(11) c(#4f80ff) bold hover:underline" on:click={downloadZip}>Download All</button>
  </div>

  <div class="hbox flex-wrap gap(4) p(10)">
    {#each Object.values(assetMap || {}) as asset}
      <button
        class="relative w(48) h(48) r(4) b(#000.0) hover:b(#000.04)+bg(#000.05) clip p(4) pack >svg:w(~100%)+h(auto) >svg:drop-shadow(0/0/1/#000.5) >img:drop-shadow(0/0/1/#000.5)"
        on:click={() => test(asset)}>
        {#if asset.svg}{@html asset.svg}{/if}
        {#if asset.src}<img src={asset.src} alt="" class="contain"/>{/if}

        <span class="layer(top+right) font(8) scale(0.8) bg(#000) c(#fff) pack">{asset.svg ? 'svg' : 'png'}</span>
      </button>
    {/each}
  </div>
</section>

<svelte:window on:copy={handleCopy}/>