<script lang="ts">

// props
export let minWidth = 200;
export let minHeight = 200;

// state
let startWidth: number;
let startHeight: number;
let startX: number;
let startY: number;
let handle: HTMLElement;

function handlePointerDown(e: PointerEvent) {
  handle.setPointerCapture(e.pointerId);

  startX = e.clientX;
  startY = e.clientY;
  startWidth = window.innerWidth;
  startHeight = window.innerHeight;
}

function handlePointerMove(e) {
  if (!handle.hasPointerCapture(e.pointerId)) return;

  const newWidth = Math.round(Math.max(minWidth, startWidth + (e.clientX - startX)))
  const newHeight = Math.round(Math.max(minHeight, startHeight + (e.clientY - startY)))

  // Figma UI에 리사이즈 메시지 전송
  parent.postMessage({
    pluginMessage: {
      type: 'resize',
      size: { width: newWidth, height: newHeight }
    }
  }, '*');
}

function handlePointerUp(e) {
  handle.releasePointerCapture(e.pointerId);
}
</script>

<div
  class="resize-handle layer(right+bottom) fixed se-resize"
  on:pointerdown={handlePointerDown}
  on:pointermove={handlePointerMove}
  on:pointerup={handlePointerUp}
  bind:this={handle}
>
  <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15L15 21M21 8L8 21" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>