import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrderPage';
import MarketingPage from './pages/MarketingPage';
import MediaPlansPage from './pages/MediaPlansPage';
import OfferPricingPage from './pages/OfferPricingPage';
import ClientsPage from './pages/ClientsPage';
import SuppliersPage from './pages/SuppliersPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import SalesReportsPage from './pages/SalesReportsPage';
import FinancePage from './pages/FinancePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserDashboard from './pages/UserDashboard';

function ProtectedRoute({ children, isSuperuserRequired = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (isSuperuserRequired && !user.is_superuser) return <Navigate to="/unauthorized" />;
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Super Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute isSuperuserRequired={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* Dynamic Pages (Require login only) */}
          <Route path="/products_list" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/order_list" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/marketing_list" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
          <Route path="/media_plans" element={<ProtectedRoute><MediaPlansPage /></ProtectedRoute>} />
          <Route path="/offer_pricing_skus" element={<ProtectedRoute><OfferPricingPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
          <Route path="/customer_support" element={<ProtectedRoute><CustomerSupportPage /></ProtectedRoute>} />
          <Route path="/sales_reports" element={<ProtectedRoute><SalesReportsPage /></ProtectedRoute>} />
          <Route path="/finance_accounting" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />

          <Route path="/unauthorized" element={<div className="text-center mt-5 text-danger"><h2>Unauthorized Access</h2></div>} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />

        </Routes>
      </AuthProvider>

    </Router>
  );
}

export default App;
