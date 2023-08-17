<script lang="ts">
let scriptCode = ""
let html = ""
let bg = ""
let pageBg = "#111"
let offsetWidth = document.body.offsetWidth
let width = offsetWidth
let height = document.body.offsetHeight
let scale = 1

window.onresize = () => {
  offsetWidth = document.body.offsetWidth
  scale = Math.min(1, offsetWidth / width)
}

window.onmessage = (event) => {
  console.log("Event", event)

  const type = event.data?.pluginMessage?.type

  if (type === "code") {
    const {code, backgroundColor, pageBackgroundColor, width: w, height: h} = event.data.pluginMessage
    scriptCode = code
    html = code
    bg = backgroundColor
    pageBg = pageBackgroundColor
    width = w
    height = h
    scale = Math.min(1, offsetWidth / width)
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

let content:HTMLElement
let guide:HTMLElement

const findNode = (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY).closest("div,span")

  document.querySelector(".hovered-guide")?.classList.remove("hovered-guide")
  document.querySelector(".hovered-parent")?.classList.remove("hovered-parent")

  el.classList.add("hovered-guide")
  el.parentElement.classList.add("hovered-parent")
}

const selectNode = (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY).closest("div,span")
  document.querySelector(".selected")?.classList.remove("selected")
  el.classList.add("selected")

  const nodeId = el.getAttribute("data-node-id")

  parent.postMessage({pluginMessage: {type: "selectNode", id: nodeId}}, "*")
}

const selectNestedNode = () => {

}
</script>

<main class="layer vbox(left) bg(--bg)" style:--bg={pageBg}>
  <section bind:this={content} class="relative vbox(left) bg(--bg) >>cursor(default) scroll >*:static!+w(100%~)+h(100%~)
  >>.hovered-guide:outline(#4f80ff/2)! >>.hovered-parent:outline(#4f80ff.6/dashed) >>.hovered-parent>*:outline(#4f80ff.6/dashed)"
           style:--bg={bg} style:zoom="{scale}" style:width="{width}px" style:height="{height}px"
           on:mouseover={findNode}
           on:mouseleave={findNode}
           on:mouseenter={findNode}
           on:click={selectNode}
           on:dblclick={selectNestedNode}
  >{@html html}</section>
  <textarea class="h(200~) w(fill) h(fill) bg(#000) c(#fff) font(8/12)! monospace no-border" spellcheck="false"
            wrap="off">{scriptCode}</textarea>
  <div bind:this={guide} class="absolute pointer-events-none z(9999) outline(red)"></div>
</main>