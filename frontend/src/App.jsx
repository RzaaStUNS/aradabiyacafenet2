// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/dashboard/Admin";
import CashierDashboard from "@/pages/dashboard/Cashier";
import CustomerDashboard from "@/pages/dashboard/Customer";
import Test from "@/pages/Test";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier"
        element={
          <ProtectedRoute roles={["cashier"]}>
            <CashierDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer"
        element={
          <ProtectedRoute roles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={
            <Test />
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;