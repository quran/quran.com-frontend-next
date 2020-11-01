/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Col } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import Link from 'next/link';

const StyledCopyright = styled.div`
  color: ${({ theme }) => theme.colors.text};

  p {
    line-height: 21px;
  }
  .ml-auto {
    margin-left: auto;
  }

  .mb-4 {
    margin-bottom: 24px;
  }
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const Copyright = () => (
  <Col col sm={12} md={6} lg={4} className="ml-auto">
    <StyledCopyright className="copyright">
      <p className="mb-4">
        <span className="en">
          Quran.com is a Sadaqah Jariyah. We hope to make it easy for everyone to read, study, and
          learn The Noble Quran. The Noble Quran has many names including Al-Quran Al-Kareem,
          Al-Ketab, Al-Furqan, Al-Maw'itha, Al-Thikr, and Al-Noor.
        </span>
      </p>
      <p className="mb-0">
        © 2020{' '}
        <Link href="https://quran.com" passHref>
          <StyledLink>Quran.com</StyledLink>
        </Link>
        .<span className="en">All Rights Reserved</span>
      </p>
    </StyledCopyright>
  </Col>
);

export default Copyright;
