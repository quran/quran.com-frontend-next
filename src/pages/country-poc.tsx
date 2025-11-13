/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

import { COUNTRY_COOKIE_NAME, COUNTRY_RESPONSE_HEADER } from '@/constants/country';

type CountryPageProps = {
  country: string;
};

const CountryPOC: NextPage<CountryPageProps> = ({ country }) => (
  <>
    <Head>
      <title>Country POC</title>
    </Head>
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1>Country Detection POC</h1>
      <p>
        Value forwarded from middleware:
        <br />
        <strong>{country}</strong>
      </p>
      <p style={{ maxWidth: 480 }}>
        This page demonstrates how the <code>cf-ipcountry</code> header (set by Cloudflare) is read
        in <code>middleware.ts</code>, stored in a cookie, and then rendered on the client.
      </p>
    </main>
  </>
);

export const getServerSideProps: GetServerSideProps<CountryPageProps> = async ({ req }) => {
  const cookieCountry = req.cookies?.[COUNTRY_COOKIE_NAME];
  const headerValue = req.headers?.[COUNTRY_RESPONSE_HEADER];
  const headerCountry = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  return {
    props: {
      country: cookieCountry || headerCountry || 'unknown',
    },
  };
};

export default CountryPOC;
