import React, { useState } from "react";
import { Link } from "react-router-dom";
import RegisterDropDown from "../Dropdown/RegisterDropDown";
import LoginModal from "../../Pages/LoginPage/LoginPage";
import { FaBars, FaTimes } from "react-icons/fa";

const PublicNavbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSwitchToSignup = () => {
    closeLoginModal();
    console.log("Switch to signup modal");
    // Add signup navigation/modal here (e.g., open a signup modal)
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 px-4 py-3 shadow-xl border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm backdrop-filter"> {/* Increased shadow, slightly darker border, added backdrop-filter for consistency */}
        <div className="max-w-7xl mx-auto"> {/* Removed redundant px-4 sm:px-6 lg:px-8 as it's handled by parent nav */}
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="../../logo.png"
                alt="ParkEase Logo"
                className="h-10 rounded-lg shadow-md" // Added subtle shadow to logo
              />
              <span className="ml-3 text-2xl font-extrabold text-white drop-shadow-lg tracking-wide"> {/* Increased font size, bolder, more prominent shadow, added tracking */}
                ParkEase
              </span>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-colors duration-200"
                aria-expanded={isMenuOpen ? "true" : "false"} // Added accessibility attribute
                aria-label={isMenuOpen ? "Close menu" : "Open menu"} // Added accessibility label
              >
                {isMenuOpen ? (
                  <FaTimes className="block h-7 w-7" /> // Slightly larger icon for better tap target
                ) : (
                  <FaBars className="block h-7 w-7" /> // Slightly larger icon
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8"> {/* Adjusted spacing for larger screens */}
              <Link
                to="/"
                className="text-slate-200 hover:text-white hover:bg-slate-700 px-4 py-2 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105" // Slightly larger padding, rounded-lg, faster transition, subtle scale effect on hover
              >
                Home
              </Link>
              <Link
                to="/parkingspaces"
                className="text-slate-200 hover:text-white hover:bg-slate-700 px-4 py-2 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105" // Same improvements as Home link
              >
                Parking Spaces
              </Link>
              <button
                onClick={openLoginModal}
                className="text-slate-200 hover:text-white hover:bg-slate-700 px-4 py-2 text-base font-medium bg-transparent border border-slate-600 hover:border-slate-500 cursor-pointer rounded-lg transition-all duration-300 transform hover:scale-105" // Added a subtle border, improved hover border, same transition and scale effect
              >
                Login
              </button>
              <RegisterDropDown /> {/* RegisterDropDown can be styled internally */}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-slate-800 to-slate-900 shadow-2xl border-t border-slate-700 pb-4"> {/* Darker shadow, darker border, increased bottom padding */}
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-4 py-3 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md transition-all duration-200" // Increased padding
                onClick={toggleMenu} // Close menu on click
              >
                Home
              </Link>
              <Link
                to="/parkingspaces"
                className="block px-4 py-3 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md transition-all duration-200" // Increased padding
                onClick={toggleMenu} // Close menu on click
              >
                Parking Spaces
              </Link>
              <button
                onClick={() => {
                  openLoginModal();
                  toggleMenu(); // Close mobile menu when opening login modal
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded-md transition-all duration-200" // Increased padding
              >
                Login
              </button>
              <div className="px-4 py-3"> {/* Increased padding for dropdown */}
                <RegisterDropDown />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </>
  );
};

export default PublicNavbar;