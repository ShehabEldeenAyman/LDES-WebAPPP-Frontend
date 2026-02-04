import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export default function GraphLDES({URL})  {
  const [data, setData] = useState([]); //Stores the actual list of numbers and times from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { //Run this specific code only once, right when the component first appears on the screen
    const fetchData = async () => {
      try {
        setLoading(true);
        //const response = await fetch('http://localhost:3000/ldes/RiverStage1Year');
        const response = await fetch(URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // 1. Sort by time (ascending) and parse values
        const sortedData = [...result]
          .sort((a, b) => new Date(a.time) - new Date(b.time))
          .map(item => ({
            time: item.time,
            value: parseFloat(item.value),
            parameter: item.parameter // Capture parameter for the title/tooltip
          }));

        setData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Define ECharts options
  const options = {
    title: {
      text: data.length > 0 ? data[0].parameter : 'Observation Values',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = params[0];
        const timeStr = new Date(d.name).toLocaleTimeString();
        return `${timeStr}<br/>${d.seriesName}: <b>${d.value}</b>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%', // Added space for labels
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.time),
      axisLabel: {
        formatter: (value) => new Date(value).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    },
    yAxis: {
      type: 'value',
      // Adjusting min/max slightly for the larger range in your new data
      min: (value) => (value.min - 2).toFixed(0),
      max: (value) => (value.max + 2).toFixed(0),
    },
    series: [
      {
        name: data.length > 0 ? data[0].parameter : 'Value',
        data: data.map(d => d.value),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#5470c6'
        },
        areaStyle: {
          color: 'rgba(84, 112, 198, 0.2)'
        }
      }
    ]
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading Chart...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactECharts 
        option={options} 
        style={{ height: '100%', width: '100%' }} 
      />
    </div>
  );
};

