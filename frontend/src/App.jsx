// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import AdminDashboard from "./pages/dashboard/Admin";
import CashierDashboard from "./pages/dashboard/Cashier";
import CustomerDashboard from "./pages/dashboard/Customer";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["cashier"]} />}>
          <Route path="/cashier" element={<CashierDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/customer" element={<CustomerDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;