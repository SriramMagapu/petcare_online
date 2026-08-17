import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard(): JSX.Element {
  return (
    <div className="container" style={{ padding: 28 }}>
      <h1>Dashboard</h1>
      <p>Welcome — you have successfully logged in.</p>
      <Link to="/login">Sign out</Link>
    </div>
  );
}
