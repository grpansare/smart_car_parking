import axios from "axios";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";


import { FaX } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import LoginModal from "../../Pages/LoginPage/LoginPage";
import useAuthStatus from "../../Hooks/useAuthStatus";

const SearchBox = ({ searchPlace }) => {
  const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuthStatus();
   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [searchedPlace, setSearchPlace] = useState(searchPlace);
  const handleChange = (e) => {
    setSearchPlace(e.target.value);
  };
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };
   const handleSwitchToSignup = () => {
    // Close login modal and handle signup logic
    setIsLoginModalOpen(false);
    // Add your signup modal logic here or navigate to signup
    console.log("Switch to signup modal");
  };
  const handleSearch = async () => {
    if (loading) return; // Don't allow search until auth check is done

    if (!isAuthenticated) {
      Swal.fire({
        title: "You are not logged in",
        text: "Please login first.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) openLoginModal();
      });
      return;
    }

    if (!searchedPlace.trim()) {
      Swal.fire({
        title: "Search place is empty!",
        text: "Please enter a valid location.",
        icon: "warning",
      });
      return;
    }

    navigate(`/dashboard/parkingspaces/${searchedPlace}`);
  };
  return (
    <div>
      <div className="searchbox text-black flex items-center w-full max-w-xs sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-md mx-auto bg-white rounded-lg shadow-md p-2">
        <input
          type="text"
          name=""
          id=""
          value={searchedPlace}
          onChange={handleChange}
          className="bg-transparent flex-grow p-3 outline-none"
          placeholder="Search city,place,address..."
        />
        {searchedPlace && (
          <div className="clearbtn">
            <FaX
              onClick={() => {
                setSearchPlace("");
              }}
              className="mr-2"
            ></FaX>
          </div>
        )}
        <div
          onClick={handleSearch}
          className="searchbtn p-3 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition duration-200"
        >
          <FaSearch className="w-5 h-5" />
        </div>
      </div>
      {/* Login Modal */}
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={closeLoginModal}
              onSwitchToSignup={handleSwitchToSignup}
            />
    </div>
  );
};

export default SearchBox;
