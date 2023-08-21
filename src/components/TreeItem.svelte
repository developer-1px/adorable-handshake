<script lang="ts">
import TreeItemItem from "./TreeItemItem.svelte";

export let nodes:Element[] = []

const isTextNode = (node:Node) => node.nodeType === 3 || node.tagName === "BR"
</script>

{#each Array.from(nodes).filter(c => !isTextNode(c)) as node}
  <TreeItemItem {node}/>
{/each}