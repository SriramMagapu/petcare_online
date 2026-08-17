import React, { useEffect, useState } from "react";
import client from "../../../api";
import "./AdminOrders.css";

interface Order {
  id: number;
  ownerEmail: string;
  totalAmount: number;

  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID";
  orderStatus: "CREATED" | "SHIPPED" | "DELIVERED";

  createdAt: string;
  items: number;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | Order["orderStatus"]>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await client.get("/api/admin/orders");
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load orders", err);
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, newStatus: Order["orderStatus"]) => {
    try {
      await client.put(`/api/admin/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
      loadOrders();
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterStatus === "ALL" || o.orderStatus === filterStatus;
    const matchesSearch =
      o.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="loading-state">Loading orders...</div>;

  return (
    <div className="admin-orders">
      <div className="compact-order-header">
        <div className="header-info">
          <h2>Order Management</h2>
          <p>Track orders and manage fulfillment</p>
        </div>

        <div className="header-tools">
          <div className="search-bar-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search by Email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-pill-group">
            {["ALL", "CREATED", "SHIPPED", "DELIVERED"].map((st) => (
              <button
                key={st}
                className={`pill-btn ${filterStatus === st ? "active" : ""}`}
                onClick={() => setFilterStatus(st as any)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="list-wrapper">
        <table className="order-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">#{order.id}</td>
                <td>{order.ownerEmail}</td>
                <td>{order.items} Items</td>

                {/* PAYMENT LANE */}
                <td>
                  <div className="pay-stack">
                    <span className={`pill method ${order.paymentMethod.toLowerCase()}`}>
                      {order.paymentMethod === "COD" ? "COD" : "Razorpay"}
                    </span>

                    <span className={`pill paystate ${order.paymentStatus.toLowerCase()}`}>
                      {order.paymentStatus === "PAID" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </td>

                <td>₹{order.totalAmount}</td>

                {/* FULFILLMENT LANE */}
                <td>
                  <span className={`status-pill ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </td>

                <td>{new Date(order.createdAt).toLocaleDateString()}</td>

                <td className="text-right">
                  {order.orderStatus !== "DELIVERED" ? (
                    <select
                      className="status-dropdown"
                      value={order.orderStatus}
                      disabled={
                        order.paymentMethod === "ONLINE" &&
                        order.paymentStatus === "PENDING"
                      }
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value as Order["orderStatus"])
                      }
                    >
                      <option value="CREATED">Created</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  ) : (
                    <span className="completed-label">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
