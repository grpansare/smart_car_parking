import React, { useState } from "react";
import { motion } from "framer-motion";
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
    setIsLoginModalOpen(false);
    console.log("Switch to signup modal");
  };

  const findCurrentLocation = () => {
    let token = Cookies.get("token") || localStorage.getItem("token");
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -50 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const searchBoxVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9 
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: 0.4
      }
    }
  };

  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.6
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="hero"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="hero-txt text-center py-10"
        variants={containerVariants}
      >
        <motion.h1 
          className="text-lg sm:text-sm leading-tight md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white text-center"
          variants={titleVariants}
        >
          Find & Reserve Your Parking Spot
        </motion.h1>
        
        <motion.p 
          className="text-lg font-semibold text-gray-200 mt-3"
          variants={itemVariants}
        >
          Discover hassle-free parking with our smart system. Easily locate,
          book,
          <br />
          and secure your spot in seconds.
        </motion.p>

        <motion.div 
          className="hero-search-box"
          variants={searchBoxVariants}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <SearchBox />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <DateTimePicker />
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-4 flex justify-center"
          variants={buttonVariants}
        >
          <motion.button
            className="findbtn flex items-center gap-2"
            onClick={findCurrentLocation}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <FaMapMarkerAlt className="text-lg" />
            </motion.div>
            Find Parking Near Me
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Login Modal with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: isLoginModalOpen ? 1 : 0,
          scale: isLoginModalOpen ? 1 : 0.9
        }}
        transition={{ duration: 0.3 }}
        style={{ 
          pointerEvents: isLoginModalOpen ? 'auto' : 'none'
        }}
      >
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeLoginModal}
          onSwitchToSignup={handleSwitchToSignup}
        />
      </motion.div>
    </motion.div>
  );
};

export default Hero;