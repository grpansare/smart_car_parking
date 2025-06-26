import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { HiMenu } from "react-icons/hi";
import styles from "./OwnerNavbar.module.css";
import { useDispatch } from "react-redux";
import { Logout } from "../../Store/UserSlice/UserSlice";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

const OwnerNavbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const logout = async () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(Logout());
        localStorage.removeItem("token");
        Cookies.remove("jwt", { path: "", domain: "" });
        Swal.fire(
          "Logged Out!",
          "You have been logged out successfully.",
          "success"
        ).then(() => {
          navigate("/");
        });
      }
    });
  };

  return (
    <div className={styles.navbar}>
      {/* Mobile menu button */}
      <button 
        className={styles.menuButton}
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        <HiMenu className={styles.menuIcon} />
      </button>

      <h2 className={styles.title}>Parking Owner Dashboard</h2>
      
      <div className={styles.profileSection}>
        <FaUserCircle className={styles.profileIcon} />
        <p className={styles.profileText}>
          <Link to="ParkingOwnerProfile">Owner Profile</Link>
        </p>
        <button className={styles.logoutBtn} onClick={logout}>
          <IoLogOutOutline className={styles.logoutIcon} />
          <span className={styles.logoutText}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default OwnerNavbar;