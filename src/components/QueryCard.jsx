import React, { useState, useEffect } from 'react';

const innerStyles = {
  container: {
    height: '100%',
    borderRadius: '1em',
    display: 'flex',
    flexDirection: 'column',
    color: '#333',
    padding: '1.5rem',
    boxSizing: 'border-box',
    backgroundColor: '#fff'
  },
  controls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '1rem',
    alignItems: 'center'
  },
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  executeBtn: {
    padding: '8px 20px',
    backgroundColor: '#002353',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  textarea: {
    width: '100%',
    height: '150px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontFamily: 'monospace',
    marginBottom: '1rem',
    resize: 'vertical'
  },
  tableWrapper: {
    flexGrow: 1,
    overflowY: 'auto',
    border: '1px solid #eee',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem'
  },
  th: {
    backgroundColor: '#f4f4f4',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #eee',
    wordBreak: 'break-all'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '1rem'
  },
  pageBtn: {
    padding: '5px 15px',
    cursor: 'pointer'
  }
};

export const QueryCard = () => {
  const [dbType, setDbType] = useState('TTL');
  const [query, setQuery] = useState('SELECT * WHERE { ?s ?p ?o } LIMIT 100');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 100;

  const handleExecute = async (targetPage = 1) => {
    setLoading(true);
    setPage(targetPage);
    
    // Construct URL based on selection (example endpoint provided in prompt)
    // Note: In a real app, you'd likely POST the 'query' string to the backend
    const url = `http://localhost:3000/oxigraph/ttl/RiverStage1Year?page=${targetPage}&limit=${limit}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Query failed:", error);
      alert("Failed to fetch data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={innerStyles.container}>
      <div style={innerStyles.controls}>
        <select 
          style={innerStyles.select} 
          value={dbType} 
          onChange={(e) => setDbType(e.target.value)}
        >
          <option value="LDES">LDES</option>
          <option value="LDESTSS">LDESTSS</option>
          <option value="TTL">TTL</option>
        </select>
        
        <button 
          style={innerStyles.executeBtn} 
          onClick={() => handleExecute(1)}
          disabled={loading}
        >
          {loading ? 'Running...' : 'EXECUTE'}
        </button>
      </div>

      <textarea 
        style={innerStyles.textarea}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your SPARQL or SQL query here..."
      />

      <div style={innerStyles.tableWrapper}>
        <table style={innerStyles.table}>
          <thead>
            <tr>
              <th style={innerStyles.th}>Subject</th>
              <th style={innerStyles.th}>Predicate</th>
              <th style={innerStyles.th}>Object</th>
              <th style={innerStyles.th}>Runoff</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                <td style={innerStyles.td}>{row.subject}</td>
                <td style={innerStyles.td}>{row.value}</td>
                <td style={innerStyles.td}>{row.time}</td>
                <td style={innerStyles.td}>{row.runoffValue ?? 'N/A'}</td>
              </tr>
            ))}
            {results.length === 0 && !loading && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No results found. Execute a query to see data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={innerStyles.pagination}>
        <button 
          disabled={page <= 1 || loading} 
          onClick={() => handleExecute(page - 1)}
          style={innerStyles.pageBtn}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button 
          disabled={results.length < limit || loading} 
          onClick={() => handleExecute(page + 1)}
          style={innerStyles.pageBtn}
        >
          Next
        </button>
      </div>
    </div>
  );
};