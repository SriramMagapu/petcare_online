// // src/components/pets/PetHeader.tsx
// import type { Pet } from "../../api";
// import "../../styles/petHeader.css";

// const API_BASE =
//   import.meta.env.VITE_API_BASE ||
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:8080";

// export default function PetHeader({
//   pet,
//   tab,
//   setTab,
// }: {
//   pet: Pet;
//   tab: string;
//   setTab: (t: string) => void;
// }) {
//   const getSpeciesEmoji = (species?: string) => {
//     if (!species) return "🐾";
//     const s = species.toLowerCase();
//     if (s === "dog") return "🐕";
//     if (s === "cat") return "🐈";
//     if (s === "bird") return "🐦";
//     if (s === "rabbit") return "🐰";
//     return "🐾";
//   };

//   const getTabIcon = (tabName: string) => {
//     switch(tabName) {
//       case "overview": return "📋";
//       case "medical": return "🏥";
//       case "vaccination": return "💉";
//       case "health": return "🩺";
//       default: return "📄";
//     }
//   };

//   const getTabLabel = (tabName: string) => {
//     return tabName.charAt(0).toUpperCase() + tabName.slice(1);
//   };

//   return (
//     <div className="pet-detail-header">
     

//       {/* Navigation Tabs */}
//       <nav className="pet-navigation-tabs">
//         {["overview", "medical", "vaccination", "health"].map((t) => (
//           <button
//             key={t}
//             className={`nav-tab ${tab === t ? "active" : ""}`}
//             onClick={() => setTab(t)}
//           >
//             <span className="tab-icon">{getTabIcon(t)}</span>
//             <span className="tab-label">{getTabLabel(t)}</span>
//           </button>
//         ))}
//       </nav>
//     </div>
//   );
// }