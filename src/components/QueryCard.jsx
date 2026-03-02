import React, { useState } from 'react';
import { name_GRAPH_LDES, name_GRAPH_LDESTSS, name_GRAPH_TTL } from '../constants';

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
    borderBottom: '2px solid #ddd',
    textTransform: 'capitalize'
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

// Map of default queries for each DB type
const queryTemplates = {
  'LDES': `
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX ex: <http://example.com/ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?subject ?value ?time ?runoffvalue ?observedproperty
WHERE {
  GRAPH <http://example.com/graph/ldes> {
    ?subject sosa:observedProperty ?observedproperty ;
             sosa:hasSimpleResult ?value ;
             sosa:resultTime ?time .
    
    OPTIONAL { ?subject ex:hasRunoff ?runoffvalue . }
    
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
  }
}
ORDER BY DESC(?time)
    `,
  
  'LDESTSS': `
PREFIX tss: <https://w3id.org/tss#>
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?subject ?from ?pointType ?madeBySensor ?points ?observedproperty
WHERE {
  GRAPH <${name_GRAPH_LDESTSS}> {
    ?subject a tss:Snippet ;
             tss:from ?from ;
             tss:pointType ?pointType ;
             tss:points ?points ;
             tss:about ?template .
    
    ?template sosa:madeBySensor ?madeBySensor ;
              sosa:observedProperty ?observedproperty .
    
    FILTER (?from >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?from < "2026-01-01T00:00:00"^^xsd:dateTime)
  }
}
ORDER BY ASC(?from)
  `,
  
  'TTL': `PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX ex: <http://example.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?subject ?value ?time ?runoffvalue ?observedproperty
WHERE {
  GRAPH <http://example.com/graph/ttl> {
    ?subject sosa:hasSimpleResult ?value ;
             sosa:resultTime ?time ;
             sosa:observedProperty ?observedproperty .
             
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
  }
  OPTIONAL { ?subject ex:hasRunoff ?runoffvalue . }
}
ORDER BY DESC(?time)
`


};

export const QueryCard = () => {
  const [dbType, setDbType] = useState('LDES'); 
  // Initialize with the LDES template
  const [query, setQuery] = useState(queryTemplates['LDES']);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 100; 

  // Handle dropdown change: Update DB type AND the query text
  const handleDbTypeChange = (e) => {
    const selectedType = e.target.value;
    setDbType(selectedType);
    setQuery(queryTemplates[selectedType]);
  };

  const handleExecute = async (targetPage = 1) => {
    setLoading(true);
    setPage(targetPage);
    
    let baseUrl = '';
    switch (dbType) {
      case 'LDES': baseUrl = 'http://localhost:3000/virtuoso/ldes'; break;
      //case 'LDESTSS': baseUrl = 'http://localhost:3000/virtuoso/ldestss'; break;
      //case 'TTL': baseUrl = 'http://localhost:3000/virtuoso/ttl'; break;
      default: baseUrl = 'http://localhost:3000/virtuoso/ldes';
    }

    const encodedQuery = encodeURIComponent(query);
    const finalUrl = `${baseUrl}/query?query=${encodedQuery}&page=${targetPage}`;
    
    try {
      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Query failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div style={innerStyles.container}>
      <div style={innerStyles.controls}>
        <label><strong>Database: </strong></label>
        <select 
          style={innerStyles.select} 
          value={dbType} 
          onChange={handleDbTypeChange}
        >
          <option value="LDES">Linked Data</option>
         
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
        placeholder="Enter your SPARQL query here..."
      />

      <div style={innerStyles.tableWrapper}>
        <table style={innerStyles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={innerStyles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={`${index}-${col}`} style={innerStyles.td}>
                      {typeof row[col] === 'object' && row[col] !== null 
                        ? JSON.stringify(row[col]) 
                        : (row[col]?.toString() || '-')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '20px' }}>
                  {loading ? 'Loading...' : 'No results found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={innerStyles.pagination}>
        <button 
          disabled={page <= 1 || loading} 
          onClick={() => handleExecute(page - 1)}
          style={{...innerStyles.pageBtn, opacity: (page <= 1 || loading) ? 0.5 : 1}}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button 
          disabled={results.length < limit || loading} 
          onClick={() => handleExecute(page + 1)}
          style={{...innerStyles.pageBtn, opacity: (results.length < limit || loading) ? 0.5 : 1}}
        >
          Next
        </button>
      </div>
    </div>
  );
};