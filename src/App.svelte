<script lang="ts">
let scriptCode = ""
let html = ""
let bg = ""
let pageBg = "#111"

window.onmessage = (event) => {
  const {code, backgroundColor, pageBackgroundColor} = event.data.pluginMessage
  scriptCode = code
  html = code
  bg = backgroundColor
  pageBg = pageBackgroundColor
}
</script>

<main class="vbox h(100%) bg(--bg)" style:--bg={pageBg}>
  <section class="relative bg(--bg) >w(~100%) vbox" style:--bg={bg}>{@html html}</section>
  <textarea class="h(200~) h(fill) bg(#000) c(#fff) font(8) no-border" spellcheck="false">{scriptCode}</textarea>
</main>