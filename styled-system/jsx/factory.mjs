import { createElement, forwardRef } from 'react'
import { getDisplayName } from './factory-helper.mjs';
import { css, cx } from '../css/index.mjs';

function createStyledFn(Dynamic) {
  const __base__ = Dynamic.__base__ || Dynamic
  return function styledFn(template) {
    const styles = css.raw(template)

    const StyledComponent = /* @__PURE__ */ forwardRef(function StyledComponent(props, ref) {
      const { as: Element = __base__, ...elementProps } = props

      function classes() {
        return cx(css(__base__.__styles__, styles), elementProps.className)
      }

      return createElement(Element, {
          ref,
          ...elementProps,
          className: classes(),
      })
    })

    const name = getDisplayName(__base__)

    StyledComponent.displayName = `styled.${name}`
    StyledComponent.__styles__ = styles
    StyledComponent.__base__ = __base__

    return StyledComponent
  }
}

function createJsxFactory() {
  const cache = new Map()

  return new Proxy(createStyledFn, {
    apply(_, __, args) {
      return createStyledFn(...args)
    },
    get(_, el) {
      if (!cache.has(el)) {
        cache.set(el, createStyledFn(el))
      }
      return cache.get(el)
    },
  })
}

export const styled = /* @__PURE__ */ createJsxFactory()
