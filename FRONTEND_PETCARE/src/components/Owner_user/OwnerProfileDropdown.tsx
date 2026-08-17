import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";

interface Props {
  onClose: () => void;
  onLogout: () => void;
  name: string;
  email?: string | undefined;
  photoPath?: string | undefined;
}

// 🔒 SAFE FALLBACK
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&size=128&background=0D8ABC&color=fff";

export default function OwnerProfileDropdown({
  onClose,
  onLogout,
  name,
  email,
  photoPath,
}: Props) {
  const navigate = useNavigate();
  const initial = name?.charAt(0).toUpperCase() || "U";

  // ✅ SAFE IMAGE URL
  const avatarUrl = getImageUrl(photoPath, DEFAULT_AVATAR);

  return (
    <div
      className="profile-dropdown"
      onClick={(e) => e.stopPropagation()} // 🔥 keep dropdown open
    >
      {/* HEADER */}
      <div className="dropdown-header">
        <img
          src={avatarUrl}
          alt="Profile"
          className="dropdown-avatar-img"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
        />

        <div className="dropdown-user-info">
          <strong className="dropdown-name">{name}</strong>
          {email && <p className="dropdown-email">{email}</p>}
        </div>
      </div>

      <div className="dropdown-divider" />

      <button
        className="dropdown-item"
        onClick={() => {
          onClose();
          navigate("/owner/profile");
        }}
      >
        <i className="fa-solid fa-user-pen"></i> View Profile
      </button>

      <button
        className="dropdown-item"
        onClick={() => {
          onClose();
          navigate("/owner/profile/change-password");
        }}
      >
        <i className="fa-solid fa-lock"></i> Change Password
      </button>

      <div className="dropdown-divider" />

      <button
        className="dropdown-item danger"
        onClick={() => {
          onClose();
          onLogout();
        }}
      >
        <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
      </button>
    </div>
  );
}