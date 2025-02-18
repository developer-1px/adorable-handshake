<script lang="ts">
import {_hoverNode, _selectNode, selectedNodeId$} from "../store/store"

export let node:Element


const isTextNode = (node:Node) => node.nodeType === 3 || node.tagName === "BR"
const isOnlyHasTextNode = (node:Node) => node.childNodes.length > 0 && Array.from(node.childNodes).every(isTextNode)

const isImage = (node:Node) => node.tagName === "IMG" || node.tagName === "PICTURE" || node.tagName === "FIGURE"


let isFolded = false
const toggleFold = () => isFolded = !isFolded


const hoverNode = (node) => _hoverNode(node?.getAttribute("data-node-id"))

const selectNode = () => {
  _selectNode(node.getAttribute("data-node-id"))
}

let here
$: isSelected = $selectedNodeId$ === node.getAttribute("data-node-id")

// $: if (isSelected) {
//   here?.scrollIntoView({block: "center"})
// }

$: direction = node.className.search(/flex-row|hbox/) >= 0 ? "row"
  : node.className.search(/flex-column|vbox/) >= 0 ? "column"
    : node.style.flexFlow

const icon = "w(12) font(12) text(pack) material-symbols-outlined"
</script>

<div class="node code font(10) bl(#000.08) ml(4) &.isSelected:bg(#000.1)" class:isSelected>
  <div class="hbox gap(4) p(6/12) nowrap &.isSelected:bg(#000.2)" class:isSelected bind:this={here}>
    <div class="w(12) h(12) pack ml(-6) c(#000.5) hidden pointer .isFolded:rotate(-90)"
         class:isFolded
         class:visible!={!isOnlyHasTextNode(node) && node.childNodes.length > 0}
         on:click={toggleFold}><span class="scale(.5)">▼</span>
    </div>
    {#if isOnlyHasTextNode(node)}
      <div class="{icon}">title</div>
    {:else if isImage(node)}
      <div class="{icon}">image</div>
    {:else if direction === "row"}
      <div class="{icon}">view_column</div>
    {:else if direction === "column"}
      <div class="{icon}">table_rows</div>
    {:else}
      <div class="{icon}">crop_square</div>
    {/if}

    <div class="hover:underline pointer" on:click={selectNode}
         on:mouseover={() => hoverNode(node)}
         on:mouseleave={() => hoverNode(null)}>{isOnlyHasTextNode(node) ? node.innerText
        : node.getAttribute("data-node-name") || node.className || node.style?.cssText}</div>
  </div>
  {#if !isFolded && node.children}
    {#each Array.from(node.children).filter(c => !isTextNode(c)) as node}
      <svelte:self {node}/>
    {/each}
  {/if}
</div>