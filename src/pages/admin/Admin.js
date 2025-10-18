import React, { useState } from "react";
import { ratesAPI } from "../../api/client";
import './Admin.css';

const Admin = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRates((prevRates) => ({
      ...prevRates,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await ratesAPI.updateRates(rates);
      alert("Rates updated successfully!");
      setRates({
        vedhani: "",
        ornaments22K: "",
        ornaments18K: "",
        silver: "",
      });
    } catch (error) {
      console.error("Error updating rates: ", error);
      alert("Failed to update rates.");
    }
  };

  const handleSyncFromLive = async () => {
    try {
      setLoading(true);
      const saved = await ratesAPI.syncFromLive();
      alert("Live rates fetched and saved to database.");
      setRates({
        vedhani: saved.vedhani ?? "",
        ornaments22K: saved.ornaments22k ?? "",
        ornaments18K: saved.ornaments18k ?? "",
        silver: saved.silver ?? "",
      });
    } catch (error) {
      console.error("Error syncing rates from live:", error);
      alert("Failed to sync rates from live.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Upload Current Rates</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={handleSyncFromLive} disabled={loading}>
          {loading ? 'Syncing…' : 'Fetch Live and Save'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vedhani (10 grams):</label>
          <input
            type="number"
            name="vedhani"
            value={rates.vedhani}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ornaments 22K (10 grams):</label>
          <input
            type="number"
            name="ornaments22K"
            value={rates.ornaments22K}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ornaments 18K (10 grams):</label>
          <input
            type="number"
            name="ornaments18K"
            value={rates.ornaments18K}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Silver (per KG):</label>
          <input
            type="number"
            name="silver"
            value={rates.silver}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Rates</button>
      </form>
    </div>
  );
};

export default Admin;
