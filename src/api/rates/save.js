// This file is used by the server for API rate saving
// For server-side usage, use server/sync-devi-to-gold-rates.js instead
module.exports = (req, res) => {
  res.status(200).json({ message: "Rate saving is handled by server routes" });
};
