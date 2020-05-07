import styled from 'styled-components';
import { space, MarginProps, PaddingProps } from 'styled-system';

const Spacing = styled.div<MarginProps & PaddingProps>`
  ${space}
`;

export default Spacing;
