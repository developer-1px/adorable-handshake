export function nl2br(str) {
  if (typeof str !== "string") return ""
  return str.replace(/(\r\n|\n|\r|\u2028)/g, "<br/>")
}
