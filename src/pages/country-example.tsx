/* eslint-disable i18next/no-literal-string */
export default function Home({
  country,
  region,
  city,
  ip,
}: {
  country: string;
  region: string;
  city: string;
  ip: string;
}) {
  return (
    <div>
      <h1>Geolocation Data</h1>
      <p>Country: {country}</p>
      <p>Region: {region}</p>
      <p>City: {city}</p>
      <p>IP: {ip}</p>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  return {
    props: {
      country: req.headers['x-custom-country'] || 'Unknown',
      region: req.headers['x-custom-region'] || 'Unknown',
      city: req.headers['x-custom-city'] || 'Unknown',
      ip: req.headers['x-custom-ip'] || 'Unknown',
    },
  };
}
