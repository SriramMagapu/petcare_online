import React, { useEffect, useState } from "react";
import client from "../../../api";
import ProductModal from "../components/ProductModal";
import "./AdminStore.css";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  active: boolean;
  imagePath?: string;
}

export default function AdminStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_IMAGE = "https://placehold.co/100x100?text=No+Photo";

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await client.get("/api/admin/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: number, active: boolean) {
    await client.put(`/api/admin/products/${id}/status`, { active: !active });
    loadProducts();
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admstore-container">Loading...</div>;

  return (
    <div className="admstore-container">
      <div className="admstore-header">
        <div className="admstore-header-left">
          <h1>Store Management</h1>
          <p className="admstore-header-subtitle">Manage inventory and product visibility</p>
        </div>
        
        <div className="admstore-header-right">
          <div className="admstore-search-group">
            <label htmlFor="search" className="admstore-label-hidden">Search Products</label>
            <input 
              id="search"
              type="text" 
              placeholder="Search by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admstore-search-bar"
            />
          </div>
          <button className="admstore-btn-primary" onClick={() => setShowModal(true)}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="admstore-table-container">
        <table className="admstore-modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Status</th>
              <th className="admstore-text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td className="admstore-id-cell">#{p.id}</td>
                <td>
                  <div className="admstore-img-wrapper">
                    <img
                      src={p.imagePath ? `http://localhost:8080/uploads/${p.imagePath}` : DEFAULT_IMAGE}
                      alt={p.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                    />
                  </div>
                </td>
                <td className="admstore-product-title">{p.name}</td>
                <td>
                  <span className="admstore-category-tag">{p.category}</span>
                </td>
                <td><span className="admstore-price-text">₹{p.price.toLocaleString()}</span></td>
                <td>
                    <span className={`admstore-qty-text ${p.quantity < 5 ? 'admstore-low-stock' : ''}`}>
                        {p.quantity}
                    </span>
                </td>
                <td>
                  <span className={`admstore-badge ${p.active ? "admstore-success" : "admstore-disabled"}`}>
                    {p.active ? "ACTIVE" : "DISABLED"}
                  </span>
                </td>
                <td className="admstore-text-right">
                  <div className="admstore-action-group">
                    <button className="admstore-btn-icon admstore-edit" onClick={() => setEditing(p)}>Edit</button>
                    <button 
                      className={`admstore-btn-icon ${p.active ? "admstore-disable" : "admstore-enable"}`}
                      onClick={() => toggleActive(p.id, p.active)}
                    >
                      {p.active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductModal
          product={null}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); loadProducts(); }}
        />
      )}

      {editing && (
        <ProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={() => { setEditing(null); loadProducts(); }}
        />
      )}
    </div>
  );
}