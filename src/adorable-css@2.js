"use strict"

// ../../../node_modules/.pnpm/@unocss+core@65.4.3/node_modules/@unocss/core/dist/index.mjs
var LAYER_DEFAULT = "default"
var LAYER_PREFLIGHTS = "preflights"
var LAYER_SHORTCUTS = "shortcuts"
var LAYER_IMPORTS = "imports"
var DEFAULT_LAYERS = {
  [LAYER_IMPORTS]: -200,
  [LAYER_PREFLIGHTS]: -100,
  [LAYER_SHORTCUTS]: -10,
  [LAYER_DEFAULT]: 0,
}
var defaultSplitRE = /[\\:]?[\s'"`;{}]+/g
function splitCode(code) {
  return code.split(defaultSplitRE)
}
var extractorSplit = {
  name: "@unocss/core/extractor-split",
  order: 0,
  extract({code}) {
    return splitCode(code)
  },
}
function toArray(value = []) {
  return Array.isArray(value) ? value : [value]
}
function uniq(value) {
  return Array.from(new Set(value))
}
function uniqueBy(array, equalFn) {
  return array.reduce((acc, cur) => {
    const index = acc.findIndex((item) => equalFn(cur, item))
    if (index === -1) acc.push(cur)
    return acc
  }, [])
}
function isString(s) {
  return typeof s === "string"
}
var CountableSet = class extends Set {
  _map
  constructor(values) {
    super(values)
    this._map ??= /* @__PURE__ */ new Map()
  }
  add(key) {
    this._map ??= /* @__PURE__ */ new Map()
    this._map.set(key, (this._map.get(key) ?? 0) + 1)
    return super.add(key)
  }
  delete(key) {
    this._map.delete(key)
    return super.delete(key)
  }
  clear() {
    this._map.clear()
    super.clear()
  }
  getCount(key) {
    return this._map.get(key) ?? 0
  }
  setCount(key, count) {
    this._map.set(key, count)
    return super.add(key)
  }
}
function isCountableSet(value) {
  return value instanceof CountableSet
}
function escapeSelector(str) {
  const length = str.length
  let index = -1
  let codeUnit
  let result = ""
  const firstCodeUnit = str.charCodeAt(0)
  while (++index < length) {
    codeUnit = str.charCodeAt(index)
    if (codeUnit === 0) {
      result += "\uFFFD"
      continue
    }
    if (codeUnit === 37) {
      result += "\\%"
      continue
    }
    if (codeUnit === 44) {
      result += "\\,"
      continue
    }
    if (
      // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
      // U+007F, […]
      (codeUnit >= 1 && codeUnit <= 31) ||
      codeUnit === 127 ||
      (index === 0 && codeUnit >= 48 && codeUnit <= 57) ||
      (index === 1 && codeUnit >= 48 && codeUnit <= 57 && firstCodeUnit === 45)
    ) {
      result += `\\${codeUnit.toString(16)} `
      continue
    }
    if (
      // If the character is the first character and is a `-` (U+002D), and
      // there is no second character, […]
      index === 0 &&
      length === 1 &&
      codeUnit === 45
    ) {
      result += `\\${str.charAt(index)}`
      continue
    }
    if (
      codeUnit >= 128 ||
      codeUnit === 45 ||
      codeUnit === 95 ||
      (codeUnit >= 48 && codeUnit <= 57) ||
      (codeUnit >= 65 && codeUnit <= 90) ||
      (codeUnit >= 97 && codeUnit <= 122)
    ) {
      result += str.charAt(index)
      continue
    }
    result += `\\${str.charAt(index)}`
  }
  return result
}
var e = escapeSelector
function createNanoEvents() {
  return {
    events: {},
    emit(event, ...args) {
      ;(this.events[event] || []).forEach((i) => i(...args))
    },
    on(event, cb) {
      ;(this.events[event] = this.events[event] || []).push(cb)
      return () => (this.events[event] = (this.events[event] || []).filter((i) => i !== cb))
    },
  }
}
function normalizeVariant(variant) {
  return typeof variant === "function" ? {match: variant} : variant
}
function isRawUtil(util) {
  return util.length === 3
}
function notNull(value) {
  return value != null
}
function noop() {}
var TwoKeyMap = class {
  _map = /* @__PURE__ */ new Map()
  get(key1, key2) {
    const m2 = this._map.get(key1)
    if (m2) return m2.get(key2)
  }
  getFallback(key1, key2, fallback) {
    let m2 = this._map.get(key1)
    if (!m2) {
      m2 = /* @__PURE__ */ new Map()
      this._map.set(key1, m2)
    }
    if (!m2.has(key2)) m2.set(key2, fallback)
    return m2.get(key2)
  }
  set(key1, key2, value) {
    let m2 = this._map.get(key1)
    if (!m2) {
      m2 = /* @__PURE__ */ new Map()
      this._map.set(key1, m2)
    }
    m2.set(key2, value)
    return this
  }
  has(key1, key2) {
    return this._map.get(key1)?.has(key2)
  }
  delete(key1, key2) {
    return this._map.get(key1)?.delete(key2) || false
  }
  deleteTop(key1) {
    return this._map.delete(key1)
  }
  map(fn) {
    return Array.from(this._map.entries()).flatMap(([k1, m2]) =>
      Array.from(m2.entries()).map(([k2, v]) => {
        return fn(v, k1, k2)
      })
    )
  }
}
var BetterMap = class extends Map {
  getFallback(key, fallback) {
    const v = this.get(key)
    if (v === void 0) {
      this.set(key, fallback)
      return fallback
    }
    return v
  }
  map(mapFn) {
    const result = []
    this.forEach((v, k) => {
      result.push(mapFn(v, k))
    })
    return result
  }
  flatMap(mapFn) {
    const result = []
    this.forEach((v, k) => {
      result.push(...mapFn(v, k))
    })
    return result
  }
}
function normalizeCSSEntries(obj) {
  if (isString(obj)) return obj
  return (!Array.isArray(obj) ? Object.entries(obj) : obj).filter((i) => i[1] != null)
}
function normalizeCSSValues(obj) {
  if (Array.isArray(obj)) {
    if (obj.find((i) => !Array.isArray(i) || Array.isArray(i[0]))) return obj.map((i) => normalizeCSSEntries(i))
    else return [obj]
  } else {
    return [normalizeCSSEntries(obj)]
  }
}
function clearIdenticalEntries(entry) {
  return entry.filter(([k, v], idx) => {
    if (k.startsWith("$$")) return false
    for (let i = idx - 1; i >= 0; i--) {
      if (entry[i][0] === k && entry[i][1] === v) return false
    }
    return true
  })
}
function entriesToCss(arr) {
  if (arr == null) return ""
  return clearIdenticalEntries(arr)
    .map(([key, value]) => (value != null && typeof value !== "function" ? `${key}:${value};` : void 0))
    .filter(Boolean)
    .join("")
}
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item)
}
function mergeDeep(original, patch, mergeArray = false) {
  const o = original
  const p = patch
  if (Array.isArray(p)) {
    if (mergeArray && Array.isArray(p)) return [...o, ...p]
    else return [...p]
  }
  const output = {...o}
  if (isObject(o) && isObject(p)) {
    Object.keys(p).forEach((key) => {
      if ((isObject(o[key]) && isObject(p[key])) || (Array.isArray(o[key]) && Array.isArray(p[key])))
        output[key] = mergeDeep(o[key], p[key], mergeArray)
      else Object.assign(output, {[key]: p[key]})
    })
  }
  return output
}
function clone(val) {
  let k, out, tmp
  if (Array.isArray(val)) {
    out = Array.from({length: (k = val.length)})
    while (k--) out[k] = (tmp = val[k]) && typeof tmp === "object" ? clone(tmp) : tmp
    return out
  }
  if (Object.prototype.toString.call(val) === "[object Object]") {
    out = {}
    for (k in val) {
      if (k === "__proto__") {
        Object.defineProperty(out, k, {
          value: clone(val[k]),
          configurable: true,
          enumerable: true,
          writable: true,
        })
      } else {
        out[k] = (tmp = val[k]) && typeof tmp === "object" ? clone(tmp) : tmp
      }
    }
    return out
  }
  return val
}
function isStaticRule(rule) {
  return isString(rule[0])
}
function isStaticShortcut(sc) {
  return isString(sc[0])
}
var regexCache = {}
function makeRegexClassGroup(separators = ["-", ":"]) {
  const key = separators.join("|")
  if (!regexCache[key])
    regexCache[key] = new RegExp(
      `((?:[!@<~\\w+:_-]|\\[&?>?:?\\S*\\])+?)(${key})\\(((?:[~!<>\\w\\s:/\\\\,%#.$?-]|\\[.*?\\])+?)\\)(?!\\s*?=>)`,
      "gm"
    )
  regexCache[key].lastIndex = 0
  return regexCache[key]
}
function parseVariantGroup(str, separators = ["-", ":"], depth = 5) {
  const regexClassGroup = makeRegexClassGroup(separators)
  let hasChanged
  let content = str.toString()
  const prefixes = /* @__PURE__ */ new Set()
  const groupsByOffset = /* @__PURE__ */ new Map()
  do {
    hasChanged = false
    content = content.replace(regexClassGroup, (from, pre, sep, body, groupOffset) => {
      if (!separators.includes(sep)) return from
      hasChanged = true
      prefixes.add(pre + sep)
      const bodyOffset = groupOffset + pre.length + sep.length + 1
      const group = {length: from.length, items: []}
      groupsByOffset.set(groupOffset, group)
      for (const itemMatch of [...body.matchAll(/\S+/g)]) {
        const itemOffset = bodyOffset + itemMatch.index
        let innerItems = groupsByOffset.get(itemOffset)?.items
        if (innerItems) {
          groupsByOffset.delete(itemOffset)
        } else {
          innerItems = [
            {
              offset: itemOffset,
              length: itemMatch[0].length,
              className: itemMatch[0],
            },
          ]
        }
        for (const item of innerItems) {
          item.className = item.className === "~" ? pre : item.className.replace(/^(!?)(.*)/, `$1${pre}${sep}$2`)
          group.items.push(item)
        }
      }
      return "$".repeat(from.length)
    })
    depth -= 1
  } while (hasChanged && depth)
  let expanded
  if (typeof str === "string") {
    expanded = ""
    let prevOffset = 0
    for (const [offset, group] of groupsByOffset) {
      expanded += str.slice(prevOffset, offset)
      expanded += group.items.map((item) => item.className).join(" ")
      prevOffset = offset + group.length
    }
    expanded += str.slice(prevOffset)
  } else {
    expanded = str
    for (const [offset, group] of groupsByOffset) {
      expanded.overwrite(offset, offset + group.length, group.items.map((item) => item.className).join(" "))
    }
  }
  return {
    prefixes: Array.from(prefixes),
    hasChanged,
    groupsByOffset,
    // Computed lazily because MagicString's toString does a lot of work
    get expanded() {
      return expanded.toString()
    },
  }
}
function expandVariantGroup(str, separators = ["-", ":"], depth = 5) {
  const res = parseVariantGroup(str, separators, depth)
  return typeof str === "string" ? res.expanded : str
}
var warned = /* @__PURE__ */ new Set()
function warnOnce(msg) {
  if (warned.has(msg)) return
  console.warn("[unocss]", msg)
  warned.add(msg)
}
function resolveShortcuts(shortcuts) {
  return toArray(shortcuts).flatMap((s) => {
    if (Array.isArray(s)) return [s]
    return Object.entries(s)
  })
}
var __RESOLVED = "_uno_resolved"
async function resolvePreset(presetInput) {
  let preset = typeof presetInput === "function" ? await presetInput() : await presetInput
  if (__RESOLVED in preset) return preset
  preset = {...preset}
  Object.defineProperty(preset, __RESOLVED, {
    value: true,
    enumerable: false,
  })
  const shortcuts = preset.shortcuts ? resolveShortcuts(preset.shortcuts) : void 0
  preset.shortcuts = shortcuts
  if (preset.prefix || preset.layer) {
    const apply = (i) => {
      if (!i[2]) i[2] = {}
      const meta = i[2]
      if (meta.prefix == null && preset.prefix) meta.prefix = toArray(preset.prefix)
      if (meta.layer == null && preset.layer) meta.layer = preset.layer
    }
    shortcuts?.forEach(apply)
    preset.rules?.forEach(apply)
  }
  return preset
}
async function resolvePresets(preset) {
  const root = await resolvePreset(preset)
  if (!root.presets) return [root]
  const nested = (await Promise.all((root.presets || []).flatMap(toArray).flatMap(resolvePresets))).flat()
  return [root, ...nested]
}
function mergeContentOptions(optionsArray) {
  if (optionsArray.length === 0) {
    return {}
  }
  const pipelineIncludes = []
  const pipelineExcludes = []
  let pipelineDisabled = false
  const filesystem = []
  const inline = []
  const plain = []
  for (const options of optionsArray) {
    if (options.pipeline === false) {
      pipelineDisabled = true
      break
    } else {
      if (options.pipeline?.include) {
        pipelineIncludes.push(options.pipeline.include)
      }
      if (options.pipeline?.exclude) {
        pipelineExcludes.push(options.pipeline.exclude)
      }
    }
    if (options.filesystem) {
      filesystem.push(options.filesystem)
    }
    if (options.inline) {
      inline.push(options.inline)
    }
    if (options.plain) {
      plain.push(options.plain)
    }
  }
  const mergedContent = {
    pipeline: pipelineDisabled
      ? false
      : {
          include: uniq(mergeFilterPatterns(...pipelineIncludes)),
          exclude: uniq(mergeFilterPatterns(...pipelineExcludes)),
        },
  }
  if (filesystem.length) {
    mergedContent.filesystem = uniq(filesystem.flat())
  }
  if (inline.length) {
    mergedContent.inline = uniq(inline.flat())
  }
  if (plain.length) {
    mergedContent.plain = uniq(plain.flat())
  }
  return mergedContent
}
async function resolveConfig(userConfig = {}, defaults = {}) {
  const config = Object.assign({}, defaults, userConfig)
  const rawPresets = uniqueBy(
    (await Promise.all((config.presets || []).flatMap(toArray).flatMap(resolvePresets))).flat(),
    (a, b) => a.name === b.name
  )
  const sortedPresets = [
    ...rawPresets.filter((p) => p.enforce === "pre"),
    ...rawPresets.filter((p) => !p.enforce),
    ...rawPresets.filter((p) => p.enforce === "post"),
  ]
  const sources = [...sortedPresets, config]
  const sourcesReversed = [...sources].reverse()
  const layers = Object.assign({}, DEFAULT_LAYERS, ...sources.map((i) => i.layers))
  function getMerged(key) {
    return uniq(sources.flatMap((p) => toArray(p[key] || [])))
  }
  const extractors = getMerged("extractors")
  let extractorDefault = sourcesReversed.find((i) => i.extractorDefault !== void 0)?.extractorDefault
  if (extractorDefault === void 0) extractorDefault = extractorSplit
  if (extractorDefault && !extractors.includes(extractorDefault)) extractors.unshift(extractorDefault)
  extractors.sort((a, b) => (a.order || 0) - (b.order || 0))
  const rules = getMerged("rules")
  const rulesStaticMap = {}
  const rulesSize = rules.length
  const rulesDynamic = rules
    .filter((rule) => {
      if (!isStaticRule(rule)) return true
      const prefixes = toArray(rule[2]?.prefix || "")
      prefixes.forEach((prefix) => {
        rulesStaticMap[prefix + rule[0]] = rule
      })
      return false
    })
    .reverse()
  let theme = mergeThemes(sources.map((p) => p.theme))
  const extendThemes = getMerged("extendTheme")
  for (const extendTheme of extendThemes) theme = extendTheme(theme) || theme
  const autocomplete = {
    templates: uniq(sources.flatMap((p) => toArray(p.autocomplete?.templates))),
    extractors: sources.flatMap((p) => toArray(p.autocomplete?.extractors)).sort((a, b) => (a.order || 0) - (b.order || 0)),
    shorthands: mergeAutocompleteShorthands(sources.map((p) => p.autocomplete?.shorthands || {})),
  }
  let separators = getMerged("separators")
  if (!separators.length) separators = [":", "-"]
  const contents = getMerged("content")
  const content = mergeContentOptions(contents)
  const resolved = {
    mergeSelectors: true,
    warn: true,
    sortLayers: (layers2) => layers2,
    ...config,
    blocklist: getMerged("blocklist"),
    presets: sortedPresets,
    envMode: config.envMode || "build",
    shortcutsLayer: config.shortcutsLayer || "shortcuts",
    layers,
    theme,
    rules,
    rulesSize,
    rulesDynamic,
    rulesStaticMap,
    preprocess: getMerged("preprocess"),
    postprocess: getMerged("postprocess"),
    preflights: getMerged("preflights"),
    autocomplete,
    variants: getMerged("variants")
      .map(normalizeVariant)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    shortcuts: resolveShortcuts(getMerged("shortcuts")).reverse(),
    extractors,
    safelist: getMerged("safelist"),
    separators,
    details: config.details ?? config.envMode === "dev",
    content,
    transformers: uniqueBy(getMerged("transformers"), (a, b) => a.name === b.name),
  }
  for (const p of sources) p?.configResolved?.(resolved)
  return resolved
}
function mergeThemes(themes) {
  return themes.map((theme) => (theme ? clone(theme) : {})).reduce((a, b) => mergeDeep(a, b), {})
}
function mergeAutocompleteShorthands(shorthands) {
  return shorthands.reduce((a, b) => {
    const rs = {}
    for (const key in b) {
      const value = b[key]
      if (Array.isArray(value)) rs[key] = `(${value.join("|")})`
      else rs[key] = value
    }
    return {
      ...a,
      ...rs,
    }
  }, {})
}
function mergeFilterPatterns(...filterPatterns) {
  return filterPatterns.flatMap(flatternFilterPattern)
}
function flatternFilterPattern(pattern) {
  return Array.isArray(pattern) ? pattern : pattern ? [pattern] : []
}
var version = "65.4.3"
var symbols = {
  shortcutsNoMerge: "$$symbol-shortcut-no-merge",
  variants: "$$symbol-variants",
  parent: "$$symbol-parent",
  selector: "$$symbol-selector",
  layer: "$$symbol-layer",
  sort: "$$symbol-sort",
}
var UnoGeneratorInternal = class _UnoGeneratorInternal {
  constructor(userConfig = {}, defaults = {}) {
    this.userConfig = userConfig
    this.defaults = defaults
  }
  version = version
  events = createNanoEvents()
  config = void 0
  cache = /* @__PURE__ */ new Map()
  blocked = /* @__PURE__ */ new Set()
  parentOrders = /* @__PURE__ */ new Map()
  activatedRules = /* @__PURE__ */ new Set()
  static async create(userConfig = {}, defaults = {}) {
    const uno2 = new _UnoGeneratorInternal(userConfig, defaults)
    uno2.config = await resolveConfig(uno2.userConfig, uno2.defaults)
    uno2.events.emit("config", uno2.config)
    return uno2
  }
  async setConfig(userConfig, defaults) {
    if (!userConfig) return
    if (defaults) this.defaults = defaults
    this.userConfig = userConfig
    this.blocked.clear()
    this.parentOrders.clear()
    this.activatedRules.clear()
    this.cache.clear()
    this.config = await resolveConfig(userConfig, this.defaults)
    this.events.emit("config", this.config)
  }
  async applyExtractors(code, id, extracted = /* @__PURE__ */ new Set()) {
    const context = {
      original: code,
      code,
      id,
      extracted,
      envMode: this.config.envMode,
    }
    for (const extractor of this.config.extractors) {
      const result = await extractor.extract?.(context)
      if (!result) continue
      if (isCountableSet(result) && isCountableSet(extracted)) {
        for (const token of result) extracted.setCount(token, extracted.getCount(token) + result.getCount(token))
      } else {
        for (const token of result) extracted.add(token)
      }
    }
    return extracted
  }
  makeContext(raw, applied) {
    const context = {
      rawSelector: raw,
      currentSelector: applied[1],
      theme: this.config.theme,
      generator: this,
      symbols,
      variantHandlers: applied[2],
      constructCSS: (...args) => this.constructCustomCSS(context, ...args),
      variantMatch: applied,
    }
    return context
  }
  async parseToken(raw, alias) {
    if (this.blocked.has(raw)) return
    const cacheKey = `${raw}${alias ? ` ${alias}` : ""}`
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)
    let current = raw
    for (const p of this.config.preprocess) current = p(raw)
    if (this.isBlocked(current)) {
      this.blocked.add(raw)
      this.cache.set(cacheKey, null)
      return
    }
    const variantResults = await this.matchVariants(raw, current)
    if (variantResults.every((i) => !i || this.isBlocked(i[1]))) {
      this.blocked.add(raw)
      this.cache.set(cacheKey, null)
      return
    }
    const handleVariantResult = async (matched) => {
      const context = this.makeContext(raw, [alias || matched[0], matched[1], matched[2], matched[3]])
      if (this.config.details) context.variants = [...matched[3]]
      const expanded = await this.expandShortcut(context.currentSelector, context)
      const utils = expanded
        ? await this.stringifyShortcuts(context.variantMatch, context, expanded[0], expanded[1])
        : (await this.parseUtil(context.variantMatch, context))?.map((i) => this.stringifyUtil(i, context)).filter(notNull)
      return utils
    }
    const result = (await Promise.all(variantResults.map((i) => handleVariantResult(i)))).flat().filter((x) => !!x)
    if (result?.length) {
      this.cache.set(cacheKey, result)
      return result
    }
    this.cache.set(cacheKey, null)
  }
  async generate(input, options = {}) {
    const {id, scope, preflights = true, safelist = true, minify = false, extendedInfo = false} = options
    const tokens = isString(input)
      ? await this.applyExtractors(input, id, extendedInfo ? new CountableSet() : /* @__PURE__ */ new Set())
      : Array.isArray(input)
        ? new Set(input)
        : input
    if (safelist) {
      const safelistContext = {
        generator: this,
        theme: this.config.theme,
      }
      this.config.safelist
        .flatMap((s) => (typeof s === "function" ? s(safelistContext) : s))
        .forEach((s) => {
          if (!tokens.has(s)) tokens.add(s)
        })
    }
    const nl = minify ? "" : "\n"
    const layerSet = /* @__PURE__ */ new Set([LAYER_DEFAULT])
    const matched = extendedInfo ? /* @__PURE__ */ new Map() : /* @__PURE__ */ new Set()
    const sheet = /* @__PURE__ */ new Map()
    let preflightsMap = {}
    const tokenPromises = Array.from(tokens).map(async (raw) => {
      if (matched.has(raw)) return
      const payload = await this.parseToken(raw)
      if (payload == null) return
      if (matched instanceof Map) {
        matched.set(raw, {
          data: payload,
          count: isCountableSet(tokens) ? tokens.getCount(raw) : -1,
        })
      } else {
        matched.add(raw)
      }
      for (const item of payload) {
        const parent = item[3] || ""
        const layer = item[4]?.layer
        if (!sheet.has(parent)) sheet.set(parent, [])
        sheet.get(parent).push(item)
        if (layer) layerSet.add(layer)
      }
    })
    await Promise.all(tokenPromises)
    await (async () => {
      if (!preflights) return
      const preflightContext = {
        generator: this,
        theme: this.config.theme,
      }
      const preflightLayerSet = /* @__PURE__ */ new Set([])
      this.config.preflights.forEach(({layer = LAYER_PREFLIGHTS}) => {
        layerSet.add(layer)
        preflightLayerSet.add(layer)
      })
      preflightsMap = Object.fromEntries(
        await Promise.all(
          Array.from(preflightLayerSet).map(async (layer) => {
            const preflights2 = await Promise.all(
              this.config.preflights
                .filter((i) => (i.layer || LAYER_PREFLIGHTS) === layer)
                .map(async (i) => await i.getCSS(preflightContext))
            )
            const css = preflights2.filter(Boolean).join(nl)
            return [layer, css]
          })
        )
      )
    })()
    const layers = this.config.sortLayers(
      Array.from(layerSet).sort((a, b) => (this.config.layers[a] ?? 0) - (this.config.layers[b] ?? 0) || a.localeCompare(b))
    )
    const layerCache = {}
    const outputCssLayers = this.config.outputToCssLayers
    const getLayerAlias = (layer) => {
      let alias = layer
      if (typeof outputCssLayers === "object") {
        alias = outputCssLayers.cssLayerName?.(layer)
      }
      return alias === null ? null : (alias ?? layer)
    }
    const getLayer = (layer = LAYER_DEFAULT) => {
      if (layerCache[layer]) return layerCache[layer]
      let css = Array.from(sheet)
        .sort((a, b) => (this.parentOrders.get(a[0]) ?? 0) - (this.parentOrders.get(b[0]) ?? 0) || a[0]?.localeCompare(b[0] || "") || 0)
        .map(([parent, items]) => {
          const size = items.length
          const sorted = items
            .filter((i) => (i[4]?.layer || LAYER_DEFAULT) === layer)
            .sort((a, b) => {
              return (
                a[0] - b[0] ||
                (a[4]?.sort || 0) - (b[4]?.sort || 0) ||
                a[5]?.currentSelector?.localeCompare(b[5]?.currentSelector ?? "") ||
                a[1]?.localeCompare(b[1] || "") ||
                a[2]?.localeCompare(b[2] || "") ||
                0
              )
            })
            .map(([, selector, body, , meta, , variantNoMerge]) => {
              const scopedSelector = selector ? applyScope(selector, scope) : selector
              return [[[scopedSelector ?? "", meta?.sort ?? 0]], body, !!(variantNoMerge ?? meta?.noMerge)]
            })
          if (!sorted.length) return void 0
          const rules = sorted
            .reverse()
            .map(([selectorSortPair, body, noMerge], idx) => {
              if (!noMerge && this.config.mergeSelectors) {
                for (let i = idx + 1; i < size; i++) {
                  const current = sorted[i]
                  if (
                    current &&
                    !current[2] &&
                    ((selectorSortPair && current[0]) || (selectorSortPair == null && current[0] == null)) &&
                    current[1] === body
                  ) {
                    if (selectorSortPair && current[0]) current[0].push(...selectorSortPair)
                    return null
                  }
                }
              }
              const selectors = selectorSortPair
                ? uniq(
                    selectorSortPair
                      .sort((a, b) => a[1] - b[1] || a[0]?.localeCompare(b[0] || "") || 0)
                      .map((pair) => pair[0])
                      .filter(Boolean)
                  )
                : []
              return selectors.length ? `${selectors.join(`,${nl}`)}{${body}}` : body
            })
            .filter(Boolean)
            .reverse()
            .join(nl)
          if (!parent) return rules
          const parents = parent.split(" $$ ")
          return `${parents.join("{")}{${nl}${rules}${nl}${"}".repeat(parents.length)}`
        })
        .filter(Boolean)
        .join(nl)
      if (preflights) {
        css = [preflightsMap[layer], css].filter(Boolean).join(nl)
      }
      let alias
      if (outputCssLayers && css) {
        alias = getLayerAlias(layer)
        if (alias !== null) {
          css = `@layer ${alias}{${nl}${css}${nl}}`
        }
      }
      const layerMark = minify ? "" : `/* layer: ${layer}${alias && alias !== layer ? `, alias: ${alias}` : ""} */${nl}`
      return (layerCache[layer] = css ? layerMark + css : "")
    }
    const getLayers = (includes = layers, excludes) => {
      const layers2 = includes.filter((i) => !excludes?.includes(i))
      return [
        outputCssLayers && layers2.length > 0 ? `@layer ${layers2.map(getLayerAlias).filter(notNull).join(", ")};` : void 0,
        ...layers2.map((i) => getLayer(i) || ""),
      ]
        .filter(Boolean)
        .join(nl)
    }
    const setLayer = async (layer, callback) => {
      const content = await callback(getLayer(layer))
      layerCache[layer] = content
      return content
    }
    return {
      get css() {
        return getLayers()
      },
      layers,
      matched,
      getLayers,
      getLayer,
      setLayer,
    }
  }
  async matchVariants(raw, current) {
    const context = {
      rawSelector: raw,
      theme: this.config.theme,
      generator: this,
    }
    const match = async (result) => {
      let applied = true
      const [, , handlers, variants] = result
      while (applied) {
        applied = false
        const processed = result[1]
        for (const v of this.config.variants) {
          if (!v.multiPass && variants.has(v)) continue
          let handler = await v.match(processed, context)
          if (!handler) continue
          if (isString(handler)) {
            if (handler === processed) continue
            handler = {matcher: handler}
          }
          if (Array.isArray(handler)) {
            if (!handler.length) continue
            if (handler.length === 1) {
              handler = handler[0]
            } else {
              if (v.multiPass) throw new Error("multiPass can not be used together with array return variants")
              const clones = handler.map((h) => {
                const _processed = h.matcher ?? processed
                const _handlers = [h, ...handlers]
                const _variants = new Set(variants)
                _variants.add(v)
                return [result[0], _processed, _handlers, _variants]
              })
              return (await Promise.all(clones.map((c) => match(c)))).flat()
            }
          }
          result[1] = handler.matcher ?? processed
          handlers.unshift(handler)
          variants.add(v)
          applied = true
          break
        }
        if (!applied) break
        if (handlers.length > 500) throw new Error(`Too many variants applied to "${raw}"`)
      }
      return [result]
    }
    return await match([raw, current || raw, [], /* @__PURE__ */ new Set()])
  }
  applyVariants(parsed, variantHandlers = parsed[4], raw = parsed[1]) {
    const handler = variantHandlers
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .reduceRight(
        (previous, v) => (input) => {
          const entries = v.body?.(input.entries) || input.entries
          const parents = Array.isArray(v.parent) ? v.parent : [v.parent, void 0]
          return (v.handle ?? defaultVariantHandler)(
            {
              ...input,
              entries,
              selector: v.selector?.(input.selector, entries) || input.selector,
              parent: parents[0] || input.parent,
              parentOrder: parents[1] || input.parentOrder,
              layer: v.layer || input.layer,
              sort: v.sort || input.sort,
            },
            previous
          )
        },
        (input) => input
      )
    const variantContextResult = handler({
      prefix: "",
      selector: toEscapedSelector(raw),
      pseudo: "",
      entries: parsed[2],
    })
    const {parent, parentOrder} = variantContextResult
    if (parent != null && parentOrder != null) this.parentOrders.set(parent, parentOrder)
    const obj = {
      selector: [variantContextResult.prefix, variantContextResult.selector, variantContextResult.pseudo].join(""),
      entries: variantContextResult.entries,
      parent,
      layer: variantContextResult.layer,
      sort: variantContextResult.sort,
      noMerge: variantContextResult.noMerge,
    }
    for (const p of this.config.postprocess) p(obj)
    return obj
  }
  constructCustomCSS(context, body, overrideSelector) {
    const normalizedBody = normalizeCSSEntries(body)
    if (isString(normalizedBody)) return normalizedBody
    const {selector, entries, parent} = this.applyVariants([
      0,
      overrideSelector || context.rawSelector,
      normalizedBody,
      void 0,
      context.variantHandlers,
    ])
    const cssBody = `${selector}{${entriesToCss(entries)}}`
    if (parent) return `${parent}{${cssBody}}`
    return cssBody
  }
  async parseUtil(input, context, internal = false, shortcutPrefix) {
    const variantResults = isString(input) ? await this.matchVariants(input) : [input]
    const parse = async ([raw, processed, variantHandlers]) => {
      if (this.config.details) context.rules = context.rules ?? []
      const staticMatch = this.config.rulesStaticMap[processed]
      if (staticMatch) {
        if (staticMatch[1] && (internal || !staticMatch[2]?.internal)) {
          context.generator.activatedRules.add(staticMatch)
          if (this.config.details) context.rules.push(staticMatch)
          const index = this.config.rules.indexOf(staticMatch)
          const entry = normalizeCSSEntries(staticMatch[1])
          const meta = staticMatch[2]
          if (isString(entry)) return [[index, entry, meta]]
          else return [[index, raw, entry, meta, variantHandlers]]
        }
      }
      context.variantHandlers = variantHandlers
      const {rulesDynamic} = this.config
      for (const rule of rulesDynamic) {
        const [matcher, handler, meta] = rule
        if (meta?.internal && !internal) continue
        let unprefixed = processed
        if (meta?.prefix) {
          const prefixes = toArray(meta.prefix)
          if (shortcutPrefix) {
            const shortcutPrefixes = toArray(shortcutPrefix)
            if (!prefixes.some((i) => shortcutPrefixes.includes(i))) continue
          } else {
            const prefix = prefixes.find((i) => processed.startsWith(i))
            if (prefix == null) continue
            unprefixed = processed.slice(prefix.length)
          }
        }
        const match = unprefixed.match(matcher)
        if (!match) continue
        let result = await handler(match, context)
        if (!result) continue
        context.generator.activatedRules.add(rule)
        if (this.config.details) context.rules.push(rule)
        if (typeof result !== "string") {
          if (Symbol.asyncIterator in result) {
            const entries2 = []
            for await (const r of result) {
              if (r) entries2.push(r)
            }
            result = entries2
          } else if (Symbol.iterator in result && !Array.isArray(result)) {
            result = Array.from(result).filter(notNull)
          }
        }
        const entries = normalizeCSSValues(result).filter((i) => i.length)
        if (entries.length) {
          const index = this.config.rules.indexOf(rule)
          return entries.map((css) => {
            if (isString(css)) return [index, css, meta]
            let variants = variantHandlers
            let entryMeta = meta
            for (const entry of css) {
              if (entry[0] === symbols.variants) {
                variants = [...toArray(entry[1]), ...variants]
              } else if (entry[0] === symbols.parent) {
                variants = [{parent: entry[1]}, ...variants]
              } else if (entry[0] === symbols.selector) {
                variants = [{selector: entry[1]}, ...variants]
              } else if (entry[0] === symbols.layer) {
                variants = [{layer: entry[1]}, ...variants]
              } else if (entry[0] === symbols.sort) {
                entryMeta = {
                  ...entryMeta,
                  sort: entry[1],
                }
              }
            }
            return [index, raw, css, entryMeta, variants]
          })
        }
      }
    }
    const parsed = (await Promise.all(variantResults.map((i) => parse(i)))).flat().filter((x) => !!x)
    if (!parsed.length) return void 0
    return parsed
  }
  stringifyUtil(parsed, context) {
    if (!parsed) return
    if (isRawUtil(parsed)) return [parsed[0], void 0, parsed[1], void 0, parsed[2], this.config.details ? context : void 0, void 0]
    const {selector, entries, parent, layer: variantLayer, sort: variantSort, noMerge} = this.applyVariants(parsed)
    const body = entriesToCss(entries)
    if (!body) return
    const {layer: metaLayer, sort: metaSort, ...meta} = parsed[3] ?? {}
    const ruleMeta = {
      ...meta,
      layer: variantLayer ?? metaLayer,
      sort: variantSort ?? metaSort,
    }
    return [parsed[0], selector, body, parent, ruleMeta, this.config.details ? context : void 0, noMerge]
  }
  async expandShortcut(input, context, depth = 5) {
    if (depth === 0) return
    const recordShortcut = this.config.details
      ? (s) => {
          context.shortcuts = context.shortcuts ?? []
          context.shortcuts.push(s)
        }
      : noop
    let meta
    let result
    let stringResult
    let inlineResult
    for (const s of this.config.shortcuts) {
      let unprefixed = input
      if (s[2]?.prefix) {
        const prefixes = toArray(s[2].prefix)
        const prefix = prefixes.find((i) => input.startsWith(i))
        if (prefix == null) continue
        unprefixed = input.slice(prefix.length)
      }
      if (isStaticShortcut(s)) {
        if (s[0] === unprefixed) {
          meta = meta || s[2]
          result = s[1]
          recordShortcut(s)
          break
        }
      } else {
        const match = unprefixed.match(s[0])
        if (match) result = s[1](match, context)
        if (result) {
          meta = meta || s[2]
          recordShortcut(s)
          break
        }
      }
    }
    if (result) {
      stringResult = uniq(
        toArray(result)
          .filter(isString)
          .map((s) => expandVariantGroup(s.trim()).split(/\s+/g))
          .flat()
      )
      inlineResult = toArray(result)
        .filter((i) => !isString(i))
        .map((i) => ({handles: [], value: i}))
    }
    if (!result) {
      const matched = isString(input) ? await this.matchVariants(input) : [input]
      for (const match of matched) {
        const [raw, inputWithoutVariant, handles] = match
        if (raw !== inputWithoutVariant) {
          const expanded = await this.expandShortcut(inputWithoutVariant, context, depth - 1)
          if (expanded) {
            stringResult = expanded[0].filter(isString).map((item) => raw.replace(inputWithoutVariant, item))
            inlineResult = expanded[0]
              .filter((i) => !isString(i))
              .map((item) => {
                return {handles: [...item.handles, ...handles], value: item.value}
              })
          }
        }
      }
    }
    if (!stringResult?.length && !inlineResult?.length) return
    return [
      [
        await Promise.all(toArray(stringResult).map(async (s) => (await this.expandShortcut(s, context, depth - 1))?.[0] || [s])),
        inlineResult,
      ]
        .flat(2)
        .filter((x) => !!x),
      meta,
    ]
  }
  async stringifyShortcuts(parent, context, expanded, meta = {layer: this.config.shortcutsLayer}) {
    const layerMap = new BetterMap()
    const parsed = (
      await Promise.all(
        uniq(expanded).map(async (i) => {
          const result = isString(i)
            ? await this.parseUtil(i, context, true, meta.prefix)
            : [[Number.POSITIVE_INFINITY, "{inline}", normalizeCSSEntries(i.value), void 0, i.handles]]
          if (!result && this.config.warn) warnOnce(`unmatched utility "${i}" in shortcut "${parent[1]}"`)
          return result || []
        })
      )
    )
      .flat(1)
      .filter(Boolean)
      .sort((a, b) => a[0] - b[0])
    const [raw, , parentVariants] = parent
    const rawStringifiedUtil = []
    for (const item of parsed) {
      if (isRawUtil(item)) {
        rawStringifiedUtil.push([item[0], void 0, item[1], void 0, item[2], context, void 0])
        continue
      }
      const {selector, entries, parent: parent2, sort, noMerge, layer} = this.applyVariants(item, [...item[4], ...parentVariants], raw)
      const selectorMap = layerMap.getFallback(layer ?? meta.layer, new TwoKeyMap())
      const mapItem = selectorMap.getFallback(selector, parent2, [[], item[0]])
      mapItem[0].push([entries, !!(noMerge ?? item[3]?.noMerge), sort ?? 0])
    }
    return rawStringifiedUtil.concat(
      layerMap.flatMap((selectorMap, layer) =>
        selectorMap
          .map(([e2, index], selector, joinedParents) => {
            const stringify = (flatten, noMerge, entrySortPair) => {
              const maxSort = Math.max(...entrySortPair.map((e3) => e3[1]))
              const entriesList = entrySortPair.map((e3) => e3[0])
              return (flatten ? [entriesList.flat(1)] : entriesList).map((entries) => {
                const body = entriesToCss(entries)
                if (body) return [index, selector, body, joinedParents, {...meta, noMerge, sort: maxSort, layer}, context, void 0]
                return void 0
              })
            }
            const merges = [
              [e2.filter(([, noMerge]) => noMerge).map(([entries, , sort]) => [entries, sort]), true],
              [e2.filter(([, noMerge]) => !noMerge).map(([entries, , sort]) => [entries, sort]), false],
            ]
            return merges.map(([e3, noMerge]) => [
              ...stringify(
                false,
                noMerge,
                e3.filter(([entries]) => entries.some((entry) => entry[0] === symbols.shortcutsNoMerge))
              ),
              ...stringify(
                true,
                noMerge,
                e3.filter(([entries]) => entries.every((entry) => entry[0] !== symbols.shortcutsNoMerge))
              ),
            ])
          })
          .flat(2)
          .filter(Boolean)
      )
    )
  }
  isBlocked(raw) {
    return (
      !raw ||
      this.config.blocklist
        .map((e2) => (Array.isArray(e2) ? e2[0] : e2))
        .some((e2) => (typeof e2 === "function" ? e2(raw) : isString(e2) ? e2 === raw : e2.test(raw)))
    )
  }
  getBlocked(raw) {
    const rule = this.config.blocklist.find((e2) => {
      const v = Array.isArray(e2) ? e2[0] : e2
      return typeof v === "function" ? v(raw) : isString(v) ? v === raw : v.test(raw)
    })
    return rule ? (Array.isArray(rule) ? rule : [rule, void 0]) : void 0
  }
}
async function createGenerator(config, defaults) {
  return await UnoGeneratorInternal.create(config, defaults)
}
var regexScopePlaceholder = /\s\$\$\s+/g
function hasScopePlaceholder(css) {
  return regexScopePlaceholder.test(css)
}
function applyScope(css, scope) {
  if (hasScopePlaceholder(css)) return css.replace(regexScopePlaceholder, scope ? ` ${scope} ` : " ")
  else return scope ? `${scope} ${css}` : css
}
var attributifyRe = /^\[(.+?)(~?=)"(.*)"\]$/
function toEscapedSelector(raw) {
  if (attributifyRe.test(raw)) return raw.replace(attributifyRe, (_, n, s, i) => `[${e(n)}${s}"${e(i)}"]`)
  return `.${e(raw)}`
}
function defaultVariantHandler(input, next) {
  return next(input)
}

// ../../../node_modules/.pnpm/unocss@65.4.3_postcss@8.4.38_rollup@4.34.4_vite@6.1.0_@types+node@20.14.2_jiti@2.4.2_tsx@4.19_vxepn2vk32nwu3jhuyh5hcmcb4/node_modules/unocss/dist/index.mjs
function defineConfig(config) {
  return config
}

// ../unocss/values/makeValue.ts
var splitValues = (value, project = cssvar) => {
  if (value.includes("|")) return value.split("|").map(project)
  return value.split("/").map(project)
}
var makeValues = (value, project = cssvar) => splitValues(value, project).join(" ")
var makeCommaValues = (value, project = cssvar) => value.split(",").map(project).join(",")
var makeSide = (value) => makeValues(value, px)
var makeRatio = (value) => {
  const [w, h] = value.split(/[:/]/)
  return ((+h / +w) * 100).toFixed(2) + "%"
}
var makeNumber = (num) => num.toFixed(2).replace(/^0+|\.00$|0+$/g, "") || "0"
var cssvar = (value) => (String(value).startsWith("--") ? `var(${value})` : value)
var px = (value) => {
  if (value === void 0 || value === null) throw new Error("px: value is undefined")
  if (value === 0 || value === "0") return 0
  const v = String(value)
  if (v.startsWith("--")) return cssvar("" + value)
  const [n, m] = v.split("/")
  if (+n > 0 && +m > 0) return makeNumber((+n / +m) * 100) + "%"
  if (/.[-+*/]/.test(v) && /\d/.test(v)) {
    return "calc(" + v.replace(/[-+]/g, (a) => ` ${a} `) + ")"
  }
  return +value === +value ? value + "px" : value
}
var deg = (value) => {
  if (value === void 0 || value === null) throw new Error("deg: value is undefined")
  if (value === 0 || value === "0") return 0
  const v = String(value)
  if (v.startsWith("--")) return cssvar("" + value)
  if (/.[-+*/]/.test(v) && /\d/.test(v)) {
    return "calc(" + v.replace(/[-+]/g, (a) => ` ${a} `) + ")"
  }
  return +value === +value ? value + "deg" : value
}
var rpx = (value) => {
  if (value === "fill") return "9999px"
  return px(value)
}
var percentToEm = (value) => {
  if (value.endsWith("%")) return +value.slice(0, -1) / 100 + "em"
  return px(value)
}
var makeHEX = (value) => {
  const [rgb, a] = value.split(".")
  if (a && rgb.length === 4)
    return (
      "rgba(" +
      rgb
        .slice(1)
        .split("")
        .map((value2) => parseInt(value2 + value2, 16))
        .join(",") +
      ",." +
      a +
      ")"
    )
  if (a)
    return "rgba(" + [rgb.slice(1, 3), rgb.slice(3, 5), rgb.slice(5, 7)].map((value2) => parseInt(value2, 16)).join(",") + ",." + a + ")"
  return value
}
var makeHLS = (value) => {
  const [h, s, l, a] = value.split(",")
  return "hsl" + (a ? "a" : "") + "(" + [h, s, l, a].filter(Boolean).map(cssvar).join() + ")"
}
var makeRGB = (value) => {
  const [r, g, b, a] = value.split(",")
  return "rgb" + (a ? "a" : "") + "(" + [r, g, b, a].filter(Boolean).map(cssvar).join() + ")"
}
var makeColor = (value = "transparent") => {
  if (value === "-") return "transparent"
  if (value === "transparent") return "transparent"
  if (value.startsWith("--")) return `var(${value})`
  if (value.split(",").every((v) => parseFloat(v) >= 0)) {
    if (value.includes("%")) {
      return makeHLS(value)
    }
    return makeRGB(value)
  }
  return value
}
var makeBorder = (value) => {
  if (!value || value === "none" || value === "0" || value === "-") return "none"
  const borderStyles = ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"]
  let hasWidth = false
  let hasStyle = false
  const values = splitValues(value, (value2) => {
    if (+value2 > 0) {
      hasWidth = true
      return px(value2)
    }
    if (borderStyles.includes(String(value2))) {
      hasStyle = true
      return value2
    }
    return makeColor(String(value2))
  })
  if (!hasWidth) values.unshift("1px")
  if (!hasStyle) values.unshift("solid")
  return values.join(" ")
}
var makeTransition = (value) => {
  if (!/\d/.test(value)) return value
  if (!value.includes("=")) return makeValues(value)
  return value
    .split(/[/|]/)
    .map((item) => item.replace("=", " "))
    .join(",")
}
var makePosition2X = (x) => {
  if (x.startsWith("center")) {
    const offset = x.slice(6) || 0
    return {
      left: "50%",
      transform: `translateX(-50%) translateX(${px(offset)})`,
    }
  }
  const [left, right] = x.split(/\.\.|~/)
  return {
    ...(left ? {left: px(left)} : {}),
    ...(right ? {right: px(right)} : {}),
  }
}
var makePosition2Y = (y) => {
  if (y.startsWith("center")) {
    const offset = y.slice(6) || 0
    return {
      top: "50%",
      transform: `translateY(-50%) translateY(${px(offset)})`,
    }
  }
  const [top, bottom] = y.split(/\.\.|~/)
  return {
    ...(top ? {top: px(top)} : {}),
    ...(bottom ? {bottom: px(bottom)} : {}),
  }
}

// ../unocss/rules/rule-font.ts
var makeFontFamily = (value) => ({
  fontFamily: `${value}; font-family: var(--${value}, ${value});`,
})
var RULES_FONT_UNOCSS = {
  // -- Typography
  "font": function* (value) {
    if (!value) return
    const handlers = [
      (v) => ({"font-size": px(v)}),
      (v) => ({"line-height": +v < 4 ? makeNumber(+v) : px(v)}),
      (v) => ({"letter-spacing": px(percentToEm(v))}),
      (v) => ({"font-weight": cssvar(v)}),
      (v) => ({"font-family": cssvar(v)}),
    ]
    for (const [i, val] of value.split("/").entries()) {
      if (val === "-") continue
      yield handlers[i](val)
    }
  },
  // Font
  "font-size": (value) => ({"font-size": px(value)}),
  "line-height": (value) => ({
    "line-height": +value < 4 ? makeNumber(+value) : px(value),
  }),
  "letter-spacing": (value) => ({"letter-spacing": percentToEm(value)}),
  "word-spacing": (value) => ({"word-spacing": px(value)}),
  // Font Weight
  "100": () => ({"font-weight": 100}),
  "200": () => ({"font-weight": 200}),
  "300": () => ({"font-weight": 300}),
  "400": () => ({"font-weight": 400}),
  "500": () => ({"font-weight": 500}),
  "600": () => ({"font-weight": 600}),
  "700": () => ({"font-weight": 700}),
  "800": () => ({"font-weight": 800}),
  "900": () => ({"font-weight": 900}),
  "thin": () => ({"font-weight": 200}),
  "light": () => ({"font-weight": 300}),
  "regular": () => ({"font-weight": "normal"}),
  "medium": () => ({"font-weight": 500}),
  "semibold": () => ({"font-weight": 600}),
  "bold": () => ({"font-weight": "bold"}),
  "heavy": () => ({"font-weight": 900}),
  // Font Weight Utility
  "thicker": (value = "1") => `text-shadow:0 0 ${px(value)} currentColor;`,
  // Font-Style
  "italic": () => ({"font-style": "italic"}),
  "overline": () => ({"text-decoration": "overline"}),
  "underline": () => ({"text-decoration": "underline"}),
  "line-through": () => ({"text-decoration": "line-through"}),
  "strike": () => ({"text-decoration": "line-through"}),
  "del": () => ({"text-decoration": "line-through"}),
  "small-caps": () => ({"font-variant-caps": "small-caps"}),
  "all-small-caps": () => ({"font-variant-caps": "all-small-caps"}),
  "slashed-zero": () => ({"font-variant-numeric": "slashed-zero"}),
  "tabular-nums": () => ({"font-variant-numeric": "tabular-nums"}),
  "lowercase": () => ({"text-transform": "lowercase"}),
  "uppercase": () => ({"text-transform": "uppercase"}),
  "capitalize": () => ({"text-transform": "capitalize"}),
  // @TODO:font-family:var(--serif),serif; 이게 먹히나?
  "sans": () => makeFontFamily("sans"),
  "sans-serif": () => makeFontFamily("sans-serif"),
  "serif": () => makeFontFamily("serif"),
  "cursive": () => makeFontFamily("cursive"),
  "fantasy": () => makeFontFamily("fantasy"),
  "system-ui": () => makeFontFamily("system-ui"),
  "monospace": (value) => {
    if (value === "number") return `font-variant-numeric:tabular-nums;`
    return makeFontFamily("monospace")
  },
  // -- Color
  "c": (value) => {
    if (value === "current") return {color: "currentColor"}
    if (value.startsWith("linear-gradient"))
      return {
        "background": value.replace(/\//g, " "),
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent",
      }
    if (value.startsWith("radial-gradient"))
      return {
        "background": value.replace(/\//g, " "),
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent",
      }
    return {color: makeColor(value)}
  },
  "color": (value) => RULES_FONT_UNOCSS.c(value),
  "caret": (value) => ({"caret-color": makeColor(value)}),
  "caret-current": () => ({"caret-color": "currentColor"}),
  // @deprecated
  // Font-Family @TODO:font-stack은 일반적인 스택 만들어 두기...(L),Roboto,NotoSans와 같은것도 만들까?
  // @TODO: Font-Family Utility
  "AppleSD": () => `font-family:"Apple SD Gothic Neo";`,
  "Roboto": () => makeFontFamily("Roboto"),
}

// ../unocss/rules/rule-layout.ts
var LAYOUT_MAP = {
  row: {
    aligns: {
      top: "flex-start",
      middle: "center",
      pack: "center",
      bottom: "flex-end",
      fill: "stretch",
    },
    justify: {
      "left": "flex-start",
      "left+reverse": "flex-end",
      "right": "flex-end",
      "right+reverse": "flex-start",
      "center": "center",
      "center+reverse": "center",
      "pack": "center",
      "pack+reverse": "center",
    },
    defaultAlign: "middle",
  },
  column: {
    aligns: {
      left: "flex-start",
      center: "center",
      pack: "center",
      right: "flex-end",
      fill: "stretch",
    },
    justify: {
      "top": "flex-start",
      "top+reverse": "flex-end",
      "bottom": "flex-end",
      "bottom+reverse": "flex-start",
      "middle": "center",
      "middle+reverse": "center",
      "pack": "center",
      "pack+reverse": "center",
    },
    defaultAlign: "fill",
  },
}
function* makeBoxAligns(direction = "row", value = "") {
  const [baseDirection, wrap] = direction.split(" ")
  const values = value.split(/[+/|]/)
  const layout = LAYOUT_MAP[baseDirection]
  const hasReverse = values.includes("reverse")
  yield {
    "flex-flow": [hasReverse ? `${baseDirection}-reverse` : baseDirection, wrap].filter(Boolean).join(" "),
  }
  const alignValue = values.findLast((v) => v in layout.aligns) || layout.defaultAlign
  yield {"align-items": layout.aligns[alignValue]}
  const justifyKey = values.findLast((v) => v in layout.justify)
  const justifyWithReverse = justifyKey && hasReverse ? `${justifyKey}+reverse` : justifyKey
  if (justifyWithReverse) {
    yield {"justify-content": layout.justify[justifyWithReverse]}
  }
}
function* makeFlexFill(isRow) {
  yield {
    [symbols.selector]: (s) => `:where(${s}>*)`,
    [symbols.sort]: -1,
    flex: "none",
  }
  yield {
    [symbols.selector]: (s) => `:where(${s}>.${isRow ? "w" : "h"}\\(fill\\))`,
    flex: "1 0 0",
  }
  yield {
    [symbols.selector]: (s) => `:where(${s}>.${isRow ? "h" : "w"}\\(fill\\))`,
    "align-self": "stretch",
  }
}
var makeHBoxFill = () => makeFlexFill(true)
var makeVBoxFill = () => makeFlexFill(false)
var RULES_AUTO_LAYOUT_UNOCSS = {
  // Box-Model
  "w": function* (value) {
    if (value === "hug") {
      yield {width: "fit-content"}
      return
    }
    if (value === "fill") {
      yield {"min-width": "1px", "max-width": "100%"}
      return
    }
    if (value.includes("~")) {
      const values = value.split("~")
      if (values.length <= 2) {
        const [min2, max2] = value.split("~")
        yield {
          ...(min2 && {"min-width": px(min2)}),
          ...(max2 && {"max-width": px(max2)}),
        }
        return
      }
      const [min, width, max] = values
      yield {
        ...(min && {"min-width": px(min)}),
        ...(max && {"max-width": px(max)}),
        ...{width: px(width)},
      }
      return
    }
    yield {width: px(value)}
  },
  "h": function* (value) {
    if (value === "hug") {
      yield {height: "fit-content"}
      return
    }
    if (value === "fill") {
      yield {"min-height": "1px", "max-height": "100%"}
      return
    }
    if (value.includes("~")) {
      const values = value.split("~")
      if (values.length <= 2) {
        const [min2, max2] = value.split("~")
        yield {
          ...(min2 && {"min-height": px(min2)}),
          ...(max2 && {"max-height": px(max2)}),
        }
        return
      }
      const [min, width, max] = values
      yield {
        ...(min && {"min-height": px(min)}),
        ...(max && {"max-height": px(max)}),
        ...{height: px(width)},
      }
      return
    }
    yield {height: px(value)}
    return
  },
  "min-w": (value) => ({"min-width": px(value)}),
  "max-w": (value) => ({"max-width": px(value)}),
  "min-h": (value) => ({"min-height": px(value)}),
  "max-h": (value) => ({"max-height": px(value)}),
  // -- Flexbox Layout
  "hbox": function* (value = "") {
    yield {display: "flex"}
    yield* makeBoxAligns("row", value)
    yield* makeHBoxFill()
  },
  "vbox": function* (value = "") {
    yield {display: "flex"}
    yield* makeBoxAligns("column", value)
    yield* makeVBoxFill()
    yield {
      [symbols.selector]: (s) => `${s}.pack`,
      "align-items": "center",
    }
  },
  "wrap": function* (value = "") {
    yield {display: "flex"}
    yield* makeBoxAligns("row wrap", value)
    yield* makeHBoxFill()
  },
  "pack": function* () {
    yield {display: "flex"}
    yield* makeBoxAligns("row", "center+middle")
    yield* makeHBoxFill()
  },
  // gap
  "gap": function* (value) {
    if (value === "auto") {
      yield {
        "justify-content": "space-between",
        "align-content": "space-between",
      }
      yield {
        [symbols.selector]: (s) => `${s}>:only-child`,
        margin: "auto",
      }
      return
    }
    yield {
      "grid-gap": makeSide(value),
      "gap": makeSide(value),
    }
  },
  // @deprecated
  "subbox": () => ({
    "display": "flex",
    "flex-flow": "inherit",
    "align-items": "inherit",
    "justify-content": "inherit",
  }),
  // @NOTE:IE,safari<=13
  "hgap": (value) => `&>*+*{margin-left':${px(value)};}`,
  "hgap-reverse": (value) => `&>*+*{margin-right:${px(value)};}`,
  "vgap": (value) => `&>*+*{margin-top:${px(value)};}`,
  "vgap-reverse": (value) => `&>*+*{margin-bottom:${px(value)};}`,
  // flex: @deprecated
  "space-between": () => ({
    "justify-content": "space-between",
    "align-content": "space-between",
  }),
  "space-around": () => ({
    "justify-content": "space-around",
    "align-content": "space-around",
  }),
  "space-evenly": () => ({
    "justify-content": "space-evenly",
    "align-content": "space-evenly",
  }),
  // flex: @deprecated
  "space": (value) => `[class*="hbox"]>&{width:${px(value)};}[class*="vbox"]>&{height:${px(value)};}`,
  "order": (value) => ({order: cssvar(value)}),
  "flex": (value) => ({flex: cssvar(value)}),
}

// ../../vite/src/core/makeValue.ts
var makeNumber2 = (num) => num.toFixed(2).replace(/^0+|\.00$|0+$/g, "") || "0"
var cssvar2 = (value) => (String(value).startsWith("--") ? `var(${value})` : value)
var px2 = (value) => {
  if (value === void 0 || value === null) throw new Error("px: value is undefined")
  if (value === 0 || value === "0") return 0
  const v = String(value)
  if (v.startsWith("--")) return cssvar2("" + value)
  const [n, m] = v.split("/")
  if (+n > 0 && +m > 0) return makeNumber2((+n / +m) * 100) + "%"
  if (/.[-+*/]/.test(v) && /\d/.test(v)) {
    return "calc(" + v.replace(/[-+]/g, (a) => ` ${a} `) + ")"
  }
  return +value === +value ? value + "px" : value
}

// ../unocss/rules/rule-text.ts
var RULES_TEXT_UNOCSS = {
  // Text Alignment
  "text": function* (value = "") {
    const values = value.split("+")
    for (const v of values) {
      switch (v) {
        case "left":
          yield {"text-align": "left"}
          break
        case "center":
          yield {"text-align": "center"}
          break
        case "right":
          yield {"text-align": "right"}
          break
        case "justify":
          yield {"text-align": "justify"}
          break
        case "top":
          yield {display: "flex"}
          yield {"flex-flow": "column"}
          yield {"justify-content": "flex-start"}
          break
        case "middle":
          yield {display: "flex"}
          yield {"flex-flow": "column"}
          yield {"justify-content": "center"}
          break
        case "bottom":
          yield {display: "flex"}
          yield {"flex-flow": "column"}
          yield {"justify-content": "flex-end"}
          break
        case "pack":
          yield {display: "flex"}
          yield {"flex-flow": "column"}
          yield {"align-items": "center", "justify-content": "center"}
          yield {"text-align": "center"}
          break
      }
    }
  },
  // OverFlow + Text
  "white-space-normal": () => ({"white-space": "normal"}),
  "pre": () => ({"white-space": "pre-wrap"}),
  "pre-wrap": () => ({"white-space": "pre-wrap"}),
  "pre-line": () => ({"white-space": "pre-line"}),
  "break-spaces": () => ({"white-space": "break-spaces"}),
  "nowrap": () => ({"white-space": "nowrap", "width": "max-content"}),
  // Truncate
  "nowrap...": () => ({
    "white-space": "nowrap",
    "max-width": "100%",
    "flex-shrink": "1",
    "overflow": "hidden",
    "text-overflow": "ellipsis",
  }),
  // max-lines
  "max-lines": function* (value) {
    yield {
      "overflow": "hidden",
      "display": "-webkit-box",
      "-webkit-box-orient": "vertical",
    }
    yield {"-webkit-line-clamp": value}
  },
  // line-clamp?
  // @NOTE:figma-first라서 정식은 max-lines이다.
  // @NOTE:하위 호환성을 위해 line-clamp 그냥 둘다 제공한다.
  "line-clamp": (value) => RULES_TEXT_UNOCSS["max-lines"](value),
  // ---
  // Text Indent
  "text-indent": (value) => ({"text-indent": px2(value)}),
  // Text Wrap
  "keep-all": () => ({"word-break": "keep-all"}),
  "break-all": () => ({"word-break": "break-all"}),
  "break-word": () => ({"overflow-wrap": "break-word"}),
  "hyphens": (value = "auto") => ({hyphens: value}),
  // @deprecated: vertical-align
  "vertical-top": () => ({"vertical-align": "top"}),
  "vertical-middle": () => ({"vertical-align": "middle"}),
  "vertical-bottom": () => ({"vertical-align": "bottom"}),
  "sub": () => ({"vertical-align": "sub"}),
  "super": () => ({"vertical-align": "super"}),
  "text-top": () => ({"vertical-align": "text-top"}),
  "text-bottom": () => ({"vertical-align": "text-bottom"}),
}

// ../unocss/rules/rule-display.ts
var makeScreenReaderOnly = () => ({
  "position": "absolute",
  "width": "1px",
  "height": "1px",
  "padding": "0",
  "border": "0",
  "margin": "-1px",
  "white-space": "nowrap",
  "overflow": "hidden",
  "clip-path": "inset(100%)",
})
var RULES_DISPLAY_UNOCSS = {
  // -- Display
  "block": () => ({display: "block"}),
  "inline-block": () => ({display: "inline-block"}),
  "inline": () => ({display: "inline"}),
  "inline-flex": () => ({display: "inline-flex"}),
  "table": () => ({display: "table"}),
  "inline-table": () => ({display: "inline-table"}),
  "table-caption": () => ({display: "table-caption"}),
  "table-cell": () => ({display: "table-cell"}),
  "table-column": () => ({display: "table-column"}),
  "table-column-group": () => ({display: "table-column-group"}),
  "table-footer-group": () => ({display: "table-footer-group"}),
  "table-header-group": () => ({display: "table-header-group"}),
  "table-row-group": () => ({display: "table-row-group"}),
  "table-row": () => ({display: "table-row"}),
  "flow-root": () => ({display: "flow-root"}),
  "contents": () => ({display: "contents"}),
  "list-item": () => ({display: "list-item"}),
  // Visibility
  "none": () => ({display: "none"}),
  "hidden": () => ({visibility: "hidden"}),
  "invisible": () => ({visibility: "hidden"}),
  "blind": () => makeScreenReaderOnly(),
  "sr-only": () => makeScreenReaderOnly(),
  "gone": () => makeScreenReaderOnly(),
  // OverFlow
  "clip": function* () {
    yield {overflow: "hidden"}
    yield {overflow: "clip", [symbols.sort]: 1}
    yield {
      [symbols.selector]: (s) => `${s}:has(.nowrap\\.\\.\\.)`,
      "flex-shrink": "1",
    }
  },
}

// ../unocss/rules/rule-position.ts
var RULES_POSITION_UNOCSS = {
  // -- Position Utilities
  "layer": (value = "") => {
    const pos = {top: "0", right: "0", bottom: "0", left: "0"}
    const outsides = []
    let outside = false
    value.split("+").forEach((v) => {
      const [direction, value2 = "0"] = v.split(":")
      switch (direction) {
        case "top": {
          pos.top = value2
          pos.bottom = void 0
          outsides.push("top")
          return
        }
        case "right": {
          pos.right = value2
          pos.left = void 0
          outsides.push("right")
          return
        }
        case "bottom": {
          pos.bottom = value2
          pos.top = void 0
          outsides.push("bottom")
          return
        }
        case "left": {
          pos.left = value2
          pos.right = void 0
          outsides.push("left")
          return
        }
        case "outside": {
          outside = true
          return
        }
      }
    })
    if (outside) {
      const revert = (b, a) => {
        pos[a] = pos[b] === "0" ? "100%" : `calc(100% + ${px(pos[b])})`
        pos[b] = void 0
      }
      outsides.forEach((direction) => {
        switch (direction) {
          case "top":
            return revert("top", "bottom")
          case "right":
            return revert("right", "left")
          case "bottom":
            return revert("bottom", "top")
          case "left":
            return revert("left", "right")
        }
      })
    }
    const styles = {
      position: "absolute",
    }
    Object.entries(pos).forEach(([key, value2]) => {
      if (value2 !== void 0) {
        styles[key] = px(value2)
      }
    })
    return styles
  },
  "absolute": (value = "") => ({
    position: "absolute",
    // ...makePosition(value),
  }),
  "relative": (value = "") => ({
    position: "relative",
    // ...makePosition(value),
  }),
  "sticky": (value = "") => ({
    position: "sticky",
    // ...makePosition(value),
  }),
  "sticky-top": (value = 0) => ({position: "sticky", top: px(value)}),
  "sticky-right": (value = 0) => ({position: "sticky", right: px(value)}),
  "sticky-bottom": (value = 0) => ({position: "sticky", bottom: px(value)}),
  "sticky-left": (value = 0) => ({position: "sticky", left: px(value)}),
  "fixed": (value = "") => ({
    position: "fixed",
    // ...makePosition(value),
  }),
  "static": () => ({position: "static"}),
  // Position
  "top": (value) => ({top: px(value)}),
  "left": (value) => ({left: px(value)}),
  "right": (value) => ({right: px(value)}),
  "bottom": (value) => ({bottom: px(value)}),
  "x": (value) => makePosition2X(value),
  "y": (value) => makePosition2Y(value),
  "z": (value) => ({"z-index": cssvar(value)}),
}

// ../unocss/rules.ts
var RULES_FOR_UNOCSS = {
  ...RULES_AUTO_LAYOUT_UNOCSS,
  ...RULES_FONT_UNOCSS,
  ...RULES_TEXT_UNOCSS,
  ...RULES_DISPLAY_UNOCSS,
  ...RULES_POSITION_UNOCSS,
  // -- Box
  // Box-Sizing
  "border-box": () => ({"box-sizing": "border-box"}),
  "content-box": () => ({"box-sizing": "content-box"}),
  // BoxModel - Margin
  "m": (value) => ({margin: makeSide(value)}),
  "mx": (value) => ({"margin-left": px(value), "margin-right": px(value)}),
  "my": (value) => ({"margin-top": px(value), "margin-bottom": px(value)}),
  "mt": (value) => ({"margin-top": px(value)}),
  "mr": (value) => ({"margin-right": px(value)}),
  "mb": (value) => ({"margin-bottom": px(value)}),
  "ml": (value) => ({"margin-left": px(value)}),
  // BoxModel - Padding
  "p": (value) => ({padding: makeSide(value)}),
  "px": (value) => ({"padding-left": px(value), "padding-right": px(value)}),
  "py": (value) => ({"padding-top": px(value), "padding-bottom": px(value)}),
  "pt": (value) => ({"padding-top": px(value)}),
  "pr": (value) => ({"padding-right": px(value)}),
  "pb": (value) => ({"padding-bottom": px(value)}),
  "pl": (value) => ({"padding-left": px(value)}),
  // BoxModel - Border
  "no-border": () => ({border: "none", outline: "none"}),
  "b": (value) => ({border: makeBorder(value)}),
  "bx": (value) => ({
    "border-left": makeBorder(value),
    "border-right": makeBorder(value),
  }),
  "by": (value) => ({
    "border-top": makeBorder(value),
    "border-bottom": makeBorder(value),
  }),
  "bt": (value) => ({"border-top": makeBorder(value)}),
  "br": (value) => ({"border-right": makeBorder(value)}),
  "bb": (value) => ({"border-bottom": makeBorder(value)}),
  "bl": (value) => ({"border-left": makeBorder(value)}),
  "bw": (value) => ({"border-width": makeValues(value, px)}),
  "bxw": (value) => ({"border-left-width": px(value), "border-right-width": px(value)}),
  "byw": (value) => ({"border-top-width": px(value), "border-bottom-width": px(value)}),
  "btw": (value) => ({"border-top-width": px(value)}),
  "brw": (value) => ({"border-right-width": px(value)}),
  "bbw": (value) => ({"border-bottom-width": px(value)}),
  "blw": (value) => ({"border-left-width": px(value)}),
  "bs": (value) => ({"border-style": makeValues(value)}),
  "bxs": (value) => ({
    "border-left-style": cssvar(value),
    "border-right-style": cssvar(value),
  }),
  "bys": (value) => ({
    "border-top-style": cssvar(value),
    "border-bottom-style": cssvar(value),
  }),
  "bts": (value) => ({"border-top-style": cssvar(value)}),
  "brs": (value) => ({"border-right-style": cssvar(value)}),
  "bbs": (value) => ({"border-bottom-style": cssvar(value)}),
  "bls": (value) => ({"border-left-style": cssvar(value)}),
  "bc": (value) => ({"border-color": makeValues(value, makeColor)}),
  "bxc": (value) => ({
    "border-left-color": makeColor(value),
    "border-right-color": makeColor(value),
  }),
  "byc": (value) => ({
    "border-top-color": makeColor(value),
    "border-bottom-color": makeColor(value),
  }),
  "btc": (value) => ({"border-top-color": makeColor(value)}),
  "brc": (value) => ({"border-right-color": makeColor(value)}),
  "bbc": (value) => ({"border-bottom-color": makeColor(value)}),
  "blc": (value) => ({"border-left-color": makeColor(value)}),
  // outline
  "outline": (value) => ({outline: makeBorder(value)}),
  // @FIXME:
  // 'guide': (value: string, unocss) => {
  //   // @FIXME:
  //   value = value === 'undefined' ? '#4f80ff' : value;
  //
  //   const { symbols } = unocss;
  //   return {
  //     [symbols.selector]: (s) => `${s},div:has(>.guide),${s} *:hover`,
  //     outline: makeBorder(value),
  //   };
  // },
  // border-radius
  "r": (value) => ({"border-radius": makeValues(value, rpx)}),
  "rt": (value) => ({
    "border-top-left-radius": rpx(value),
    "border-top-right-radius": rpx(value),
  }),
  "rr": (value) => ({
    "border-top-right-radius": rpx(value),
    "border-bottom-right-radius": rpx(value),
  }),
  "rb": (value) => ({
    "border-bottom-left-radius": rpx(value),
    "border-bottom-right-radius": rpx(value),
  }),
  "rl": (value) => ({
    "border-top-left-radius": rpx(value),
    "border-bottom-left-radius": rpx(value),
  }),
  "rtl": (value) => ({"border-top-left-radius": rpx(value)}),
  "rtr": (value) => ({"border-top-right-radius": rpx(value)}),
  "rbr": (value) => ({"border-bottom-right-radius": rpx(value)}),
  "rbl": (value) => ({"border-bottom-left-radius": rpx(value)}),
  // box-shadow
  "ring": (value) => {
    const [color, size = 1] = value.split("/")
    return {"box-shadow": `0 0 0 ${px(size)} ${makeColor(color)}`}
  },
  "box-shadow": (value) => ({
    "box-shadow": `${makeValues(value, (v) => (Number.isInteger(+v) ? px(v) : cssvar(v)))}`,
  }),
  // -- Background
  "bg": (value) => {
    if (value.startsWith("linear-gradient")) return {background: `${value.replace(/\//g, " ")}`}
    if (value.startsWith("radial-gradient")) return {background: `${value.replace(/\//g, " ")}`}
    if (value.startsWith("url")) return {"background-image": `${value}`}
    if (/^(http|[./])/.test(value)) return {"background-image": `url(${value})`}
    if (value === "transparent") return {background: "transparent"}
    return {background: makeColor(value)}
  },
  "bg-image": (value) => {
    if (value.startsWith("url")) return {"background-image": value}
    return {"background-image": `url(${value})`}
  },
  "background-image": (value) => RULES_FOR_UNOCSS["bg-image"](value),
  "bg-position": (value) => ({"background-position": makeValues(value)}),
  // @TODO:background 이미지에 대한 세련된 방법이 필요하다!
  "bg-repeat-x": () => ({"background-repeat": "repeat-x"}),
  "bg-repeat-y": () => ({"background-repeat": "repeat-y"}),
  "bg-no-repeat": () => ({"background-repeat": "no-repeat"}),
  "bg-fixed": () => ({"background-attachment": "fixed"}),
  "bg-scroll": () => ({"background-attachment": "scroll"}),
  "contain": () => ({
    "background-size": "contain",
    "background-position": "center",
    "background-repeat": "no-repeat",
    "object-fit": "contain",
  }),
  "cover": () => ({
    "background-size": "cover",
    "background-position": "center",
    "background-repeat": "no-repeat",
    "object-fit": "cover",
  }),
  // Scroll
  "scroll": () => ({overflow: "auto"}),
  "scroll-x": () => ({"overflow-x": "scroll", "overflow-y": "hidden"}),
  "scroll-y": () => ({"overflow-x": "hidden", "overflow-y": "auto"}),
  // @TODO
  "scrollbar": () => `&{overflow:scroll;}&.scroll{overflow:scroll;}&.scroll-x{overflow-x:scroll;}&.scroll-y{overflow-y:scroll;}`,
  "no-scrollbar": () => `&::-webkit-scrollbar{display:none;}`,
  "no-scrollbar-x": () => `&::-webkit-scrollbar:horizontal{display:none;}`,
  // Scroll Snap
  "scroll-m": (value) => ({"scroll-margin": makeSide(value)}),
  "scroll-mt": (value) => ({"scroll-margin-top": px(value)}),
  "scroll-mr": (value) => ({"scroll-margin-right": px(value)}),
  "scroll-mb": (value) => ({"scroll-margin-bottom": px(value)}),
  "scroll-ml": (value) => ({"scroll-margin-left": px(value)}),
  "scroll-p": (value) => ({"scroll-padding": makeSide(value)}),
  "scroll-pt": (value) => ({"scroll-padding-top": px(value)}),
  "scroll-pr": (value) => ({"scroll-padding-right": px(value)}),
  "scroll-pb": (value) => ({"scroll-padding-bottom": px(value)}),
  "scroll-pl": (value) => ({"scroll-padding-left": px(value)}),
  "snap": (value) => ({"scroll-snap-align": cssvar(value)}),
  "snap-start": () => ({"scroll-snap-align": "start"}),
  "snap-end": () => ({"scroll-snap-align": "end"}),
  "snap-center": () => ({"scroll-snap-align": "center"}),
  "snap-align-none": () => ({"scroll-snap-align": "none"}),
  "snap-none": () => ({"scroll-snap-type": "none"}),
  "snap-x": () => ({"scroll-snap-type": "x var(--a-scroll-snap-strictness, mandatory)"}),
  "snap-x-proximity": () => ({"scroll-snap-type": "x proximity"}),
  "snap-y": () => ({"scroll-snap-type": "y var(--a-scroll-snap-strictness, mandatory)"}),
  "snap-y-proximity": () => ({"scroll-snap-type": "y proximity"}),
  "snap-both": () => ({"scroll-snap-type": "both var(--a-scroll-snap-strictness, mandatory)"}),
  "snap-both-proximity": () => ({"scroll-snap-type": "both proximity"}),
  "snap-mandatory": () => ({"--a-scroll-snap-strictness": "mandatory"}),
  "snap-proximity": () => ({"--a-scroll-snap-strictness": "proximity"}),
  "snap-normal": () => ({"scroll-snap-stop": "normal"}),
  "snap-always": () => ({"scroll-snap-stop": "always"}),
  // @TODO:- TBD
  "overscroll": (value) => ({"overscroll-behavior": value}),
  "overscroll-x": (value) => ({"overscroll-behavior-x": value}),
  "overscroll-y": (value) => ({"overscroll-behavior-y": value}),
  // @TODO:- TBD
  "no-bouncing": () => "",
  "no-overscroll": () => "",
  // -- Grid
  // @TODO:-- GRID TBD
  "grid": (value) => {
    const css = ["display:grid;"]
    if (+value === +value) css.push(`grid-template-columns:repeat(${value},1fr);`)
    else if (value) css.push(`grid-template-columns:${value};`)
    return css.join("")
  },
  "grid-cols": (value) => {
    const css = ["display:grid;"]
    if (+value === +value) css.push(`grid-template-columns:repeat(${value},1fr);`)
    else if (value) css.push(`grid-template-columns:${value};`)
    return css.join("")
  },
  "inline-grid": () => "display:inline-grid;",
  "isolate": () => `isolation:isolate;`,
  // visible: () => `visibility:visible;`,
  // collapse: () => `visibility:collapse;`,
  "opacity": (value) => ({opacity: cssvar(value)}),
  // Interactions
  "col-resize": () => ({cursor: "col-resize"}),
  "crosshair": () => ({cursor: "crosshair"}),
  "e-resize": () => ({cursor: "e-resize"}),
  "ew-resize": () => ({cursor: "ew-resize"}),
  // @TODO
  "grab": () => `&{cursor:grab;}&:active{cursor:grabbing;}`,
  "grabbing": () => ({cursor: "grabbing"}),
  "n-resize": () => ({cursor: "n-resize"}),
  "ne-resize": () => ({cursor: "ne-resize"}),
  "nesw-resize": () => ({cursor: "nesw-resize"}),
  "ns-resize": () => ({cursor: "ns-resize"}),
  "nw-resize": () => ({cursor: "nw-resize"}),
  "nwse-resize": () => ({cursor: "nwse-resize"}),
  "not-allowed": () => ({cursor: "not-allowed"}),
  "pointer": () => ({cursor: "pointer"}),
  "progress": () => ({cursor: "progress"}),
  "row-resize": () => ({cursor: "row-resize"}),
  "s-resize": () => ({cursor: "s-resize"}),
  "se-resize": () => ({cursor: "se-resize"}),
  "sw-resize": () => ({cursor: "sw-resize"}),
  "w-resize": () => ({cursor: "w-resize"}),
  "zoom-in": () => ({cursor: "zoom-in"}),
  "zoom-out": () => ({cursor: "zoom-out"}),
  "cursor": (value) => ({cursor: value}),
  "user-select-none": () => ({"user-select": "none", "-webkit-user-select": "none"}),
  "user-select-all": () => ({"user-select": "all", "-webkit-user-select": "all"}),
  "user-select-auto": () => ({"user-select": "auto", "-webkit-user-select": "auto"}),
  "user-select-text": () => ({"user-select": "text", "-webkit-user-select": "text"}),
  "user-select": (value) => ({
    "user-select": cssvar(value),
    "-webkit-user-select": cssvar(value),
  }),
  "pointer-events-none": () => ({"pointer-events": "none"}),
  "pointer-events-auto": () => ({"pointer-events": "auto"}),
  // 에니메이션:transition(transform=100s/opacity=2s)
  "transition": (value) => ({transition: makeTransition(value)}),
  // transform
  "translate": (value) => {
    const [x, y] = makeCommaValues(value, px).split(",")
    return {
      "--a-transform-translate-x": x,
      "--a-transform-translate-y": y,
      "transform": "var(--a-transform)",
    }
  },
  "translateX": (value) => ({
    "--a-translate-x": px(value),
    "transform": "var(--a-transform)",
  }),
  "translateY": (value) => ({
    "--a-translate-y": px(value),
    "transform": "var(--a-transform)",
  }),
  "rotate": (value) => {
    let [x, y, z] = makeCommaValues(value, deg).split(",")
    x = x || x
    y = y || x
    z = z || x
    return {
      "--a-rotate": x,
      "--a-rotate-x": x,
      "--a-rotate-y": y,
      "--a-rotate-z": z,
      "transform": "var(--a-transform)",
    }
  },
  "rotateX": (value) => ({
    "--a-rotate-x": deg(value),
    "transform": "var(--a-transform)",
  }),
  "rotateY": (value) => ({
    "--a-rotate-y": deg(value),
    "transform": "var(--a-transform)",
  }),
  "scale": (value) => {
    let [x, y, z] = makeCommaValues(value).split(",")
    x = x || x
    y = y || x
    z = z || x
    return {
      "--a-scale-x": x,
      "--a-scale-y": y,
      "--a-scale-z": z,
      "transform": "var(--a-transform)",
    }
  },
  "scaleX": (value) => ({
    "--a-scale-x": makeNumber(+value),
    "transform": "var(--a-transform)",
  }),
  "scaleY": (value) => ({
    "--a-scale-y": makeNumber(+value),
    "transform": "var(--a-transform)",
  }),
  "skew": (value) => {
    const [x, y] = makeCommaValues(value, deg).split(",")
    return {
      "--a-skew-x": x,
      "--a-skew-y": y,
      "transform": "var(--a-transform)",
    }
  },
  "skewX": (value) => ({
    "--a-skew-x": deg(value),
    "transform": "var(--a-transform)",
  }),
  "skewY": (value) => ({
    "--a-skew-y": deg(value),
    "transform": "var(--a-transform)",
  }),
  "matrix": (value) => ({transform: `matrix(${value})`}),
  // @TODO: 3d transform
  // "translate3d": (value:string) => `--a-translate-x:${px(value)};--a-translate-y:${px(value)};--a-translate-z:${px(value)};transform:var(--a-transform);`,
  // "rotate3d": (value:string) => `--a-rotate-x:${deg(value)};--a-rotate-y:${deg(value)};--a-rotate-z:${deg(value)};transform:var(--a-transform);`,
  // "translateZ": (value:string) => `--a-translate-z:${px(value)};transform:var(--a-transform);`,
  // "rotateZ": (value:string) => `--a-rotate-z:${deg(value)};transform:var(--a-transform);`,
  // "skewZ": (value:string) => `--a-skew-z:${deg(value)};transform:var(--a-transform);`,
  // "scaleZ": (value:string) => `--a-scale-z:${makeCommaValues(value)};transform:var(--a-transform);`,
  // "matrix3d": (value:string) => `transform:matrix(${value});`,
  // Util
  "ratio": (value) =>
    `&{position:relative;}&:before{content:"";display:block;width:100%;padding-top:${makeRatio(value)};}&>*{position:absolute;top:0;left:0;width:100%;height:100%;}`,
  "aspect": (value) => `aspect-ratio:${cssvar(value.replace(/:/g, "/"))};`,
  "aspect-ratio": (value) => `aspect-ratio:${cssvar(value.replace(/:/g, "/"))};`,
  "gpu": () => `transform:translateZ(0.1px);`,
  // etc
  "content": (value = "''") => `content:${cssvar(value)};`,
  "app-region": (value) => `app-region:${value};-webkit-app-region:${value};`,
  "clip-path": (value) => `clip-path:${makeValues(value)};-webkit-clip-path:${makeValues(value)};`,
  // table
  "table-fixed": () => ({tableLayout: "fixed"}),
  "table-auto": () => ({tableLayout: "auto"}),
  "table-layout-fixed": () => ({tableLayout: "fixed"}),
  "table-layout-auto": () => ({tableLayout: "auto"}),
  // Float & Clear
  "float": (value) => `float:${cssvar(value)};`,
  "clear": (value) => `clear:${cssvar(value)};`,
  // Filter
  "blur": (value) => `filter:blur(${px(value)});-webkit-filter:blur(${px(value)});`,
  "brightness": (value) => `filter:brightness(${cssvar(value)});-webkit-filter:brightness(${cssvar(value)});`,
  "contrast": (value) => `filter:contrast(${cssvar(value)});-webkit-filter:contrast(${cssvar(value)});`,
  "drop-shadow": (value) => `filter:drop-shadow(${makeValues(value, px)});-webkit-filter:drop-shadow(${makeValues(value, px)});`,
  "grayscale": (value) => `filter:grayscale(${cssvar(value)});-webkit-filter:grayscale(${cssvar(value)});`,
  "hue-rotate": (value) => `filter:hue-rotate(${cssvar(value)});-webkit-filter:hue-rotate(${cssvar(value)});`,
  "invert": (value) => `filter:invert(${cssvar(value)});-webkit-filter:invert(${cssvar(value)});`,
  "sepia": (value) => `filter:sepia(${cssvar(value)});-webkit-filter:sepia(${cssvar(value)});`,
  "saturate": (value) => `filter:saturate(${cssvar(value)});-webkit-filter:saturate(${cssvar(value)});`,
  "backdrop-blur": (value) => `backdrop-filter:blur(${px(value)});-webkit-backdrop-filter:blur(${px(value)});`,
  "backdrop-brightness": (value) => `backdrop-filter:brightness(${cssvar(value)});-webkit-backdrop-filter:brightness(${cssvar(value)});`,
  "backdrop-contrast": (value) => `backdrop-filter:contrast(${cssvar(value)});-webkit-backdrop-filter:contrast(${cssvar(value)});`,
  "backdrop-drop-shadow": (value) =>
    `backdrop-filter:drop-shadow(${makeValues(value, px)});-webkit-backdrop-filter:drop-shadow(${makeValues(value, px)});`,
  "backdrop-grayscale": (value) => `backdrop-filter:grayscale(${cssvar(value)});-webkit-backdrop-filter:grayscale(${cssvar(value)});`,
  "backdrop-hue-rotate": (value) => `backdrop-filter:hue-rotate(${cssvar(value)});-webkit-backdrop-filter:hue-rotate(${cssvar(value)});`,
  "backdrop-invert": (value) => `backdrop-filter:invert(${cssvar(value)});-webkit-backdrop-filter:invert(${cssvar(value)});`,
  "backdrop-sepia": (value) => `backdrop-filter:sepia(${cssvar(value)});-webkit-backdrop-filter:sepia(${cssvar(value)});`,
  "backdrop-saturate": (value) => `backdrop-filter:saturate(${cssvar(value)});-webkit-backdrop-filter:saturate(${cssvar(value)});`,
  // @TODO:triangle
  "triangle": (value) => {
    const [direction, size, angle = 0] = value.split("/")
    const bd = ["top", "right", "bottom", "left", "top", "right", "bottom", "left"]
    const bdr = bd.slice(bd.indexOf(direction))
    const height = 0.5
    let css = `width:0;height:0;border:0 solid transparent;`
    css += "border-" + bdr[1] + "-width:" + Math.round((+size * (-angle + 1)) / 2) + "px;"
    css += "border-" + bdr[3] + "-width:" + Math.round((+size * (+angle + 1)) / 2) + "px;"
    css += "border-" + bdr[2] + ":" + Math.round(+size * height) + "px solid black;"
    return css
  },
  // elevation
  "elevation": (value) => {
    const dp = +value
    if (!dp) {
      return `box-shadow:none;`
    }
    const blur = dp == 1 ? 3 : dp * 2
    const amba = (dp + 10 + dp / 9.38) / 100
    const diry = dp < 10 ? (dp % 2 == 0 ? dp - (dp / 2 - 1) : dp - (dp - 1) / 2) : dp - 4
    const dira = (24 - Math.round(dp / 10)) / 100
    return `box-shadow:0px ${px(dp)} ${px(blur)} rgba(0,0,0,${amba}),0px ${px(diry)} ${px(blur)} rgba(0,0,0,${dira});`
  },
}
var PREFIX_SELECTOR = {
  ">>": (selector) => `& ${selector.slice(2)}`,
  "&:": (selector) => `${selector}`,
  "&.": (selector) => `${selector}`,
  "&[": (selector) => `${selector}`,
  ".": (selector) => `&${selector},${selector} &`,
  "[": (selector) => `&${selector},${selector} &`,
  ">": (selector) => `&${selector}`,
  "+": (selector) => `&${selector}`,
  "#": (selector) => `&${selector}`,
}

// ../unocss/adorable-css-uno.ts
function splitByTopLevelPlus(input) {
  const brackets = {"(": ")", "{": "}", "[": "]"}
  const stack = []
  const parts = []
  let start = 0
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (brackets[char]) {
      stack.push(brackets[char])
    } else if (Object.values(brackets).includes(char)) {
      if (stack.pop() !== char) {
        return [input]
      }
    } else if (char === "+" && stack.length === 0) {
      parts.push(input.slice(start, i).trim())
      start = i + 1
    }
  }
  if (stack.length > 0) {
    return [input]
  }
  parts.push(input.slice(start).trim())
  return parts
}
var VALID_PSEUDO_CLASSES = [
  "active",
  "checked",
  "disabled",
  "empty",
  "enabled",
  "first-child",
  "first-of-type",
  "focus",
  "hover",
  "in-range",
  "invalid",
  "last-child",
  "last-of-type",
  "link",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-of-type",
  "only-child",
  "optional",
  "out-of-range",
  "read-only",
  "read-write",
  "required",
  "root",
  "target",
  "valid",
  "visited",
]
var VALID_PSEUDO_ELEMENTS = [
  "after",
  "before",
  "first-letter",
  "first-line",
  "selection",
  "backdrop",
  "placeholder",
  "marker",
  "spelling-error",
  "grammar-error",
]
function generateDimensions([, w, h]) {
  return {width: `${w}px`, height: `${h}px`}
}
function generateAspectRatio([, w, h]) {
  return {"aspect-ratio": `${w}/${h}`, "height": "auto"}
}
function generatePosition([, x, y]) {
  return {
    position: "absolute",
    ...makePosition2X(x),
    ...makePosition2Y(y),
  }
}
var adorableCSS = () =>
  defineConfig({
    // ...UnoCSS options
    rules: [
      // 사이즈 매칭 (예: "32x32", "128x128")
      [/^(\d+)x(\d+)$/, generateDimensions],
      // aspect-ratio: 16:9
      [/^(\d+):(\d+)$/, generateAspectRatio],
      // poosition: (10, 20)
      [/^\(([^,)\s]+),([^,)\s]+)\)$/, generatePosition],
      [
        /^([-a-zA-Z0-9_.]+)(?:\((.*?)\))?$/,
        ([_, prop, value], unocss) => {
          try {
            const fn = RULES_FOR_UNOCSS[prop]
            if (typeof fn !== "function") return
            if (fn.length >= 1 && !value) return
            const def = fn(value, unocss)
            if (typeof def === "string") return {[prop]: "var(--not-implemented)"}
            return def
          } catch (e2) {}
        },
      ],
    ],
    // AdorableCSS Syntax!
    variants: [
      // #hexa : #fff.02
      (matcher) => {
        const regexHexa = /(#(?:[0-9a-fA-F]{3}){1,2}(?:\.\d+)?)/g
        const hexaColorMatch = matcher.match(regexHexa)
        if (hexaColorMatch) {
          return {
            matcher,
            body: (body) => {
              return body.map(([selector, value]) => [selector, String(value || "").replace(regexHexa, (a) => makeHEX(a))])
            },
          }
        }
      },
      // prefixPeusdo
      (matcher) => {
        const rangeMatch = matcher.match(/^(\d+)\.{2,3}(\d+):(.+)$/)
        if (rangeMatch) {
          const [full, min, max, rest] = rangeMatch
          const isInclusive = full.includes("...")
          return {
            matcher: rest,
            parent: `@media (min-width: ${min}px) and (max-width: ${isInclusive ? max : parseInt(max) - 1}px)`,
            order: parseInt(min),
          }
        }
      },
      // prefixSelector >, >>
      // pseudo classes / elements ex) :hover, ::before
      (matcher) => {
        const selectors = []
        let currentMatcher = matcher
        while (true) {
          const match = currentMatcher.match(/^([^:]+):(.+)$/)
          if (!match) break
          const [, pseudo, rest] = match
          currentMatcher = rest
          const prefix = PREFIX_SELECTOR[pseudo.slice(0, 2)] || PREFIX_SELECTOR[pseudo.slice(0, 1)]
          if (prefix) {
            selectors.push((s) => prefix(pseudo).replace(/&/g, s))
          } else if (VALID_PSEUDO_CLASSES.includes(pseudo)) {
            selectors.push((s) => `${s}:${pseudo}`)
          } else if (VALID_PSEUDO_ELEMENTS.includes(pseudo)) {
            selectors.push((s) => `${s}::${pseudo}`)
          }
        }
        if (selectors.length > 0) {
          return {
            matcher: currentMatcher,
            selector: (s) => selectors.reduce((acc, fn) => fn(acc), s),
            order: selectors.length,
            // variants가 많을수록 높은 order
          }
        }
      },
      // >, >>
      (matcher) => {
        const match = matcher.match(/^(>>|>)(.+)$/)
        if (match) {
          const [, pseudo, rest] = match
          const pseudoSelector = {
            ">": (s) => `${s}>*`,
            ">>": (s) => `${s} *`,
          }
          return {
            matcher: rest,
            selector: pseudoSelector[pseudo],
            order: 1,
          }
        }
      },
      // important!
      (matcher) => {
        const match = matcher.match(/(.*?)(!+)$/)
        if (match) {
          const [, rest, important] = match
          return {
            matcher: rest,
            selector: (s) => s + "[class]".repeat(important.length),
            body: (body) => {
              return body.map(([selector, value]) => [selector, value + "!important"])
            },
          }
        }
      },
    ],
    // +
    shortcuts: [
      [
        /(\+)/,
        (match) => {
          if (!match.input) return void 0
          const segments = splitByTopLevelPlus(match.input)
          return segments.length >= 2 ? segments : void 0
        },
      ],
    ],
  })

// adorable-css@2.js
var import_meta = {}
var uno = createGenerator({
  ...adorableCSS(),
})
var generateCss = (classList) => {
  return uno.then((uno2) => uno2.generate([...classList].join(" ")))
}
if (typeof window !== "undefined") {
  const styleSheet = document.createElement("style")
  document.head.appendChild(styleSheet)
  const classList = /* @__PURE__ */ new Set()
  const updateStyles = () => {
    generateCss(classList).then((res) => {
      styleSheet.innerHTML = res.css
    })
  }
  const handleMutationsClass = (mutations) => {
    let hasNewClasses = false
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        mutation.target.classList.forEach((className) => {
          if (!classList.has(className)) {
            classList.add(className)
            hasNewClasses = true
          }
        })
      }
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.querySelectorAll) {
            node.querySelectorAll("*[class]").forEach((el) => {
              el.classList.forEach((className) => classList.add(className))
              hasNewClasses = true
            })
          }
          if (node.classList) {
            node.classList.forEach((className) => {
              if (!classList.has(className)) {
                classList.add(className)
                hasNewClasses = true
              }
            })
          }
        })
      }
    })
    if (hasNewClasses) {
      updateStyles()
    }
  }
  const initClassStyle = () => {
    document.querySelectorAll("*[class]").forEach((el) => {
      el.classList.forEach((className) => classList.add(className))
    })
    updateStyles()
  }
  const observer = new MutationObserver(handleMutationsClass)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
  })
  initClassStyle()
  document.addEventListener("DOMContentLoaded", initClassStyle, {once: true})
  if (import_meta.hot) {
    import_meta.hot.accept(() => {
      initClassStyle()
    })
  }
}
