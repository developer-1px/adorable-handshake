import type {SceneNode} from "@figma/plugin-typings/plugin-api-standalone"

type VisitContext = {
  node: SceneNode
  path: string[]
  level: number
  next: () => void
  // 옵셔널: 부모 노드 정보나 다른 컨텍스트 추가 가능
}

export function traverseFigmaNode(node: SceneNode, visitor: (context: VisitContext) => void, path: string[] = [], level: number = 0) {
  if (!node) {
    console.error("node is null")
    return
  }

  const next = () => {
    if ("children" in node) {
      node.children.forEach((child, index) => traverseFigmaNode(child, visitor, [...path, child.name], level + 1))
    }
  }

  // visitor 호출
  visitor({
    node,
    path,
    level,
    next,
  })
}

// ----------------------------------------------
// 2. 여러 노드의 병렬 순회를 위한 함수
type ParallelNodesContext<T = any> = {
  nodes: readonly SceneNode[] // 현재 level의 모든 대응되는 node
  path: string[] // 현재까지의 node 경로
  level: number // 현재 깊이
  index: number // 현재 노드들의 형제 내 index
  parent?: T // 상위 콜백의 결과값
}

export function traverseParallelNodes<T>(
  nodes: readonly SceneNode[],
  callback: (context: ParallelNodesContext<T>) => T,
  path: string[] = [],
  level: number = 0,
  index: number = 0
): T {
  const result = callback({
    nodes,
    path,
    level,
    index,
  })

  if (result === false) {
    return result
  }

  if ("children" in nodes[0]) {
    const childCount = nodes[0].children.length

    for (let i = 0; i < childCount; i++) {
      const childNodes = nodes.map((node) => ("children" in node ? node.children[i] : null)).filter(Boolean) as SceneNode[]

      // if (childNodes.length === nodes.length) {
      traverseParallelNodes(childNodes, callback, [...path, nodes[0].children[i].name], level + 1, i)
      // }
    }
  }

  return result
}
