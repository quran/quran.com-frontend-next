import { InputRule } from '@milkdown/kit/prose/inputrules';
import { Node } from '@milkdown/kit/prose/model';
import { $remark, $inputRule, $node } from '@milkdown/kit/utils';
import directive from 'remark-directive';

const parseMarkdownRunner = (state, node, type) => {
  state.addNode(type, {
    src: (node.attributes as { src: string }).src,
    width: (node.attributes as { width?: string }).width,
    height: (node.attributes as { height?: string }).height,
  });
};

const toMarkdownRunner = (state, node) => {
  state.addNode('leafDirective', undefined, undefined, {
    name: 'iframe',
    attributes: {
      src: node.attrs.src,
      // Only include width and height if they are present
      ...(node.attrs.width && { width: node.attrs.width }),
      ...(node.attrs.height && { height: node.attrs.height }),
    },
  });
};

/**
 * Define the iframe node for the Milkdown editor. Inspired by {@see https://milkdown.dev/docs/plugin/example-iframe-plugin}
 *
 * An example syntax that would be parsed correctly:
 *
 * 1. Without width and height:
 * `::iframe{src="https://www.youtube.com/embed/M7lc1UVf-VE?si=NX2HDifRlSCNy3cC"}`
 *
 * 2. With width and height:
 * `::iframe{src="https://www.youtube.com/embed/M7lc1UVf-VE?si=NX2HDifRlSCNy3cC" width="560" height="315"}`
 */
const iframeNode = $node('iframe', () => ({
  // Specify that this node belongs to the 'block' group
  group: 'block',
  // Mark the node as atomic (cannot be split)
  atom: true,
  // Prevent the node from being edited directly
  isolating: true,
  // Disallow any marks on this node
  marks: '',
  // Define the attributes for the iframe node
  attrs: {
    src: { default: null },
    width: { default: null },
    height: { default: null },
  },
  // Define how to parse the iframe from DOM
  parseDOM: [
    {
      tag: 'iframe',
      getAttrs: (dom) => ({
        // Extract src, width, and height attributes from the DOM element
        src: (dom as HTMLElement).getAttribute('src'),
        width: (dom as HTMLElement).getAttribute('width'),
        height: (dom as HTMLElement).getAttribute('height'),
      }),
    },
  ],
  // Define how to render the iframe node to DOM
  toDOM: (node: Node) => ['iframe', { ...node.attrs, contenteditable: false }, 0],
  // Define how to parse the iframe from Markdown
  parseMarkdown: {
    // Match leafDirective nodes with the name 'iframe'
    match: (node) => node.type === 'leafDirective' && node.name === 'iframe',
    // Runner function to create the node from Markdown
    runner: parseMarkdownRunner,
  },
  // Define how to serialize the iframe node to Markdown
  toMarkdown: {
    // Match nodes of type 'iframe'
    match: (node) => node.type.name === 'iframe',
    // Runner function to convert the node to Markdown
    runner: toMarkdownRunner,
  },
}));

/**
 * Define an input rule for creating iframe nodes from Markdown syntax
 */
const iframeInputRule = $inputRule(
  (ctx) =>
    new InputRule(
      // Regex to match the iframe syntax
      // @ts-ignore
      /::iframe\{src="(?<src>[^"]+)"(?:\s+width="(?<width>[^"]+)")?\s*(?:height="(?<height>[^"]+)")?\}/,
      (state, match, start, end) => {
        // Extract src, width, and height from the match
        const [okay, src = '', width = null, height = null] = match;
        const { tr } = state;
        if (okay) {
          // Replace the matched text with an iframe node
          tr.replaceWith(start - 1, end, iframeNode.type(ctx).create({ src, width, height }));
        }

        return tr;
      },
    ),
);

/**
 * Create a remark plugin for handling directives
 */
const remarkDirective = $remark('remarkDirective', () => directive);

const plugins = [...remarkDirective, iframeNode, iframeInputRule];

// Export the plugins
export default plugins;
