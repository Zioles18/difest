import React, { useState } from "react";
import { RouterProvider, useLocation, Navigate } from "./lib/router";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { Customers } from "./pages/Customers";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { SplashScreen } from "./components/SplashScreen";
import { auth } from "./utils/auth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { pathname: route } = useLocation();

  const pages: Record<string, React.ReactNode> = {
    "/login": <Login />,
    "/": <ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>,
    "/profile": <ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>,
    "/orders": <ProtectedRoute><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>,
    "/customers": <ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>,
    "/analytics": <ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>,
    "/settings": <ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>,
  };

  return <>{pages[route] || <Navigate to="/" />}</>;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
}
