/* eslint-disable i18next/no-literal-string */
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

interface CountryExampleProps {
  country: string;
  region: string;
  city: string;
  timezone: string;
  initialServerData: boolean;
}

const CountryExample: NextPage<CountryExampleProps> = ({
  country,
  region,
  city,
  timezone,
  initialServerData,
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Country Example Page</title>
        <meta name="description" content="Example page showing geolocation data" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold mb-6">Location-Based Content</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Location Information</h2>

          {initialServerData ? (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Country:</span> {country || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Region:</span> {region || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">City:</span> {city || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Timezone:</span> {timezone || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                This data was detected server-side via our middleware.
              </p>
            </div>
          ) : (
            <p>Location data could not be determined.</p>
          )}
        </div>

        {country && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Customized Content for {country}</h2>

            {country === 'US' && (
              <div className="p-4 bg-blue-50 rounded">
                <p>
                  Welcome to our US visitors! Check out our special offers for the United States.
                </p>
              </div>
            )}

            {country === 'GB' && (
              <div className="p-4 bg-red-50 rounded">
                <p>Greetings from across the pond! Here's our UK-specific content.</p>
              </div>
            )}

            {country === 'CA' && (
              <div className="p-4 bg-red-50 rounded">
                <p>Hello to our Canadian friends! We have maple-flavored content just for you.</p>
              </div>
            )}

            {!['US', 'GB', 'CA'].includes(country) && (
              <div className="p-4 bg-green-50 rounded">
                <p>Welcome international visitor from {country}! We're glad you're here.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  // Extract geo information from request headers (set by middleware)
  const country = (req.headers['x-user-country'] as string) || '';
  const region = (req.headers['x-user-region'] as string) || '';
  const city = (req.headers['x-user-city'] as string) || '';
  const timezone = (req.headers['x-user-timezone'] as string) || '';

  const initialServerData = !!(country || region || city || timezone);

  return {
    props: {
      country,
      region,
      city,
      timezone,
      initialServerData,
    },
  };
};

export default CountryExample;
