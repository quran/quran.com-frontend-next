interface Props {
  shouldWrap: boolean;
  children: JSX.Element;
  wrapper: (children: JSX.Element) => JSX.Element;
}

/**
 * Wrap a component `children` with a `wrapper` component if `condition` is `true`.
 *
 * Reference:
 * - https://blog.hackages.io/conditionally-wrap-an-element-in-react-a8b9a47fab2ng.html
 * - https://arjayosma.com/how-to-conditionally-wrap-a-react-component/
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const Wrapper = ({ children, shouldWrap, wrapper }: Props): JSX.Element =>
  shouldWrap ? wrapper(children) : children;

export default Wrapper;
