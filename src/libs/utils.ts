export const OPTIONS = {
  "type": "inlineStyle"
}

export const makeNumber = (num:number) => Number(num).toFixed(2).replace(/^0+|\.00$|0+$/g, "") || "0"

export const isNumber = (value:string|number):value is number => +value === +value
export const isValid = (value:string|number) => value === 0 || !!value
export const px = (value:string|number) => (isNumber(value) && value !== 0) ? Math.round(value) + "px" : String(value)
export const percent = (value:string|number) => (isNumber(value) && value !== 0) ? makeNumber(value) + "%" : String(value)

export const hex = (num:number) => Math.round(num * 255).toString(16).padStart(2, "0")


export const makeInt = (num:number) => makeNumber(Math.round(num))

export const makeHexColor = (r:number, g:number, b:number, a:number = 1) => {
  let hexColor = [r, g, b].map(hex)
  if (a === 1 && hexColor.every(h => h[0] === h[1])) hexColor = hexColor.map(h => h[0])
  return hexColor.join("")
}

const makeAdorableStyleColor = ({r, g, b}, opacity = 1) => `#${makeHexColor(r, g, b)}${opacity === 1 ? "" : makeNumber(opacity)}`
const makeTailwindStyleColor = ({r, g, b}, opacity = 1) => `#${makeHexColor(r, g, b, opacity)}${opacity === 1 ? "" : Math.round(+opacity * 255).toString(16).padStart(2, "0")}`

export const makeColor = (color, opacity = 1) => {
  if (!color) return ""

  const {r, g, b} = color
  // if (OPTIONS.type === "adorablecss") return makeAdorableStyleColor({r, g, b}, opacity)
  // if (OPTIONS.type === "tailwindcss") return makeTailwindStyleColor({r, g, b}, opacity)
  return makeTailwindStyleColor({r, g, b}, opacity)
}


export const makeGradientLinear = (paint:GradientPaint) => {
  // https://github.com/jiangyijie27/figma-copy-css-and-react-style/blob/master/code.ts
  const {gradientTransform, gradientStops} = paint as GradientPaint
  if (!gradientTransform || !gradientStops) {
    return ""
  }
  let gradientTransformData = {
    m00: 1,
    m01: 0,
    m02: 0,
    m10: 0,
    m11: 1,
    m12: 0,
  }
  const delta = gradientTransform[0][0] * gradientTransform[1][1] - gradientTransform[0][1] * gradientTransform[1][0]

  if (delta !== 0) {
    const deltaVal = 1 / delta
    gradientTransformData = {
      m00: gradientTransform[1][1] * deltaVal,
      m01: -gradientTransform[0][1] * deltaVal,
      m02: (gradientTransform[0][1] * gradientTransform[1][2] - gradientTransform[1][1] * gradientTransform[0][2]) * deltaVal,
      m10: -gradientTransform[1][0] * deltaVal,
      m11: gradientTransform[0][0] * deltaVal,
      m12: (gradientTransform[1][0] * gradientTransform[0][2] - gradientTransform[0][0] * gradientTransform[1][2]) * deltaVal,
    }
  }
  const rotationTruthy = gradientTransformData.m00 * gradientTransformData.m11 - gradientTransformData.m01 * gradientTransformData.m10 > 0 ? 1 : -1

  const data = gradientTransformData
  const param = {x: 0, y: 1}
  const rotationData = {
    x: data.m00 * param.x + data.m01 * param.y,
    y: data.m10 * param.x + data.m11 * param.y,
  }
  const rad = makeNumber((Math.atan2(rotationData.y * rotationTruthy, rotationData.x * rotationTruthy) / Math.PI) * 180)
  const gradientColors = gradientStops.map((gradient) => `${makeColor(gradient.color, gradient.color.a)} ${makeNumber(gradient.position * 100)}%`)

  return `linear-gradient(${rad}deg,${gradientColors})`
}

export const fourSideValues = (t, r, b, l) => {
  if (t === r && r === b && b === l) return [t]
  if (t === b && r === l) return [t, r]
  if (t !== b && r === l) return [t, r, b]
  return [t, r, b, l]
}

export const makeFourSideValues = (t, r, b, l) => fourSideValues(t, r, b, l).join("/")

export const stripZero = (value:string) => value.startsWith("0.") ? value.slice(1) : value.startsWith("-0.") ? "-" + value.slice(2) : value

export const unitValue = ({value, unit}):string => {

  console.warn(">>> 3")
  value = stripZero("" + makeNumber(value))

  console.warn(">>> 4")

  switch (unit) {
    case "PIXELS": {return px(value)}
    case "PERCENT": {return percent(value)}
  }
  return value
}

export const ab2str = (buf) => String.fromCharCode.apply(null, new Uint16Array(buf))
export const capitalize = (str:string) => str.charAt(0).toUpperCase() + str.slice(1)

export const nl2br = (str:string) => str.replace(/(\r\n|\n|\r|\u2028|\u2029)/g, "<br/>")

export const indent = (code:string) => code ? "\n" + code.split("\n").map(line => "  " + line).join("\n") + "\n" : ""

export const traverse = (node, callback) => {
  callback(node)
  if (node.children && node.children.length) {
    node.children.forEach(child => traverse(child, callback))
  }
}

export const makeComponentName = (str:string) => capitalize(str.trim().replace(/[^_a-zA-Z0-9ㄱ-ㅎ가-힣]/g, "").replace(/\s*\/\s*/g, "_").replace(/-|\s+/g, "_").replace(/\s+/g, "_"))


export const makeFileName = (str:string) => str
  .replace(/[\/\?<>\\:\*\|":]+/g, "_")
  .replace(/\s+/g, "_")
  .replace(/_+/g, "_")