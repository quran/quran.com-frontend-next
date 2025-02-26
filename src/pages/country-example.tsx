/* eslint-disable no-param-reassign */
/* eslint-disable i18next/no-literal-string */
export const getServerSideProps = ({ query }) => ({
  props: query,
});

export default function Index({
  name,
  languages,
  city,
  region,
  country,
  currencyCode,
  currencySymbol,
}) {
  name = name ? decodeURIComponent(name) : 'Not available';
  city = city ? decodeURIComponent(city) : 'Not available';
  return (
    <div>
      <h1>Country Example</h1>
      <p>Country: {country}</p>
      <p>Country: {languages}</p>
      <p>City: {city}</p>
      <p>Region: {region}</p>
      <p>Currency Code: {currencyCode}</p>
      <p>Currency Symbol: {currencySymbol}</p>
      <p>Name: {name}</p>
    </div>
  );
}
