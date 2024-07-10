const fs = require('fs');
const { createServer } = require('https');
const { parse } = require('url');

const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(
    {
      key: fs.readFileSync('./keys/server.key'),
      cert: fs.readFileSync('./keys/server.crt'),
    },
    (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    },
  ).listen(3000, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log('> Server started on https://localhost:3000');
  });
});
