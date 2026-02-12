import React, { useState,useEffect } from 'react';

 const innerStyles = {
    container: {
      height: '100%',
      //backgroundColor: '#1523e0',
      borderRadius: '1em',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      padding: '1rem',
      boxSizing: 'border-box'
    },
    subNavbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '1rem',
      fontSize: '0.9rem'
    },
    divider: {
      width: '1px',
      height: '15px',
     // backgroundColor: 'rgba(255, 255, 255, 0.4)'
    },
    navItem: (isActive) => ({
      cursor: 'pointer',
      fontWeight: isActive ? 'bold' : 'normal',
      opacity: isActive ? 1 : 0.7,
      transition: 'opacity 0.2s',
      color: isActive ? '#000000' : '#000000',
    }),
    contentArea: {
      flexGrow: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5em',
      padding: '1rem',
      color: 'black',
    }
  };
  const headStyles = {
    title: {
      textAlign: 'center',        // Centers the H2
      fontSize: '1.4rem',         // Slightly larger for the header
      fontWeight: '700',
      marginBottom: '0',
      marginTop: '0',
    },
    description: {
      textAlign: 'justify',       // Justifies the body text
      fontSize: '0.85rem',        // Smaller text size as requested
      lineHeight: '1.5',          // Increases readability
      margin: '0',
      opacity: '0.95',            // Softens the white text slightly
    }
  };
  const tableStyles = {
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  select: {
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    fontSize: '0.85rem',
    backgroundColor: 'white',
  },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
    color: 'black'
  },
  td: {
    borderBottom: '1px solid #ddd',
    padding: '8px',
    wordBreak: 'break-all',
    color: '#333'
  },
  button: {
    padding: '5px 15px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    opacity: (disabled) => disabled ? 0.5 : 1
  }
};

export const BrowseDataHead = () => {
return (
<div >
      <h2 style={headStyles.title}>
        Browse Data
      </h2>
    </div>
);}

export const BrowseDataBody = () => {
  const [activeSubTab, setActiveSubTab] = useState('LDES');
  const menuItems = ['LDES', 'LDES + TSS', 'TTL'];

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'LDES':
        return <BrowseLDESData />;
      case 'LDES + TSS':
        return <BrowseLDESTSSData />;
      case 'TTL':
        return <BrowseTTLData />;

      default:
        return <div><h3>Overview Content Placeholder</h3></div>;
    }
  };

    return (
      <div style={innerStyles.container}>
        {/* 3. Horizontal Sub-Navbar */}
        <div style={innerStyles.subNavbar}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item}>
              <span 
                style={innerStyles.navItem(activeSubTab === item)}
                onClick={() => setActiveSubTab(item)}
              >
                {item}
              </span>
              {/* 4. Add vertical line between items, but not after the last one */}
              {index < menuItems.length - 1 && <div style={innerStyles.divider} />}
            </React.Fragment>
          ))}
        </div>
  
  <div style={innerStyles.contentArea}>
          {renderSubContent()}
        </div>
      </div>
    );
}

const BrowseTTLData = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Hardcoded query
  const sparqlQuery = `PREFIX sosa: <http://www.w3.org/ns/sosa/>
SELECT ?subject ?value ?time ?runoffvalue ?observedproperty
WHERE {
  ?subject sosa:hasSimpleResult ?value ;
           sosa:resultTime ?time;
        sosa:observedProperty ?observedproperty .
}
ORDER BY DESC(?time)`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(sparqlQuery);
      const response = await fetch(`http://localhost:3000/virtuoso/ttl/query?page=${page}&query=${encodedQuery}`);
      const result = await response.json();
      
      if (Array.isArray(result)) {
          setData(result);
      } else {
          setData(result.results?.bindings || []);
      }

    } catch (error) {
      console.error("Error fetching TTL data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Removed 'endpoint' from dependencies
  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div>
      {/* Controls container: 
         Since we removed the select on the left, we use justifyContent: 'flex-end' 
         to keep the pagination buttons aligned to the right.
      */}
      <div style={{...tableStyles.controls, justifyContent: 'flex-end'}}>
        <div>
          <button 
            disabled={page === 1 || loading}
            style={{...tableStyles.button, marginRight: '10px'}}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          
          <span style={{color: 'black', fontWeight: 'bold'}}>Page {page}</span>
          
          <button 
            disabled={loading || data.length < 100}
            style={{...tableStyles.button, marginLeft: '10px'}}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.th}>Subject</th>
              <th style={tableStyles.th}>Value</th>
              <th style={tableStyles.th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index}>
                  <td style={tableStyles.td}>{row.subject}</td>
                  <td style={tableStyles.td}>{row.value}</td>
                  <td style={tableStyles.td}>{row.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
var BrowseLDESData = () => {
    return (<div>
        <h3>LDES Data Placeholder</h3>
    </div>);
}

var BrowseLDESTSSData = () => {
    return (<div>
        <h3>LDES + TSS Data Placeholder</h3>
    </div>);
}