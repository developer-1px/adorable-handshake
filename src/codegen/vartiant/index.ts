interface VariantValue {
  values: string[]
}

interface VariantsConfig {
  [key: string]: VariantValue
}

export function generateCVATemplate(variants: VariantsConfig) {
  // variants 객체를 문자열로 변환
  const generateVariantsObject = (variants: VariantsConfig) => {
    return Object.entries(variants)
      .map(([key, data]) => {
        // 각 variant의 values를 개별 케이스로 변환
        const valueEntries = data.values.map((value) => `        ${value}: [],`).join("\n")

        return `      ${key}: {\n${valueEntries}\n      }`
      })
      .join(",\n\n")
  }

  // defaultVariants 객체 생성
  const generateDefaultVariants = (variants: VariantsConfig) => {
    return Object.entries(variants)
      .map(([key, data]) => `        ${key}: "${data.values[0]}"`)
      .join(",\n")
  }

  return `import { cva } from 'class-variance-authority'

const component = cva(
  [
    // base styles
  ],
  {
    variants: {
${generateVariantsObject(variants)}
    },
    defaultVariants: {
${generateDefaultVariants(variants)}
    }
  }
)`
}

// 테스트
const variants = {
  style: {values: ["white"]},
  state: {values: ["enabled", "hover"]},
  device: {values: ["pc", "mobile"]},
}

console.log(generateCVATemplate(variants))
