import { useEffect, useState } from "react";
import OwnerHeader from "./OwnerHeader";
import StoreSubHeader from "./StoreSubHeader";
import "../../styles/OwnerOrder.css";
import { apiFetchMyOrders, type OrderResponseDTO } from "../../api";

type OrderItem = {
  name: string;
  price: number;
  qty: number;
  image: string;
};

type Order = {
  id: string;
  date: string;
  total: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID";
  orderStatus: "CREATED" | "SHIPPED" | "DELIVERED";
  items: OrderItem[];
};

function OrderTimeline({
  paymentStatus,
  orderStatus,
  paymentMethod,
}: {
  paymentStatus: "PENDING" | "PAID";
  orderStatus: "CREATED" | "SHIPPED" | "DELIVERED";
  paymentMethod: "COD" | "ONLINE";
}) {
  const steps =
    paymentMethod === "COD"
      ? [
          { key: "CREATED", label: "Ordered", icon: "🛒" },
          { key: "SHIPPED", label: "Shipped", icon: "📦" },
          { key: "PAID", label: "Payment", icon: "💰" },
          { key: "DELIVERED", label: "Delivered", icon: "🏠" },
        ]
      : [
          { key: "CREATED", label: "Ordered", icon: "🛒" },
          { key: "PAID", label: "Payment", icon: "💰" },
          { key: "SHIPPED", label: "Shipped", icon: "📦" },
          { key: "DELIVERED", label: "Delivered", icon: "🏠" },
        ];

  const isDone = (step: string) => {
  // ✅ Ordered step should always be completed once order exists
  if (step === "CREATED") return true;

  if (step === "PAID") return paymentStatus === "PAID";

  if (step === "SHIPPED")
    return orderStatus === "SHIPPED" || orderStatus === "DELIVERED";

  if (step === "DELIVERED") return orderStatus === "DELIVERED";

  return false;
};


  const getActiveStep = () => {
    if (orderStatus === "DELIVERED") return steps.length;
    if (orderStatus === "SHIPPED")
      return steps.findIndex((s) => s.key === "SHIPPED") + 1;
    if (paymentStatus === "PAID")
      return steps.findIndex((s) => s.key === "PAID") + 1;
    return 0;
  };

  const activeStep = getActiveStep();
  const progressWidth = `${(activeStep / steps.length) * 100}%`;

  return (
    <div className="order-timeline-box">
      <div className="timeline-container">
        <div
          className="timeline-progress-line"
          style={{ width: progressWidth }}
        ></div>

        {steps.map((step, index) => {
          const done = isDone(step.key);
          const isActive = !done && activeStep === index + 1;

          return (
            <div
              key={step.key}
              className={`timeline-step ${done ? "done" : ""} ${
                isActive ? "active" : ""
              }`}
            >
              <div
                className={`timeline-dot ${done ? "done" : ""} ${
                  isActive ? "active" : ""
                }`}
              >
                {done ? "✓" : step.icon}
              </div>
              <div className="timeline-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const IMAGE_BASE = "http://localhost:8080";

/* ✅ DEFAULT IMAGE (used when product has no image or image fails to load) */
const DEFAULT_PRODUCT_IMAGE =
  "https://ui-avatars.com/api/?name=Product&size=400&background=f1f5f9&color=334155";

export default function OwnerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadOrders() {
      try {
        const data: OrderResponseDTO[] = await apiFetchMyOrders();

        const mappedOrders: Order[] = data.map((o) => ({
          id: String(o.id),
          date: new Date(o.orderDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          total: o.totalAmount,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          items: o.items.map((i) => {
            /* ✅ UPDATED: handle null / empty imageUrl safely */
            const imageSrc =
              i.imageUrl && i.imageUrl.trim() !== ""
                ? `${IMAGE_BASE}${i.imageUrl}` // valid product image
                : DEFAULT_PRODUCT_IMAGE; // fallback image

            return {
              name: i.productName,
              qty: i.quantity,
              price: i.price,
              image: imageSrc,
            };
          }),
        }));

        setOrders(mappedOrders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const getPaymentMethodDisplay = (method: string) =>
    method === "COD"
      ? { icon: "💵", text: "Cash on Delivery" }
      : { icon: "💳", text: "Online Payment" };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "✓";
      case "SHIPPED":
        return "🚚";
      default:
        return "📦";
    }
  };

  return (
    <div className="owner-store-page">
      <OwnerHeader />
      <StoreSubHeader showFilters={false} />

      <div className="orders-page-container">
        <h2 className="orders-page-title">My Orders</h2>

        {loading ? (
          <div className="store-loading-state">
            <div className="store-spinner"></div>
            <p>Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon">📦</div>
            <div className="orders-empty-text">No Orders Yet</div>
            <div className="orders-empty-subtext">
              Start shopping to see your orders here!
            </div>
          </div>
        ) : (
          <div className="orders-list-wrapper">
            {orders.map((order) => {
              const paymentDisplay = getPaymentMethodDisplay(
                order.paymentMethod
              );

              return (
                <div key={order.id} className="order-card-classy">
                  {/* HEADER */}
                  <div className="order-card-header">
                    <div className="order-header-left">
                      <span className="order-id-label">Order ID</span>
                      <span className="order-id-value">#{order.id}</span>
                      <span className="order-date-text">{order.date}</span>
                    </div>

                    <div className="order-status-pills">
                      <div className="payment-method-badge">
                        <span>{paymentDisplay.icon}</span>
                        <span>{paymentDisplay.text}</span>
                        <span
                          className={`payment-status ${order.paymentStatus.toLowerCase()}`}
                        >
                          {order.paymentStatus === "PAID"
                            ? "✓ Paid"
                            : "⏱ Pending"}
                        </span>
                      </div>

                      <span
                        className={`status-pill ${order.orderStatus.toLowerCase()}`}
                      >
                        {getStatusIcon(order.orderStatus)}{" "}
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="order-card-body">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <div className="order-item-img-wrapper">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-item-img"
                            /* ✅ UPDATED: fallback if image URL exists but file is broken */
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                        </div>
                        <div className="order-item-details">
                          <div className="order-item-name">{item.name}</div>
                          <div className="order-item-qty">
                            Quantity: {item.qty}
                          </div>
                        </div>
                        <div className="order-item-price">
                          ₹{item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {expanded[order.id] && (
                    <OrderTimeline
                      paymentStatus={order.paymentStatus}
                      orderStatus={order.orderStatus}
                      paymentMethod={order.paymentMethod}
                    />
                  )}

                  {/* FOOTER */}
                  <div className="order-card-footer">
                    <button
                      className="track-btn"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [order.id]: !prev[order.id],
                        }))
                      }
                    >
                      {expanded[order.id]
                        ? "Hide Tracking"
                        : "Track Order"}
                    </button>

                    <div className="order-total-section">
                      <div className="order-total-label">Total Amount</div>
                      <div className="order-total-value">
                        ₹{order.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
