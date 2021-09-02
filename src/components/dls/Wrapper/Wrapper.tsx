/**
 * Wrap a component `children` with a `wrapper` component if `condition` is `true`.
 * @param props
 * @param props.children - The children to wrap.
 * @param props.shouldWrap - The condition to wrap the children with the wrapper.
 * @param props.wrapper - The wrapper component.
 *
 * Reference:
 * - https://blog.hackages.io/conditionally-wrap-an-element-in-react-a8b9a47fab2ng.html
 * - https://arjayosma.com/how-to-conditionally-wrap-a-react-component/
 */
const Wrapper = ({ children, shouldWrap, wrapper }) => (shouldWrap ? wrapper(children) : children);

export default Wrapper;
