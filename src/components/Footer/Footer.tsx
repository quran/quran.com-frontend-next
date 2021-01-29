import { Col, Container, Row } from 'styled-bootstrap-grid';
import styled from 'styled-components';

const cols = [
  {
    name: 'Navigate',
    links: [
      {
        href: '/',
        name: 'Download',
      },
      {
        href: '/',
        name: 'About us',
      },

      {
        href: '/',
        name: 'Contribute',
      },
      {
        href: '/',
        name: 'Help & feedback',
      },
      {
        href: '/',
        name: 'Developers',
      },
    ],
  },
  {
    name: 'Useful Sites',
    links: [
      {
        href: '/',
        name: 'Quraninaudio.com',
      },
      {
        href: '/',
        name: 'Salah.com',
      },
      {
        href: '/',
        name: 'Legacy Quran.com',
      },
      {
        href: '/',
        name: 'Corpus.Quran.com',
      },
    ],
  },
  {
    name: 'Other links',
    links: [
      {
        href: '/',
        name: 'Sitemap',
      },
      {
        href: '/',
        name: 'Surah ',
      },
      {
        href: '/',
        name: 'Ayat',
      },
    ],
  },
];

const Footer: React.FC = () => {
  return (
    <StyledFooter>
      <Container>
        <Row smJustifyContent="center">
          {cols.map((col) => (
            <Col key={col.name} col={2} sm={4} md={2}>
              <h4>{col.name}</h4>
              {col.links.map(({ href, name }) => (
                <List key={name}>
                  <li>
                    <Link href={href}>{name}</Link>
                  </li>
                </List>
              ))}
            </Col>
          ))}
          <Col col={6} sm={12} md={6}>
            <Copyright>
              {`Quran.com is a Sadaqah Jariyah. We hope to make it easy for everyone to read, study,
              and learn The Noble Quran. The Noble Quran has many names including Al-Quran
              Al-Kareem, Al-Ketab, Al-Furqan, Al-Maw'itha, Al-Thikr, and Al-Noor.`}
            </Copyright>
            <p>
              © {new Date().getFullYear()} <Link href="/">Quran.com. </Link>
              <span>All Rights Reserved</span>
            </p>
          </Col>
        </Row>
      </Container>
    </StyledFooter>
  );
};

const Link = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.gray};
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const List = styled.ul`
  padding: 0;
  li {
    list-style: none;
    margin: 10px 0;
  }
`;

const Copyright = styled.p`
  margin-bottom: 20px;
  line-height: 1.5;
`;

const StyledFooter = styled.footer`
  position: static;
  min-height: 240px;
  width: 100%;
  padding: 30px 0 3rem;
  background-color: #32312c;
  color: ${({ theme }) => theme.colors.gray};

  h4 {
    font-size: 20px;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1rem;
  }
`;

export default Footer;
