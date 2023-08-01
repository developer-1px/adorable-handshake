<script lang="ts">
let scriptCode = ""
let html = ""
let bg = ""
let pageBg = "#111"
let offsetWidth = document.body.offsetWidth
let width = offsetWidth
let scale = 1

window.onresize = () => {
  offsetWidth = document.body.offsetWidth
  scale = offsetWidth / width
}

window.onmessage = (event) => {
  const type = event.data?.pluginMessage?.type

  if (type === "code") {
    const {code, backgroundColor, pageBackgroundColor, width: w, height} = event.data.pluginMessage
    scriptCode = code
    html = code
    bg = backgroundColor
    pageBg = pageBackgroundColor
    width = w
    scale = offsetWidth / width
    return
  }

  if (type === "assets") {
    const {id, svg} = event.data.pluginMessage
    document.querySelectorAll(`[data-asset-id="${id}"]`).forEach((el) => {
      el.innerHTML = svg
    })
    return
  }
}
</script>

<main class="vbox h(100%) bg(--bg)" style:--bg={bg}>
  <div class="c(#000)">{offsetWidth} / {width} / {scale}</div>
  <section class="relative bg(--bg) >w(~100%) vbox" style:--bg={bg} style:transform="scale({1})">{@html html}</section>
  <textarea class="h(200~) h(fill) bg(#000) c(#fff) font(8) monospace no-border" spellcheck="false" wrap="off">{scriptCode}</textarea>
</main>