export function dsl2html(code: string) {
  const createComponents = () =>
    new Proxy(
      {},
      {
        get: (target, prop) => {
          if (prop in target) return target[prop]
          return (cls, attr, ...children) => {
            return `<div class="${cls}" data-node-id="${attr?.["@id"]}">${children.join("\n")}</div>`
          }
        },
      }
    )

  const s = new Function("return " + code)
  return s()(createComponents)
}
