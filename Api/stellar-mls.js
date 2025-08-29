import { useState, useEffect } from 'react';

function MLSDataComponent() {
  const [mlsData, setMlsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMLSData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/stellar-mls');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMlsData(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch MLS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically fetch data when component mounts
    fetchMLSData();
  }, []);

  if (loading) return <div>Loading MLS data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mls-data-container">
      <h2>MLS Properties</h2>
      <button onClick={fetchMLSData} className="refresh-btn">
        Refresh Data
      </button>
      
      {mlsData && mlsData.data && (
        <div className="properties-grid">
          {mlsData.data.properties.map((property) => (
            <div key={property.id} className="property-card">
              <h3>{property.address}</h3>
              <p>Price: ${property.price.toLocaleString()}</p>
              <p>Beds: {property.bedrooms} | Baths: {property.bathrooms}</p>
              <p>Sq Ft: {property.squareFeet}</p>
              <p>Status: {property.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MLSDataComponent;