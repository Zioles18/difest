import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { Customers } from "./pages/Customers";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { UnderDevelopment } from "./pages/UnderDevelopment";
import { SplashScreen } from "./components/SplashScreen";
import { auth } from "./utils/auth";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login page - standalone */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard pages - protected and wrapped in DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
