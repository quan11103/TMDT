// AnalyticsView.tsx
import React from 'react';
import StatCard from './StatCard';
import './AnalyticsView.css';

const AnalyticsView: React.FC = () => {
    return (
        <div className="analytics-view">
            <div className="stats-grid">
                <StatCard label="Avg. Order Value" value="$125.50" trend="+2.4%" isPositive />
                <StatCard label="Conversion Rate" value="3.24%" trend="+0.8%" isPositive />
                <StatCard label="Return Rate" value="1.10%" trend="-0.2%" isPositive={false} />
            </div>

            <div className="chart-placeholder">
                <div className="chart-header">
                    <h3>Revenue Growth</h3>
                    <select className="shop-select">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                    </select>
                </div>
                <div className="visual-chart">
                    {/* Ở đây bạn có thể tích hợp Recharts hoặc Chart.js */}
                    <p>Sales Chart Visualization Placeholder</p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;