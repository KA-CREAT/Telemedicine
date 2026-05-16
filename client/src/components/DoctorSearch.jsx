import React, { useState } from "react";
import axios from "axios";
import "../styles/DoctorSearch.css"; // Make sure this path is correct

const DoctorSearch = ({ setDoctors, setLoading, setError }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // setError("Please enter a search term.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("http://localhost:5015/api/doctors/search", {
        params: { query: searchTerm },
      });

      if (res.data.success && res.data.data.length > 0) {
        setDoctors(res.data.data);
      } else {
        setError("No doctors found.");
        setDoctors([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Server error or route not found.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-search-wrapper">
      <div className="google-search-box">
        <input
          type="text"
          placeholder="Search doctors by name or specialization"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="google-search-input"
        />
        <button onClick={handleSearch} className="google-search-button">
          🔍
        </button>
      </div>
    </div>
  );
};

export default DoctorSearch;
