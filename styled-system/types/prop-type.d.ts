/* eslint-disable */
import type { ConditionalValue } from './conditions';
import type { CssProperties } from './system-types';
import type { Tokens } from '../tokens/index';

interface PropertyValueTypes {
	colorPalette: "current" | "black" | "white" | "transparent" | "rose" | "pink" | "fuchsia" | "purple" | "violet" | "indigo" | "blue" | "sky" | "cyan" | "teal" | "emerald" | "green" | "lime" | "yellow" | "amber" | "orange" | "red" | "neutral" | "stone" | "zinc" | "gray" | "slate";
	textStyle: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl";
}



  type CssValue<T> = T extends keyof CssProperties ? CssProperties[T] : never

  type Shorthand<T> = T extends keyof PropertyValueTypes ? PropertyValueTypes[T] | CssValue<T> : CssValue<T>

  export interface PropertyTypes extends PropertyValueTypes {
  
}

type StrictableProps =
  | 'alignContent'
  | 'alignItems'
  | 'alignSelf'
  | 'all'
  | 'animationComposition'
  | 'animationDirection'
  | 'animationFillMode'
  | 'appearance'
  | 'backfaceVisibility'
  | 'backgroundAttachment'
  | 'backgroundClip'
  | 'borderCollapse'
  | 'borderBlockEndStyle'
  | 'borderBlockStartStyle'
  | 'borderBlockStyle'
  | 'borderBottomStyle'
  | 'borderInlineEndStyle'
  | 'borderInlineStartStyle'
  | 'borderInlineStyle'
  | 'borderLeftStyle'
  | 'borderRightStyle'
  | 'borderTopStyle'
  | 'boxDecorationBreak'
  | 'boxSizing'
  | 'breakAfter'
  | 'breakBefore'
  | 'breakInside'
  | 'captionSide'
  | 'clear'
  | 'columnFill'
  | 'columnRuleStyle'
  | 'contentVisibility'
  | 'direction'
  | 'display'
  | 'emptyCells'
  | 'flexDirection'
  | 'flexWrap'
  | 'float'
  | 'fontKerning'
  | 'forcedColorAdjust'
  | 'isolation'
  | 'lineBreak'
  | 'mixBlendMode'
  | 'objectFit'
  | 'outlineStyle'
  | 'overflow'
  | 'overflowX'
  | 'overflowY'
  | 'overflowBlock'
  | 'overflowInline'
  | 'overflowWrap'
  | 'pointerEvents'
  | 'position'
  | 'resize'
  | 'scrollBehavior'
  | 'touchAction'
  | 'transformBox'
  | 'transformStyle'
  | 'userSelect'
  | 'visibility'
  | 'wordBreak'
  | 'writingMode'

type WithColorOpacityModifier<T> = T extends string ? `${T}/${string}` : T
type WithEscapeHatch<T> = T | `[${string}]` | `${T}/{string}` | WithColorOpacityModifier<T>

type FilterVagueString<Key, Value> = Value extends boolean
  ? Value
  : Key extends StrictableProps
    ? Value extends `${infer _}` ? Value : never
    : Value

type PropOrCondition<Key, Value> = ConditionalValue<Value | (string & {})>

type PropertyTypeValue<T extends string> = T extends keyof PropertyTypes
  ? PropOrCondition<T, PropertyTypes[T] | CssValue<T>>
  : never;

type CssPropertyValue<T extends string> = T extends keyof CssProperties
  ? PropOrCondition<T, CssProperties[T]>
  : never;

export type PropertyValue<T extends string> = T extends keyof PropertyTypes
  ? PropertyTypeValue<T>
  : T extends keyof CssProperties
    ? CssPropertyValue<T>
    : PropOrCondition<T, string | number>