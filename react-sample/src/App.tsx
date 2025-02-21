import * as React from "react"
import "./App.css"
import "./adorable-css@2.js"
import Editor from "react-simple-code-editor"
import Prism from "prismjs"
import {highlight, languages} from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"

import codeSample from "./sample/Card.js?raw"

Prism

function Component() {
  return <h1>Hello</h1>
}

const createReactComponents = () => {
  return new Proxy(
    {},
    {
      get: (target, type) => {
        if (type in target) return target[type]
        return (className, attr, ...children) => {
          if (type === "Text") {
            attr = {
              ...attr,
              contentEditable: "plaintext-only",
              dangerouslySetInnerHTML: {__html: children[0]},
            }
            return React.createElement("div", {className, ...attr})
          }

          return React.createElement("div", {className, ...attr}, ...children)
        }
      },
    }
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {hasError: false}
  }

  static getDerivedStateFromError(error) {
    console.log("---------------  getDerivedStateFromError   ---------------")
    console.log(error)
    return {hasError: true, error}
  }

  componentDidCatch(error, info) {
    console.log("---------------  componentDidCatch   ---------------")
    console.log(error, info.componentStack)
  }

  render() {
    //hasError값이 true로 바뀌면 fallback를 렌더한다
    if (this.state.hasError) {
      return <p>{this.state.error?.toString()}</p>
    }

    return this.props.children
  }
}

function App() {
  const [code, setCode] = React.useState(codeSample)

  let Card
  try {
    Card = new Function("return(\n" + code + ")")()(createReactComponents)
  } catch (e) {
    Card = () => <div className={"error pre"}>{e.message}</div>
  }

  return (
    <>
      <div className={"layer hbox"}>
        <div className={"w(500) h(fill) scroll relative"}>
          <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={(code) => highlight(code, languages.js)}
            padding={8}
            style={{
              fontFamily: '"Geist Mono", "Fira code", "Fira Mono", monospace',
              fontSize: 12,
              inset: 0,
              background: "#f9f9f9",
              width: "max-content",
              minWidth: "100%",
              minHeight: "100%",
            }}
          />
        </div>

        <div className={"w(fill) h(fill) pack"}>
          <ErrorBoundary key={code}>
            <Card />
          </ErrorBoundary>
        </div>
      </div>
    </>
  )
}

export default App
