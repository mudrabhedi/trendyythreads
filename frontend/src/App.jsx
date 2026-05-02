import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import AboutSection from "./components/AboutSection";
import CartPage from "./pages/CartPage";
import CheckOutPage from "./pages/CheckOutPage";
import { Toaster } from "react-hot-toast";
import JeansPage from "./pages/JeansPage";
import PantsPage from "./pages/PantsPage";
import DressesPage from "./pages/DressesPage";
import TopsPage from "./pages/TopsPage";
import CoordsPage from "./pages/CoordsPage";
import KurtaPage from "./pages/KurtaPage";
import FeaturedPage from "./pages/FeaturedPage";
import ProductPage from "./pages/ProductDetailsPage";
import AccountPage from "./pages/AccountsPage";

function App() {
  return (
    <div className="min-h-screen bg-[#FEE2E2] text-[#4B0F1F] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,#FFB3C6_0%,#FED7C3_45%,#FEE2E2_100%)]" />
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "1px solid #E5E5E5",
            padding: "12px 16px",
            color: "#111",
            fontSize: "14px",
          },
        }}
      />

      <Navbar />

      <main className="relative z-10 pt-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<AdminPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckOutPage />} />
          <Route path="/jeans" element={<JeansPage />} />
          <Route path="/pants" element={<PantsPage />} />
          <Route path="/dresses" element={<DressesPage />} />
          <Route path="/tops" element={<TopsPage />} />
          <Route path="/coords" element={<CoordsPage />} />
          <Route path="/kurta" element={<KurtaPage />} />
          <Route path="/featured" element={<FeaturedPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>

        <AboutSection />
      </main>
    </div>
  );
}

export default App;
