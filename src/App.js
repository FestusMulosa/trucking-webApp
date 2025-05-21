import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './Screens/Dashboard';
import Trucks from './Screens/Trucks';
import Drivers from './Screens/Drivers';
import DriverDetails from './Screens/DriverDetails';
import TruckDetails from './Screens/TruckDetails';
import Maintenance from './Screens/Maintenance';
import MaintenanceDetails from './Screens/MaintenanceDetails';
import Reports from './Screens/Reports';
import Settings from './Screens/Settings';
import Login from './Screens/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <Dashboard />
                    </main>
                  </>
                }
              />
              <Route
                path="/trucks"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <Trucks />
                    </main>
                  </>
                }
              />
              <Route
                path="/trucks/:statusFilter"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <Trucks />
                    </main>
                  </>
                }
              />
              <Route
                path="/trucks/details/:truckId"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <TruckDetails />
                    </main>
                  </>
                }
              />
              <Route
                path="/drivers"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <Drivers />
                    </main>
                  </>
                }
              />
              <Route
                path="/drivers/:driverId"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <DriverDetails />
                    </main>
                  </>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <Maintenance />
                    </main>
                  </>
                }
              />
              <Route
                path="/maintenance/truck/:truckId"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <MaintenanceDetails />
                    </main>
                  </>
                }
              />
              <Route
                path="/reports"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <Reports />
                    </main>
                  </>
                }
              />
              <Route
                path="/settings"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 bg-background py-6">
                      <Settings />
                    </main>
                  </>
                }
              />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
