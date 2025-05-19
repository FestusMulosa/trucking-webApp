import React from 'react';
import './Reports.css';

const Reports = () => {
  // Mock data for reports
  const monthlyMileage = [
    { month: 'Jan', mileage: 12500 },
    { month: 'Feb', mileage: 11800 },
    { month: 'Mar', mileage: 13200 },
    { month: 'Apr', mileage: 14500 },
    { month: 'May', mileage: 13900 },
  ];
  
  const fuelConsumption = [
    { month: 'Jan', gallons: 1250 },
    { month: 'Feb', gallons: 1180 },
    { month: 'Mar', gallons: 1320 },
    { month: 'Apr', gallons: 1450 },
    { month: 'May', gallons: 1390 },
  ];
  
  const maintenanceCosts = [
    { month: 'Jan', cost: 3500 },
    { month: 'Feb', cost: 2200 },
    { month: 'Mar', cost: 4800 },
    { month: 'Apr', cost: 1900 },
    { month: 'May', cost: 3200 },
  ];
  
  const truckUtilization = [
    { truckId: 'Truck 001', utilization: 85 },
    { truckId: 'Truck 002', utilization: 62 },
    { truckId: 'Truck 003', utilization: 45 },
    { truckId: 'Truck 004', utilization: 78 },
    { truckId: 'Truck 005', utilization: 91 },
  ];

  // Calculate max values for scaling charts
  const maxMileage = Math.max(...monthlyMileage.map(item => item.mileage));
  const maxGallons = Math.max(...fuelConsumption.map(item => item.gallons));
  const maxCost = Math.max(...maintenanceCosts.map(item => item.cost));

  return (
    <div className="reports-container">
      <h1>Fleet Reports</h1>
      
      <div className="report-grid">
        <div className="report-card">
          <h2>Monthly Mileage</h2>
          <div className="chart bar-chart">
            {monthlyMileage.map((item, index) => (
              <div className="chart-item" key={index}>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ height: `${(item.mileage / maxMileage) * 100}%` }}
                  ></div>
                </div>
                <div className="label">{item.month}</div>
                <div className="value">{item.mileage.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="chart-footer">
            <p>Total: {monthlyMileage.reduce((sum, item) => sum + item.mileage, 0).toLocaleString()} miles</p>
          </div>
        </div>
        
        <div className="report-card">
          <h2>Fuel Consumption</h2>
          <div className="chart bar-chart">
            {fuelConsumption.map((item, index) => (
              <div className="chart-item" key={index}>
                <div className="bar-container">
                  <div 
                    className="bar fuel-bar" 
                    style={{ height: `${(item.gallons / maxGallons) * 100}%` }}
                  ></div>
                </div>
                <div className="label">{item.month}</div>
                <div className="value">{item.gallons.toLocaleString()} gal</div>
              </div>
            ))}
          </div>
          <div className="chart-footer">
            <p>Total: {fuelConsumption.reduce((sum, item) => sum + item.gallons, 0).toLocaleString()} gallons</p>
          </div>
        </div>
        
        <div className="report-card">
          <h2>Maintenance Costs</h2>
          <div className="chart bar-chart">
            {maintenanceCosts.map((item, index) => (
              <div className="chart-item" key={index}>
                <div className="bar-container">
                  <div 
                    className="bar cost-bar" 
                    style={{ height: `${(item.cost / maxCost) * 100}%` }}
                  ></div>
                </div>
                <div className="label">{item.month}</div>
                <div className="value">${item.cost.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="chart-footer">
            <p>Total: ${maintenanceCosts.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="report-card">
          <h2>Truck Utilization</h2>
          <div className="utilization-chart">
            {truckUtilization.map((item, index) => (
              <div className="utilization-item" key={index}>
                <div className="truck-label">{item.truckId}</div>
                <div className="utilization-bar-container">
                  <div 
                    className="utilization-bar" 
                    style={{ width: `${item.utilization}%` }}
                  ></div>
                  <span className="utilization-value">{item.utilization}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-footer">
            <p>Average: {Math.round(truckUtilization.reduce((sum, item) => sum + item.utilization, 0) / truckUtilization.length)}%</p>
          </div>
        </div>
      </div>
      
      <div className="report-actions">
        <button className="report-button">
          <i className="fas fa-download"></i> Export Reports
        </button>
        <button className="report-button">
          <i className="fas fa-print"></i> Print Reports
        </button>
      </div>
    </div>
  );
};

export default Reports;
