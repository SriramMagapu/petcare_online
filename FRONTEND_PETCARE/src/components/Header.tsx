import React from "react";
import { Link } from "react-router-dom";
import "../styles/shared.css";
import "../styles/home.css";

export default function Header(): JSX.Element {
  return (
    <header className="pc-header header-shadow">
      <div className="header-inner">
        <div className="brand-wrap">
          <Link to="/" className="brand">
            <svg className="brand-mark" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
              <path d="M12 2C8 2 5 5 5 9c0 7 7 13 7 13s7-6 7-13c0-4-3-7-7-7z" fill="currentColor" />
            </svg>
            <span className="brand-text">PetCare</span>
          </Link>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <Link to="/" className="nav-link">Home</Link>
          <a className="nav-link" href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({behavior:'smooth'}); }}>Features</a>
          <a className="nav-link" href="#testimonials" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({behavior:'smooth'}); }}>Customers</a>
        </nav>
        <div className="header-actions">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign up</Link>
        </div>
      </div>
    </header>
  );
}
