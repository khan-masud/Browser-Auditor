export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const clientIp = String(rawIp).split(',')[0].trim();

  const headerData = {
    clientIp,
    httpVersion: req.httpVersion || '1.1',
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString()
  };

  res.status(200).json(headerData);
}
