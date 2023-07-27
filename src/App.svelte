<script lang="ts">
let scriptCode = ""
let html = ""
let bg = ""
let pageBg = "#111"

window.onmessage = (event) => {
  const {code, backgroundColor, pageBackgroundColor} = event.data.pluginMessage
  scriptCode = code.replace(/"data:image[^"]+"/g, "")
  html = code
  bg = backgroundColor
  pageBg = pageBackgroundColor
}
</script>

<main class="vbox h(100%) bg(--bg)" style:--bg={pageBg}>
  <section class="relative bg(--bg) >m(auto)+w(~100%)" style:--bg={bg}>{@html html}</section>
  <textarea class="h(200~) h(fill) bg(#000) c(#fff) font(8) no-border" spellcheck="false">{scriptCode}</textarea>
</main>