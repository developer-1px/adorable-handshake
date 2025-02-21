const createVueComponentsForCMS = (h) => {
  return new Proxy(
    {},
    {
      get: (target, type) => {
        if (type in target) return target[type]
        return (className, attr, ...children) => {
          if (type === "Text") {
            return h("div", {
              class: className,
              ...attr,
              contentEditable: "plaintext-only",
              innerHTML: children[0],
            })
          }
          return h("div", {class: className, ...attr}, children)
        }
      },
    }
  )
}
