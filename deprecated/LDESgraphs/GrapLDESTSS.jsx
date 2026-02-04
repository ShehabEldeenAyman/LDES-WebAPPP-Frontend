import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export default function Graph1({URL})  {
  const [data, setData] = useState([]); //Stores the actual list of numbers and times from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // 1. Flatten the points from the nested JSON structure
        // The JSON has a list of objects, each with a 'points' array.
        const allPoints = result.flatMap(item => item.points || []);

        // 2. Map time and value, and sort by time (ascending)
        const sortedData = allPoints
          .map(item => ({
            time: item.time,
            value: parseFloat(item.value),
            observedProperty: item.observedProperty // Using this for labels
          }))
          .sort((a, b) => new Date(a.time) - new Date(b.time));

        setData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [URL]);

  // Define ECharts options
  const options = {
    title: {
      text: data.length > 0 ? data[0].observedProperty : 'River Discharge Data',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = params[0];
        const date = new Date(d.name);
        const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return `${timeStr}<br/>${d.seriesName}: <b>${d.value}</b>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%', 
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.time),
      axisLabel: {
        rotate: 45,
        formatter: (value) => {
          const date = new Date(value);
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
                 date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Discharge',
      min: (value) => (value.min - 1).toFixed(0),
      max: (value) => (value.max + 1).toFixed(0),
    },
    series: [
      {
        name: data.length > 0 ? data[0].observedProperty : 'Discharge',
        data: data.map(d => d.value),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
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
    <div style={{ width: '100%', height: '500px' }}>
      <ReactECharts 
        option={options} 
        style={{ height: '100%', width: '100%' }} 
      />
    </div>
  );
};