/**
 * Simple health check endpoint to verify Vercel serverless routing.
 * GET /api/ping
 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).end(JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    path: req.url || '/api/ping'
  }));
};
