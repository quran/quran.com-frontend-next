export default function handler(req, res) {
  const { geo } = req;
  res.setHeader('Cache-Control', 's-maxage=1000');
  res.status(200).json({ name: 'John Doe', geo, req: JSON.stringify(req.headers) });
}
