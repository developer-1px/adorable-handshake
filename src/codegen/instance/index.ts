interface FigmaProperty {
  value: any
  type: "TEXT" | "BOOLEAN" | "VARIANT" | "NUMBER"
  boundVariables?: Record<string, any>
}

interface FigmaInstanceProperties {
  [key: string]: FigmaProperty
}

interface FigmaInstance {
  id: string
  name: string
  type: string
  componentId?: string
  mainComponent?: {
    id: string
    name: string
  }
  componentProperties?: FigmaInstanceProperties
  variantProperties?: Record<string, string | boolean | number>
  parent?: {
    type: string
    name?: string
  }
}

export function generateJSXFromInstance(instance: FigmaInstance): string {
  // Get component name from instance hierarchy
  const componentName = getComponentName(instance)

  // Combine component properties and variant properties
  const properties = {
    ...(instance.componentProperties || {}),
    ...convertVariantToProperties(instance.variantProperties || {}),
  }

  const propsString = Object.entries(properties)
    .sort(([keyA], [keyB]) => {
      const order = ["VARIANT", "BOOLEAN", "TEXT"]
      const typeA = properties[keyA].type
      const typeB = properties[keyB].type
      return order.indexOf(typeA) - order.indexOf(typeB) || keyA.localeCompare(keyB)
    })
    .map(([key, prop]) => {
      const propName = cleanPropertyName(key)
      const propValue = formatPropertyValue(prop)
      return `${propName}=${propValue}`
    })
    .join(" ")

  return `<${componentName} ${propsString}/>`
}

function getComponentName(instance: FigmaInstance): string {
  // Try to get name from parent component set
  if (instance.mainComponent?.parent?.type === "COMPONENT_SET") {
    return cleanComponentName(instance.mainComponent?.parent.name || "")
  }

  // Try to get name from main component
  if (instance.mainComponent?.name) {
    return cleanComponentName(instance.mainComponent.name)
  }

  // Fallback to instance name
  return cleanComponentName(instance.name)
}

function cleanComponentName(name: string): string {
  return name
    .split("/")
    .shift()! // Get first part of the path
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase()) // Convert to PascalCase
    .replace(/^(.)/, (c) => c.toUpperCase()) // Ensure first character is uppercase
}

function convertVariantToProperties(variantProps: Record<string, string | boolean | number>): FigmaInstanceProperties {
  return Object.entries(variantProps).reduce((acc, [key, value]) => {
    acc[key] = {
      type: typeof value === "boolean" ? "BOOLEAN" : "VARIANT",
      value: value,
    }
    return acc
  }, {} as FigmaInstanceProperties)
}

function cleanPropertyName(name: string): string {
  return name
    .replace(/#\d+:\d+$/, "") // Remove instance ID suffix
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase()) // Convert to camelCase
    .replace(/^[A-Z]/, (c) => c.toLowerCase()) // Ensure first character is lowercase
}

function formatPropertyValue(prop: FigmaProperty): string {
  const {value, type} = prop

  switch (type) {
    case "TEXT":
      // Handle escaped quotes in text
      const cleanedText = value.replace(/"/g, '\\"')
      return `{"${cleanedText}"}`

    case "BOOLEAN":
      return `{${value}}`

    case "VARIANT":
      return `"${value}"`

    default:
      return typeof value === "string" ? `"${value}"` : `{${value}}`
  }
}

// Example usage:
const exampleInstance: FigmaInstance = {
  id: "instance_id",
  name: "Button/Primary",
  type: "INSTANCE",
  componentId: "component_id",
  mainComponent: {
    id: "main_component_id",
    name: "Button",
  },
  componentProperties: {
    "title text#1568:0": {
      value: '"테스트 title text\\"',
      type: "TEXT",
    },
    "Show tag#1230:0": {
      value: true,
      type: "BOOLEAN",
    },
  },
  variantProperties: {
    style: "white",
    state: "hover",
    device: "mobile",
  },
  parent: {
    type: "COMPONENT_SET",
    name: "CustomButton",
  },
}

console.log(generateJSXFromInstance(exampleInstance))
// Output: <CustomButton titleText="테스트 title text" showTag={true} style="white" state="hover" device="mobile" />
