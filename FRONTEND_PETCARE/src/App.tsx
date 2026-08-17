import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

/* CONTEXT (Correct Path based on your structure) */
import { CartProvider } from "./components/Owner_user/CartContext";

/* PUBLIC */
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminLogin from "./components/admin/pages/AdminLogin";

/* OWNER */
import OwnerDashboard from "./components/Owner_user/OwnerDashboard";
import OwnerHome from "./components/Owner_user/OwnerHome";
import OwnerPets from "./components/Owner_user/OwnerPets";
import OwnerProfile from "./components/Owner_user/OwnerProfile";
import EditOwnerProfile from "./components/Owner_user/EditOwnerProfile";
import OwnerStore from "./components/Owner_user/OwnerStore";
import AvailableVets from "./components/Owner_user/OwnersideAvailableVets";

/* === NEW IMPORTS FOR CART & ORDERS === */
import OwnerCart from "./components/Owner_user/OwnerCart";
import OwnerOrders from "./components/Owner_user/OwnerOrders";

/* PETS */
import PetList from "./components/pets/PetList";
import PetDetail from "./components/pets/PetDetail";

/* VET */
import VetDashboard from "./components/vet/VetDashboard";
import VetSidePetOverview from "./components/VetSidePetOverview";

/* ADMIN */
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminDashboard from "./components/admin/pages/AdminDashboard";
import AdminUsers from "./components/admin/pages/AdminUsers";
import AdminVetApproval from "./components/admin/pages/AdminVetApproval";
import AdminStore from "./components/admin/pages/AdminStore";
import AdminOrders from "./components/admin/pages/AdminOrders";
import AdminReports from "./components/admin/pages/AdminReports";

/* COMMON */
import ChangePassword from "./components/ChangePassword";
import ProfileSection from "./components/vet/components/ProfileSection";

export default function App() {
  return (
    // WRAPPED WITH CartProvider
    <CartProvider>
      <BrowserRouter>
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />


          {/* ================= OWNER ROUTES ================= */}
          <Route path="/owner-dashboard" element={<ProtectedRoute role="OWNER"><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/home" element={<ProtectedRoute role="OWNER"><OwnerHome /></ProtectedRoute>} />
          <Route path="/owner/mypets" element={<ProtectedRoute role="OWNER"><OwnerPets /></ProtectedRoute>} />
          <Route path="/owner/vets" element={<ProtectedRoute role="OWNER"><AvailableVets /></ProtectedRoute>} />
          
          {/* === STORE & CART ROUTES === */}
          <Route path="/owner/store" element={<ProtectedRoute role="OWNER"><OwnerStore /></ProtectedRoute>} />
          <Route path="/owner/store/cart" element={<ProtectedRoute role="OWNER"><OwnerCart /></ProtectedRoute>} />
          <Route path="/owner/store/orders" element={<ProtectedRoute role="OWNER"><OwnerOrders /></ProtectedRoute>} />

          <Route path="/owner/profile" element={<ProtectedRoute role="OWNER"><OwnerProfile /></ProtectedRoute>} />
          <Route path="/owner/profile/edit" element={<ProtectedRoute role="OWNER"><EditOwnerProfile /></ProtectedRoute>} />
          <Route path="/owner/profile/change-password" element={<ProtectedRoute role="OWNER"><ChangePassword /></ProtectedRoute>} />


          {/* ================= PET ROUTES (OWNER ONLY) ================= */}
          <Route path="/pets" element={<ProtectedRoute role="OWNER"><PetList /></ProtectedRoute>} />
          <Route path="/pets/:id" element={<ProtectedRoute role="OWNER"><PetDetail /></ProtectedRoute>} />


          {/* ================= VET ROUTES ================= */}
          <Route path="/vet/dashboard" element={<ProtectedRoute role="VET"><VetDashboard /></ProtectedRoute>} />
          <Route path="/vet/pet/:petId" element={<ProtectedRoute role="VET"><VetSidePetOverview /></ProtectedRoute>} />


          {/* ================= ADMIN ROUTES (LAYOUT LEVEL) ================= */}
          <Route path="/admin/*" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vets" element={<AdminVetApproval />} />
            <Route path="store" element={<AdminStore />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>


          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<h1>404 – Page Not Found</h1>} />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}