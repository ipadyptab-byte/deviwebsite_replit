module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).end(JSON.stringify({ ok: true, now: new Date().toISOString() }));
};