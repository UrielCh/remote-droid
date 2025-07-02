import { createContext, type Context } from "preact";
import { createElement } from "preact";
import type { ComponentChildren, JSX, VNode } from "preact";
/**
 * attributes for all custom SVG
 */
export interface IconBaseProps extends JSX.SVGAttributes<SVGSVGElement> {
  children?: ComponentChildren; // was React.ReactNode
  size?: number; // was string | number;
  color?: string;
  title?: string;
  class?: string; // new
}

/**
 * tree level for SVG
 */
export interface IconTree {
  tag: string;
  attr: { [key: string]: string };
  child?: IconTree[];
}

/**
 * IconContext type
 */
export interface IconContext {
  color?: string;
  size?: string;
  class?: string;
  className?: string;
  stroke?: string | JSX.SignalLike<string | undefined>; // allow overide stroke color "currentColor"
  fill?: string | JSX.SignalLike<string | undefined>; // allow overide fill color "currentColor"
  strokeWidth?:  number | string | JSX.SignalLike<number | string | undefined>; // allow overide strokeWidth default 0

  style?: JSX.CSSProperties;
  attr?: JSX.SVGAttributes<SVGSVGElement>;
}

/**
 * default values for IconContext
 */
export const defaultContext: IconContext = {
  color: undefined,
  size: undefined,
  class: undefined,
  className: undefined,
  style: undefined,
  attr: undefined,
};

/**
 * default IconContext provider
 */
export const defaultIconContext: Context<IconContext> = createContext && createContext(defaultContext);


const CAMEL_PROPS =
  /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
const CAMEL_REPLACE = /[A-Z0-9]/g;

function filterKebabCase<T extends Record<string, unknown>>(attrs: T): T {
  const newAttrs: Record<string, unknown> = {};
  for (const key in attrs) {
    if (key.indexOf('-') === -1 && CAMEL_PROPS.test(key))
      newAttrs[key.replace(CAMEL_REPLACE, '-$&').toLowerCase()] = attrs[key];
    else
      newAttrs[key] = attrs[key];
  }
  return newAttrs as T;
}

/**
 * build outer SVG element
 */
export function IconBase(
  props: IconBaseProps & { attr?: Record<string, string> },
): VNode<JSX.SVGAttributes> {
  const elem = (conf: IconContext) => {
    const { attr, size, title, class: clazz, className, ...svgProps } = props;
    let computedClazz = clazz || className || '';
    const computedSize = size || conf.size || "1em";
    if (conf.class) {
      computedClazz = `${computedClazz} ${conf.class}`;
    }
    if (conf.className) {
      computedClazz = `${computedClazz} ${conf.className}`;
    }
    let attrs = {
      stroke: conf.stroke || "currentColor",
      fill: conf.fill || "currentColor",
      strokeWidth: conf.strokeWidth || 0,
      class: computedClazz,
      ...conf.attr,
      ...attr,
      ...svgProps,
      height: computedSize,
      width: computedSize,
    };
    attrs = filterKebabCase(attrs);
    return (
      <svg
        {...attrs}
        style={filterKebabCase({
          color: props.color || conf.color,
          ...conf.style,
          ...(props.style as JSX.CSSProperties),
        })}
        xmlns="http://www.w3.org/2000/svg"
      >
        {title && <title>{title}</title>}
        {props.children}
      </svg>
    );
  };

  return defaultIconContext !== undefined
    ? (
      <defaultIconContext.Consumer>
        {(conf: IconContext) => elem(conf)}
      </defaultIconContext.Consumer>
    )
    : (
      elem(defaultIconContext)
    );
}

/**
 * recursivly build internal SVG element
 * @param tree 
 * @returns 
 */
function Tree2Element(tree: IconTree[]): ComponentChildren[] { // React.ReactElement => ComponentChildren
  return (
    tree &&
    tree.map((node, i) =>
      createElement(
        node.tag,
        { key: i, ...filterKebabCase(node.attr) },
        Tree2Element(node.child || []),
      )
    )
  );
}

/**
 * build a SVG componant from an IconTree
 */
export function GenIcon(data: IconTree): (props: IconBaseProps) => VNode<JSX.SVGAttributes> {
  return (props: IconBaseProps) => (
    <IconBase attr={{ ...data.attr }} {...props}>
      {Tree2Element(data.child || [])}
    </IconBase>
  );
}

// import { IoMdHome } from "jsr:@preact-icons/io";
// import { MdOutlineKeyboardReturn } from "jsr:@preact-icons/md";
// import { FaPowerOff } from "jsr:@preact-icons/fa6";

export function IoMdHome(props: IconBaseProps): VNode<JSX.SVGAttributes> {
  return GenIcon({tag:"svg",attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M208 448V320h96v128h97.6V256H464L256 64 48 256h62.4v192z"}}]})(props);
}

export function MdOutlineKeyboardReturn(props: IconBaseProps): VNode<JSX.SVGAttributes> {
  return GenIcon({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z"},child:[]}]})(props);
}

export function FaPowerOff(props: IconBaseProps): VNode<JSX.SVGAttributes> {
  return GenIcon({tag:"svg",attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 224c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"}}]})(props);
}
