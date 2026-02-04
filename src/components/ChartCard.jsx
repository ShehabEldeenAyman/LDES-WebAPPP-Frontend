import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export const ChartCardHead = ({title}) => {
    return (
        <div>
            <   h2 style={{ fontSize: '1.5rem', color: '#333' }}>{title}</h2>
        </div>
    );
}

// ChartCard.jsx

export const ChartCardBody = ({ charts = [], placeholder = "No charts available" }) => {
    const gridStyles = {
        container: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            height: '100%',
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.5rem'
        },
        chartItem: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '8px',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px', 
            color: '#666',
            boxSizing: 'border-box'
        }
    };

    // If charts array is empty, show the placeholder in a single grid cell
    if (charts.length === 0) {
        return (
            <div style={gridStyles.container}>
                <div style={{ ...gridStyles.chartItem, gridColumn: 'span 2' }}>
                    <p style={{ fontStyle: 'italic' }}>{placeholder}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={gridStyles.container}>
            {charts.map((content, index) => (
                <div key={index} style={gridStyles.chartItem}>
                    {content}
                </div>
            ))}
        </div>
    );
};