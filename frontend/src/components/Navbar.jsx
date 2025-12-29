import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="w-full bg-black/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => {
            navigate("/");
            setIsOpen(false);
          }}
          className="text-2xl font-bold cursor-pointer text-white"
        >
          Settlr
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            // Show Sign Out button when user is logged in
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white text-red-600 border border-black rounded-lg hover:bg-red-600 hover:text-white hover:scale-105 transition-all duration-200 flex items-center gap-2 font-bold"
            >
              <img src="/exit_198141.png" alt="Sign Out" className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            // Show Login and Sign Up buttons when user is logged out
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-white hover:text-[#26f50c] transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 text-white hover:text-[#26f50c] transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur-md border-t shadow-sm">
          <div className="flex flex-col px-4 py-4 space-y-4">
            {user ? (
              // Show Sign Out button when user is logged in
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="px-4 py-2 bg-white text-red-600 border border-black rounded-lg hover:bg-red-600 hover:text-white hover:scale-105 transition-all duration-200 text-left flex items-center gap-2 font-bold"
              >
                <img src="/exit_198141.png" alt="Sign Out" className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              // Show Login and Sign Up buttons when user is logged out
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-[#26f50c]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-[#26f50c]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
