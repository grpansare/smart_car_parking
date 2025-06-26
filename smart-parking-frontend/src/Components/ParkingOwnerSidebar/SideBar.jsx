import React from "react";
import { Link } from "react-router-dom";
import { MenuBook, Close } from "@mui/icons-material";

const ParkingOwnerSidebar = ({ logout, onClose }) => {
  return (
    <div className="w-[300px] lg:w-[280px] h-screen bg-[#488A99] p-5 rounded-lg shadow-lg relative">
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-white hover:text-gray-200 lg:hidden transition-colors duration-200"
        aria-label="Close sidebar"
      >
        <Close />
      </button>

      {/* Heading */}
      <div className="flex items-center mb-5 pr-8 lg:pr-0">
        <MenuBook className="text-white mr-2" />
        <h3 className="text-white text-lg m-0 font-semibold">
          Parking Owner
        </h3>
      </div>

      {/* Dashboard Links */}
      <div className="mt-7 space-y-4">
        <Link
          to="/parkingownerdash/"
          onClick={onClose}
          className="block px-4 py-3 bg-gray-200 text-gray-800 rounded-lg transition duration-300 hover:bg-gray-300 hover:text-gray-900 hover:shadow-md active:bg-gray-400 font-medium"
        >
          📊 Manage Parking Slots
        </Link>
        
        <Link
          to="view-bookings"
          onClick={onClose}
          className="block px-4 py-3 bg-gray-200 text-gray-800 rounded-lg transition duration-300 hover:bg-gray-300 hover:text-gray-900 hover:shadow-md active:bg-gray-400 font-medium"
        >
          📋 View Bookings
        </Link>
        
        <Link
          to="payment-history"
          onClick={onClose}
          className="block px-4 py-3 bg-gray-200 text-gray-800 rounded-lg transition duration-300 hover:bg-gray-300 hover:text-gray-900 hover:shadow-md active:bg-gray-400 font-medium"
        >
          💳 Payment History
        </Link>

        {/* Optional Settings Link */}
        {/* <Link
          to="settings"
          onClick={onClose}
          className="block px-4 py-3 bg-gray-200 text-gray-800 rounded-lg transition duration-300 hover:bg-gray-300 hover:text-gray-900 hover:shadow-md active:bg-gray-400 font-medium"
        >
          ⚙️ Settings
        </Link> */}
      </div>

      {/* Mobile-specific footer */}
      <div className="absolute bottom-5 left-5 right-5 lg:hidden">
        <div className="text-white text-sm opacity-75 text-center">
          Tap outside to close
        </div>
      </div>
    </div>
  );
};

export default ParkingOwnerSidebar;