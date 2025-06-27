import React, { useEffect, useState } from "react";
import { FaBars, FaCar, FaPlusCircle, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { Box, Modal } from "@mui/material";
import { setUser } from "../../Store/UserSlice/UserSlice";

import api from "../../api/axios";
import ProfileDropdown from "../Dropdown/ProfileDropdown";

const PrivateNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicle, setVehicle] = useState({});

  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    if (currentUser?.email) getVehicleInfo();
  }, [currentUser]);

  const getUserInfo = async () => {
    try {
      const res = await api.get("/user/profile");
      
      dispatch(setUser(res.data));
      console.log("user info");
      
    } catch (error) {
      alert("error fetching user info")
      console.error("Error fetching user info:", error);
    }
  };

  const getVehicleInfo = async () => {
    try {
      const res = await api.get(`user/getvehiclesInfo/${currentUser.email}`);
      if (res.data.length > 0) {
        const updatedUser = { ...currentUser, vehicleInfo: res.data };
        dispatch(setUser(updatedUser));
      } else {
        setTimeout(openModal, 2000);
      }
    } catch (e) {
      console.error("Error fetching vehicle info:", e);
    }
  };

  const handleVehicleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/user/addvehicle/${currentUser.email}`,
        vehicle
      );
      if (res.status === 201) {
        const updatedUser = {
          ...currentUser,
          vehicleInfo: res.data,
        };
        dispatch(setUser(updatedUser));
        closeModal();
      }
    } catch (error) {
      console.error("Error updating vehicle info:", error);
    }
  };

  const renderNavLink = (to, label) => (
    <Link
      to={to}
      className="text-slate-200 hover:text-white hover:bg-slate-700 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 block w-full md:w-auto text-center md:text-left"
      onClick={() => setIsMenuOpen(false)} // Close mobile menu when link is clicked
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 px-2 sm:px-4 py-3 shadow-lg border-b border-slate-600 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-12 sm:h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <img
                src="../../logo.png"
                alt="ParkEase Logo"
                className="h-8 sm:h-10 rounded-lg"
              />
              <span className="ml-2 text-lg sm:text-xl font-bold text-white whitespace-nowrap">
                ParkEase
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {renderNavLink("/dashboard", "Home")}
              {renderNavLink("/dashboard/my-booking", "My Bookings")}
              {renderNavLink("/dashboard/parkingspaces", "All Parking Spaces")}
              {renderNavLink("/dashboard/payments", "Payments")}
              <div className="ml-2">
                <ProfileDropdown />
              </div>
            </div>

            {/* Tablet Navigation (md to lg) */}
            <div className="hidden md:flex lg:hidden items-center space-x-2">
              {renderNavLink("/dashboard", "Home")}
              {renderNavLink("/dashboard/my-booking", "Bookings")}
              {renderNavLink("/dashboard/parkingspaces", "Spaces")}
              <div className="ml-2">
                <ProfileDropdown />
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-slate-300 hover:text-white hover:bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <FaTimes className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <FaBars className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? 'max-h-96 opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible'
          } overflow-hidden`}>
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-600 px-2 py-3 space-y-1 mt-3 rounded-b-lg">
              {renderNavLink("/dashboard", "Home")}
              {renderNavLink("/dashboard/my-booking", "My Bookings")}
              {renderNavLink("/dashboard/parkingspaces", "All Parking Spaces")}
              {renderNavLink("/dashboard/payments", "Payments")}
              <div className="pt-2 border-t border-slate-600 mt-2">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Vehicle Modal */}
      <Modal 
        open={isModalOpen} 
        onClose={closeModal}
        className="flex items-center justify-center p-4"
      >
        <Box className="w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white rounded-lg shadow-xl mx-auto">
          <form onSubmit={handleVehicleUpdate} className="space-y-4">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 flex items-center gap-2 mb-4">
              <FaCar className="text-blue-600" /> 
              <span>Vehicle Information</span>
            </h3>

            <div className="space-y-4">
              {[
                { label: "Car Make", name: "carMake", placeholder: "e.g., Toyota, Honda" },
                { label: "Car Model", name: "model", placeholder: "e.g., Camry, Civic" },
                { label: "Car Color", name: "color", placeholder: "e.g., Blue, Red" },
                { label: "License Plate", name: "licencePlate", placeholder: "e.g., ABC-1234" },
              ].map(({ label, name, placeholder }) => (
                <div key={name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={vehicle[name] || ""}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Later
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaPlusCircle /> 
                <span>Add Vehicle</span>
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default PrivateNavbar;