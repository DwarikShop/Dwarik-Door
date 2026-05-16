import { createBrowserRouter, Navigate } from "react-router";
import { SplashScreen } from "./screens/SplashScreen";
import { PublicHome } from "./screens/PublicHome";
import { LoginScreen } from "./screens/LoginScreen";
import { OwnerDashboard } from "./screens/OwnerDashboard";
import { PlaceOrderScreen } from "./screens/PlaceOrderScreen";
import { OrderManagement } from "./screens/OrderManagement";
import { OrderDetails } from "./screens/OrderDetails";
import { EmployeeDashboard } from "./screens/EmployeeDashboard";
import { EmployeeOrderList } from "./screens/EmployeeOrderList";
import { EmployeeOrderWorkflow } from "./screens/EmployeeOrderWorkflow";
import { InventoryDashboard } from "./screens/InventoryDashboard";
import { EmployeeManagement } from "./screens/EmployeeManagement";
import { ProfileScreen } from "./screens/ProfileScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashScreen />,
  },
  {
    path: "/home",
    element: <PublicHome />,
  },
  {
    path: "/login",
    element: <LoginScreen />,
  },
  // ── Owner routes ──────────────────────────────
  {
    path: "/dashboard",
    element: <OwnerDashboard />,
  },
  {
    path: "/place-order",
    element: <PlaceOrderScreen />,
  },
  {
    path: "/orders",
    element: <OrderManagement />,
  },
  {
    path: "/orders/:id",
    element: <OrderDetails />,
  },
  {
    path: "/inventory",
    element: <InventoryDashboard />,
  },
  {
    path: "/employees",
    element: <EmployeeManagement />,
  },
  {
    path: "/profile",
    element: <ProfileScreen />,
  },
  // ── Employee routes ───────────────────────────
  {
    path: "/employee/dashboard",
    element: <EmployeeDashboard />,
  },
  {
    path: "/employee/orders",
    element: <EmployeeOrderList />, // employee-only order list
  },
  {
    path: "/employee/orders/:id",
    element: <EmployeeOrderWorkflow />, // employee workflow actions
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
