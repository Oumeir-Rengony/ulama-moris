/* eslint-disable */
import type { ComponentPropsWithoutRef, ElementType, ElementRef, Ref } from 'react'
import type { DistributiveOmit } from '../types/system-types';

interface Dict {
  [k: string]: unknown
}

export type ComponentProps<T extends ElementType> = DistributiveOmit<ComponentPropsWithoutRef<T>, 'ref'> & {
  ref?: Ref<ElementRef<T>>
}

export type StyledComponent<T extends ElementType> = {
  (args: { raw: readonly string[] | ArrayLike<string> }): (props: ComponentProps<T>) => JSX.Element
  displayName?: string
}

export interface JsxFactory {
  <T extends ElementType>(component: T): StyledComponent<T>
}

export type JsxElements = {
  [K in keyof JSX.IntrinsicElements]: StyledComponent<K>
}

export type Styled = JsxFactory & JsxElements

export type HTMLStyledProps<T extends ElementType> = ComponentProps<T>