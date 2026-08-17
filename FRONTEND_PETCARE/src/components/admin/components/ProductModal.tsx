import React, { useState, useEffect } from "react";
import client from "../../../api";
import { X, Package, Tag, DollarSign, Layers, UploadCloud, Info } from "lucide-react";
import "./ProductModal.css";

interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  active: boolean;
}

interface Props {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductModal({ product, onClose, onSave }: Props) {
  const [form, setForm] = useState<Product>({
    name: "",
    category: "",
    price: 0,
    quantity: 0,
    active: true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) setForm(product);
  }, [product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let productId: number;
      if (product?.id) {
        const res = await client.put(`/api/admin/products/${product.id}`, form);
        productId = res.data.id;
      } else {
        const res = await client.post("/api/admin/products", form);
        productId = res.data.id;
      }

      if (image) {
        const fd = new FormData();
        fd.append("file", image);
        await client.post(`/api/admin/products/${productId}/image`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      onSave();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pmodal-overlay" onClick={onClose}>
      <div className="pmodal-card" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="pmodal-header">
          <div className="pmodal-title-group">
            <div className="pmodal-icon-bg"><Package size={20} /></div>
            <h3>{product ? "Update Product" : "Add New Product"}</h3>
          </div>
          <button className="pmodal-close-x" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Scrollable Body */}
        <div className="pmodal-body">
          <form onSubmit={handleSubmit} className="pmodal-form">
            <div className="pmodal-field">
              <label className="pmodal-label"><Tag size={14}/> Product Name</label>
              <input
                className="pmodal-input"
                placeholder="e.g. Premium Adult Dog Food"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="pmodal-row">
              <div className="pmodal-field">
                <label className="pmodal-label"><Layers size={14}/> Category</label>
                <select
                  className="pmodal-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Food">Pet Food</option>
                  <option value="Toys">Interactive Toys</option>
                  <option value="Accessories">Health Accessories</option>
                  <option value="Medicine">Medical Care</option>
                  <option value="Grooming">Grooming Kits</option>
                </select>
              </div>

              <div className="pmodal-field">
                <label className="pmodal-label"><DollarSign size={14}/> Price (₹)</label>
                <input
                  className="pmodal-input"
                  type="text"
                  placeholder="0.00"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value.replace(/[^0-9.]/g, '')) })}
                  required
                />
              </div>
            </div>

            <div className="pmodal-field">
              <label className="pmodal-label"><Package size={14}/> Total Stock Quantity</label>
              <input
                className="pmodal-input"
                type="text"
                placeholder="Enter units available"
                value={form.quantity || ""}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value.replace(/[^0-9]/g, '')) })}
                required
              />
            </div>

            <div className="pmodal-field">
              <label className="pmodal-label"><Info size={14}/> Product Image</label>
              <label className="pmodal-upload-zone">
                <UploadCloud size={32} />
                <div className="pmodal-upload-text">
                  {image ? <strong>{image.name}</strong> : <span>Click to upload product photo</span>}
                </div>
                <input
                  type="file"
                  className="pmodal-hidden-file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="pmodal-status-card">
              <label className="pmodal-toggle">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <div className="pmodal-toggle-content">
                  <strong>Active Status</strong>
                  <p>Allow customers to see this product in the store</p>
                </div>
              </label>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="pmodal-footer">
          <button type="button" className="pmodal-btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="pmodal-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? "Processing..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}