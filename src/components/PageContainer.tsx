import styled from 'styled-components';
import { up, down, between, only } from 'styled-breakpoints';

const PageContainer = styled.div`
  max-width: ${(props) => props.theme.breakpoints.xl};
  margin: 0 auto;

  ${down('lg')} {
    width: 100%;
  }
`;

export default PageContainer;
