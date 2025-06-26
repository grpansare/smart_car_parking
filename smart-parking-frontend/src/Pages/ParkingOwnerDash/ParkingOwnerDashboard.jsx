import React, { useState } from "react";
import ParkingOwnerSidebar from "../../Components/ParkingOwnerSidebar/SideBar";
import OwnerNavbar from "./OwnerNavbar";
import styles from "./ParkingOwnerDashboard.module.css";

import { Outlet } from "react-router-dom";

const ParkingOwnerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <ParkingOwnerSidebar onClose={closeSidebar} />
      </div>
      
      {/* Main content */}
      <div className={styles.mainContent}>
        <OwnerNavbar onToggleSidebar={toggleSidebar} />
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ParkingOwnerDashboard;