export function isSVGCandidate(node: SceneNode): boolean {
  // 1. 비트맵이 아닌 벡터 데이터를 포함한 경우
  if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION") {
    return true
  }

  // 2. 비선형 패스나 곡선이 포함된 경우
  if ("vectorNetwork" in node && node.vectorNetwork) {
    const hasNonLinearSegments = node.vectorNetwork.segments.some((segment) => segment.tangentStart || segment.tangentEnd)
    if (hasNonLinearSegments) return true
  }

  // 3. CSS로 표현하기 어려운 복잡한 그라디언트
  if (node.fills) {
    const hasComplexGradient = node.fills.some(
      (fill) =>
        (fill.type === "GRADIENT_LINEAR" && fill.gradientStops.length > 2) ||
        ["GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"].includes(fill.type)
    )
    if (hasComplexGradient) return true
  }

  // 4. 복잡한 마스크나 클리핑 패스 사용
  if ("mask" in node && node.mask) {
    const hasMask = Array.isArray(node.mask) ? node.mask.length > 0 : node.mask
    if (hasMask) return true
  }

  // 5. CSS로 표현하기 어려운 복잡한 스트로크 스타일
  if (node.strokes && node.strokes.length > 0) {
    const hasComplexStroke = node.strokes.some(
      (stroke) => stroke.strokeCap !== "NONE" || stroke.strokeJoin !== "MITER" || stroke.dashPattern?.length > 0
    )
    if (hasComplexStroke) return true
  }

  // 6. 비정형 다각형이나 스타 shape
  if (node.type === "POLYGON" || node.type === "STAR") {
    return true
  }

  // 7. 그룹의 경우 자식 요소들 검사
  if ((node.type === "GROUP" || node.type === "FRAME") && "children" in node) {
    return node.children.some((child) => isSVGCandidate(child))
  }

  return false
}

// CSS로 충분한 경우를 체크하는 보조 함수
function canBeHandledWithCSS(node: SceneNode): boolean {
  // 단순한 사각형 체크
  if (node.type === "RECTANGLE") {
    const rect = node as RectangleNode
    return (
      !isSVGCandidate(rect) &&
      rect.cornerRadius === 0 &&
      (!rect.fills || rect.fills.every((fill) => fill.type === "SOLID")) &&
      (!rect.strokes || rect.strokes.length === 0)
    )
  }

  // 단순한 원 체크
  if (node.type === "ELLIPSE") {
    const ellipse = node as EllipseNode
    return (
      !isSVGCandidate(ellipse) &&
      ellipse.arcData.startingAngle === 0 &&
      ellipse.arcData.endingAngle === 0 &&
      (!ellipse.fills || ellipse.fills.every((fill) => fill.type === "SOLID")) &&
      (!ellipse.strokes || ellipse.strokes.length === 0)
    )
  }

  return false
}
