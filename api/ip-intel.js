export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const clientIp = String(rawIp).split(',')[0].trim().replace(/^::ffff:/, '');
  const isLoopback = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');

  const intel = {
    ip: clientIp,
    isLoopback,
    connectionType: isLoopback ? 'Localhost / Intranet' : 'Public WAN',
    detectedProtocols: ['HTTP/' + (req.httpVersion || '1.1')],
    timestamp: new Date().toISOString()
  };

  res.status(200).json(intel);
}
