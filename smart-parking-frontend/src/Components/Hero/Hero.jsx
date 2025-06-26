import React, { useState } from "react";
import "./Hero.css";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { Button } from "@mui/material";
import SearchBox from "./SearchBox";
import Cookies from "js-cookie";

import DateTimePicker from "../DateTimePicker/DateTImePicker";
import { useDispatch } from "react-redux";
import { setCurrentLocation } from "../../Store/UserSlice/UserSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import LoginModal from "../../Pages/LoginPage/LoginPage";

const Hero = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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

  const findCurrentLocation = () => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "You are not logged in ",
        text: "Please login first.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          openLoginModal();
        }
      });
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
         
          const { latitude, longitude } = position.coords;
          dispatch(setCurrentLocation({ lat: latitude, lon: longitude }));
          navigate("/dashboard/parkingnearme");
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  };
  return (
    <div className="hero ">
      <div className="hero-txt  text-center py-10">
        <h1 className="text-lg sm:text-sm leading-tight md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white text-center">
          Find & Reserve Your Parking Spot
        </h1>
        <p className="text-lg font-semibold text-gray-200 mt-3">
          Discover hassle-free parking with our smart system. Easily locate,
          book,
          <br></br>and secure your spot in seconds.
        </p>

        <div className="hero-search-box">
          <SearchBox />
          <DateTimePicker />
        </div>

        <div className="mt-4 flex justify-center">
          <button
            className="findbtn flex items-center gap-2"
            onClick={findCurrentLocation}
          >
            <FaMapMarkerAlt className="text-lg" /> {/* Icon */}
            Find Parking Near Me
          </button>
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

export default Hero;
