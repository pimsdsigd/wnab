declare module "*.css" {
  const content: {[className: string]: string}
  export default content
}

declare module "*.scss" {
  const content: {[className: string]: string}
  export default content
}

declare module "*.jpg"
declare module "*.png"
declare module "*.gif"
declare module "*.ico"

// eslint-disable-next-line
interface SvgrComponent extends React.FC<React.SVGAttributes<SVGElement>> {}

declare module "*.svg" {
  const svgUrl: string
  const svgComponent: SvgrComponent
  export default svgUrl
  export {svgComponent as ReactComponent}
}
