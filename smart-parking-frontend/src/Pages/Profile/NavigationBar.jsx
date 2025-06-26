import React from "react";

const NavigationBar = ({ activeSection, setActiveSection }) => {
  return (
    <div className="horizontal-navbar">
      <button onClick={() => setActiveSection("Parking Space")}>
        Parking Space
      </button>
      <button onClick={() => setActiveSection("Pricing & Availability")}>
        Pricing & Availability
      </button>
      <button onClick={() => setActiveSection("bank Details")}>
        bank Details
      </button>
      <button onClick={() => setActiveSection("Security Settings")}>
        Security Settings
      </button>
      <button onClick={() => setActiveSection("Support & Feedback")}>
        Support & Feedback
      </button>
    </div>
  );
};

export default NavigationBar;