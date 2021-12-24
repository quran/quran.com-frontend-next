/* eslint-disable react/no-multi-comp */
import ScrollArea, { Orientation } from './ScrollArea';

export default {
  title: 'dls/ScrollArea',
};

const TAGS = Array.from({ length: 50 }).map((index, i, a) => `v1.2.0-beta.${a.length - i}`);
const Tag = ({ children }) => {
  return (
    <div
      style={{
        color: 'blue',
        fontSize: 13,
        lineHeight: '18px',
        marginTop: 10,
        borderTop: `1px solid black`,
        paddingTop: 10,
      }}
    >
      {children}
    </div>
  );
};

export const Horizontal = () => {
  return (
    <ScrollArea orientation={Orientation.HORIZONTAL}>
      <div style={{ display: 'flex', marginBottom: 'var(--spacing-medium)' }}>
        {TAGS.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </ScrollArea>
  );
};

// export const Vertical = () => {
//   return (
//     <ScrollArea orientation={Orientation.VERTICAL}>
//       <div>
//         {TAGS.map((tag) => (
//           <Tag key={tag}>{tag}</Tag>
//         ))}
//       </div>
//     </ScrollArea>
//   );
// };
