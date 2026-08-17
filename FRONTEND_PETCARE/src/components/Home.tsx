import React, { useState, useEffect } from 'react';
import '../styles/home.css';
import heroBg from "../assets/hbg.png";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials: Testimonial[] = [
    { name: "Sarah Johnson", role: "Dog Owner", text: "PetCare has been a lifesaver! I never miss my dog's vaccination appointments anymore.", rating: 5 },
    { name: "Michael Chen", role: "Cat Owner", text: "The best pet management app I've used. My vet loves how organized all my cat's records are.", rating: 5 },
    { name: "Emily Rodriguez", role: "Pet Parent", text: "Managing three pets has never been easier. The dashboard is intuitive and amazing!", rating: 5 }
  ];

  return (
    <div className="home-page">
      <nav className="floating-header">
        <div className="nav-container">
          <div className="logo"><i className="fa-solid fa-paw"></i> <span>PetCare</span></div>
          <div className="nav-links">
            <a href="/login" className="nav-link1">Login</a>
            <a href="/register" className="nav-btn">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="hero-section" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover' }}>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">Trusted by 10,000+ Pet Parents</div>
            <h1 className="hero-title">Your Pet's Health, <span className="gradient-text">Simplified</span></h1>
            <p className="hero-subtitle">Manage appointments, track health records, and never miss important reminders. Everything your pet needs in one comprehensive platform.</p>
            <div className="hero-cta">
              <a href="/register" className="btn btn-primary">Start Free Trial</a>
              <a href="#features" className="btn btn-secondary">Learn More</a>
            </div>
            <div className="hero-features">
              <span className="feature-badge">Free forever</span>
              <span className="feature-badge">No credit card</span>
              <span className="feature-badge">2-min setup</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item"><div className="stat-number">50K+</div><div className="stat-label">Happy Pets</div></div>
          <div className="stat-item"><div className="stat-number">10K+</div><div className="stat-label">Pet Owners</div></div>
          <div className="stat-item"><div className="stat-number">500+</div><div className="stat-label">Trusted Vets</div></div>
          <div className="stat-item"><div className="stat-number">99%</div><div className="stat-label">Satisfaction</div></div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">Everything You Need for Pet Care</h2>
          <p className="section-subtitle">Powerful features designed to make pet parenting easier and more joyful</p>
          <div className="features-grid">
            <div className="feature-card"><div className="feature-icon blue">PH</div><h3>Pet Health</h3><p>Monitor your pet's health and medical history in one place.</p></div>
            <div className="feature-card"><div className="feature-icon sky">AS</div><h3>Appointments</h3><p>Book and manage vet appointments with ease.</p></div>
            <div className="feature-card"><div className="feature-icon indigo">SR</div><h3>Reminders</h3><p>Get timely notifications for medications and vaccines.</p></div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo"><i className="fa-solid fa-paw"></i> <span>PetCare</span></div>
              <p>Making pet care simple, secure, and joyful.</p>
            </div>
            <div className="footer-col"><h4 className="footer-heading">Legal</h4><ul className="footer-links"><li><a href="#">Privacy Policy</a></li></ul></div>
          </div>
          <div className="footer-bottom"><p>&copy; {new Date().getFullYear()} PetCare System. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}