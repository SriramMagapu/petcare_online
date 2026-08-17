import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import "../../styles/OwnerStore.css";

// Icons for the Stepper
const StepperIcons = {
  Cart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path></svg>,
  Map: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Card: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

// General Icons
const Icons = {
  Store: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Box: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 00 3 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 00 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Cart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path></svg>
};

type Props = {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (c: string) => void;
  showFilters?: boolean;
  currentStep?: "CART" | "ADDRESS" | "CONFIRM";
};

export default function StoreSubHeader({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, showFilters = true, currentStep }: Props) {
  const navigate = useNavigate();
  const { cart } = useCart();
  const CATEGORIES = ["ALL", "Food", "Toys", "Medicine", "Accessories", "Grooming"];

  const getStepClass = (stepName: string) => {
    if (!currentStep) return "step-item";
    if (currentStep === stepName) return "step-item active";
    if (currentStep === "CONFIRM" && (stepName === "CART" || stepName === "ADDRESS")) return "step-item completed";
    if (currentStep === "ADDRESS" && stepName === "CART") return "step-item completed";
    return "step-item";
  };

  return (
    <div className="store-sticky-bar">
      <div className="store-bar-content">
        
        {/* Left: Brand */}
        <div className="store-brand" onClick={() => navigate("/owner/store")} style={{cursor: 'pointer'}}>
          <span className="brand-icon"><Icons.Store /></span>
          <h2 className="brand-title">Pet Store</h2>
        </div>

        {/* Middle: Either Search OR Stepper */}
        <div className="store-center-content">
          {currentStep ? (
            // --- STEPPER (With Icons) ---
            <div className="header-stepper">
              <div className={getStepClass("CART")}>
                <div className="step-circle">
                  {getStepClass("CART").includes("completed") ? <StepperIcons.Check /> : <StepperIcons.Cart />}
                </div>
                <span>Cart</span>
              </div>
              
              <div className={`step-line ${getStepClass("ADDRESS").includes("active") || getStepClass("ADDRESS").includes("completed") ? "filled" : ""}`}></div>
              
              <div className={getStepClass("ADDRESS")}>
                <div className="step-circle">
                  {getStepClass("ADDRESS").includes("completed") ? <StepperIcons.Check /> : <StepperIcons.Map />}
                </div>
                <span>Address</span>
              </div>
              
              <div className={`step-line ${getStepClass("CONFIRM").includes("active") ? "filled" : ""}`}></div>
              
              <div className={getStepClass("CONFIRM")}>
                <div className="step-circle">
                  <StepperIcons.Card />
                </div>
                <span>Payment</span>
              </div>
            </div>
          ) : (
            // --- SEARCH BAR ---
            showFilters && setSearchQuery && (
              <div className="store-search-wrapper">
                <span className="search-icon-inside"><Icons.Search /></span>
                <input 
                  type="text" 
                  className="store-search-field"
                  placeholder="Search for food, toys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )
          )}
        </div>

        {/* Right: Actions */}
        <div className="store-nav-actions">
          {showFilters && setSelectedCategory && !currentStep && (
            <select className="store-category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="ALL">All Categories</option>
              {CATEGORIES.filter(c => c !== "ALL").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <div className="nav-action-btn" onClick={() => navigate("/owner/store/orders")}>
            <Icons.Box />
            <span className="action-label">Orders</span>
          </div>

          <div className="nav-action-btn cart-btn-highlight" onClick={() => navigate("/owner/store/cart")}>
            <div className="icon-badge-wrapper">
              <Icons.Cart />
              {cart.length > 0 && <span className="nav-badge">{cart.length}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}