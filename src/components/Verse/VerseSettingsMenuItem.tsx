import styled from 'styled-components';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';

interface Props {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const VerseSettingsMenuItem: React.FC<Props> = ({ title, icon, onClick }) => (
  <StyledContainer onClick={onClick}>
    <IconContainer icon={icon} size={IconSize.Xsmall} color={IconColor.primary} />
    <TitleContainer>{title}</TitleContainer>
  </StyledContainer>
);

const StyledContainer = styled.div`
  padding-left: ${(props) => props.theme.spacing.xxsmall};
  padding-right: ${(props) => props.theme.spacing.xxsmall};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  padding-top: ${(props) => props.theme.spacing.xsmall};
  padding-bottom: ${(props) => props.theme.spacing.xsmall};
  &:hover {
    background: ${({ theme }) => theme.colors.background.fadedGreyScale};
  }
`;

const TitleContainer = styled.span`
  margin-left: ${(props) => props.theme.spacing.medium};
  font-size: ${(props) => props.theme.fontSizes.xlarge};
  vertical-align: text-top;
`;

export default VerseSettingsMenuItem;
