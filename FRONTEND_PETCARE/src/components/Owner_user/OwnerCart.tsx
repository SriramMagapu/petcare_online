import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerHeader from "./OwnerHeader";
import StoreSubHeader from "./StoreSubHeader";
import { useCart } from "./CartContext";
import client from "../../api";
import "../../styles/OwnerCart.css";

const Icons = {
  Trash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  CheckBig: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
};

export default function OwnerCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, changeQty, cartTotal, clearCart } = useCart();

  const [step, setStep] = useState<"CART" | "ADDRESS" | "CONFIRM">("CART");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [address, setAddress] = useState({
    door: "",
    street: "",
    city: "",
    country: "",
    pincode: "",
    mobile: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");

  const addressValid = Object.values(address).every((v) => v.trim() !== "");
  const fullAddress = `${address.door}, ${address.street}, ${address.city}, ${address.country} - ${address.pincode}\nMobile: ${address.mobile}`;

  function handleBack() {
    if (step === "CONFIRM") return setStep("ADDRESS");
    if (step === "ADDRESS") return setStep("CART");
    navigate("/owner/store");
  }

  async function handlePlaceOrder() {
    if (!addressValid) return;
    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        await client.post("/api/orders/checkout/cod", {
          address: fullAddress,
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity
          }))
        });

        setShowSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate("/owner/store");
        }, 1500);
        return;
      }

      // ONLINE PAYMENT FLOW ---------------------

      const razorLoaded = await loadRazorpay();
      if (!razorLoaded) {
        alert("Failed to load payment gateway");
        setLoading(false);
        return;
      }

      const rpRes = await client.post("/api/payments/create", {
        amount: cartTotal
      });

      const { razorpayOrderId, amount, currency } = rpRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "PetCare Store",
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await client.post("/api/payments/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              address: fullAddress,
              items: cart.map((i) => ({
                productId: i.productId,
                quantity: i.quantity
              }))
            });

            setShowSuccess(true);
            setTimeout(() => {
              clearCart();
              navigate("/owner/store");
            }, 1200);
          } catch {
            alert("Payment verification failed");
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      new (window as any).Razorpay(options).open();

    } catch (err) {
      alert("Order failed");
      setLoading(false);
    }
  }

  function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return (
    <div className="owner-store-page">
      <OwnerHeader />
      <StoreSubHeader currentStep={step} />

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon-circle">
              <Icons.CheckBig />
            </div>
            <h2>Order Placed!</h2>
            <p>Thank you for your purchase.</p>
          </div>
        </div>
      )}

      <div className="cart-page-container">
        <div className="cart-header-row">
          <button className="back-arrow-btn" onClick={handleBack}>
            <Icons.ArrowLeft /> Back
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-left-section">
            {step === "CART" && (
              <>
                {cart.length === 0 ? (
                  <div className="empty-state-card">
                    <h3>Your cart is empty</h3>
                    <button className="checkout-btn" onClick={() => navigate("/owner/store")}>Start Shopping</button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="cart-item-card">
                      <img
                        src={`https://ui-avatars.com/api/?name=${item.name}&background=f1f5f9&color=334155`}
                        className="item-image"
                        alt={item.name}
                      />
                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-overview">Price: ₹{item.price}</p>
                      </div>
                      <div className="item-actions">
                        <div className="qty-selector">
                          <button className="qty-btn" onClick={() => changeQty(item.productId, item.quantity - 1)}>−</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => changeQty(item.productId, item.quantity + 1)}>+</button>
                        </div>
                        <div className="item-price">₹{item.price * item.quantity}</div>
                        <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

           {step === "ADDRESS" && (
  <div className="form-card">
    <div className="card-header">
      <h3 className="section-title">Shipping Address</h3>
    </div>

    <div className="form-grid">
      <div className="form-row">
        <div className="input-group">
          <label>Door / Flat No</label>
          <input
            className="form-input"
            placeholder="e.g. 12A / 3rd Floor"
            value={address.door}
            onChange={(e) => setAddress({ ...address, door: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label>Street</label>
          <input
            className="form-input"
            placeholder="e.g. MG Road"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>City</label>
          <input
            className="form-input"
            placeholder="e.g. Bengaluru"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label>Country</label>
          <input
            className="form-input"
            placeholder="e.g. India"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Pincode</label>
          <input
            className="form-input"
            placeholder="e.g. 560001"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label>Mobile</label>
          <input
            className="form-input"
            placeholder="+91 9876543210"
            value={address.mobile}
            onChange={(e) => setAddress({ ...address, mobile: e.target.value })}
          />
        </div>
      </div>
    </div>
  </div>
)}

            {step === "CONFIRM" && (
              <div className="form-card">
                <h3 className="section-title">Payment Method</h3>

                <div className="payment-grid-container">
                  <label className={`payment-card-option ${paymentMethod === "ONLINE" ? "selected" : ""}`}>
                    <input type="radio" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} />
                    <div>
                      <div className="pay-title">Online Payment</div>
                      <div className="pay-desc">UPI / Cards / NetBanking</div>
                    </div>
                  </label>

                  <label className={`payment-card-option ${paymentMethod === "COD" ? "selected" : ""}`}>
                    <input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                    <div>
                      <div className="pay-title">Cash on Delivery</div>
                      <div className="pay-desc">Pay on arrival</div>
                    </div>
                  </label>
                </div>

                <div className="delivery-review-box">
                  <h4>Delivering To:</h4>
                  <p style={{whiteSpace: "pre-line", marginTop: ".5rem"}}>{fullAddress}</p>
                </div>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-right-section">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="highlight-green">Free</span>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>

                {step === "CART" && (
                  <button className="checkout-btn" onClick={() => setStep("ADDRESS")}>Proceed to Address →</button>
                )}
                {step === "ADDRESS" && (
                  <button className="checkout-btn" disabled={!addressValid} onClick={() => setStep("CONFIRM")}>
                    {addressValid ? "Proceed to Payment →" : "Complete Address"}
                  </button>
                )}
                {step === "CONFIRM" && (
  <button className="checkout-btn pay-btn" disabled={loading} onClick={handlePlaceOrder}>
    {loading
      ? "Processing..."
      : paymentMethod === "COD"
        ? "Confirm Order"
        : "Proceed to Pay"}
  </button>
)}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
