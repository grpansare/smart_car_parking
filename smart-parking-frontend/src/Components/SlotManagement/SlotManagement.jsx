import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
// import "./SlotManagement.css";
import { Alert, Button, Snackbar } from "@mui/material";

const SlotManagement = ({ addnewslot }) => {
  const [slotImage, setSlotImage] = useState();
  const [parkingSpace, setParkingSpace] = useState();
  const fileInputRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [parkingImage, setparkingImage] = useState(null);
  const [floors, setFloors] = useState([]);
  const [slotsPerFloor, setSlotsPerFloor] = useState();
  const [open, setOpen] = useState();
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleCLose = () => {
    setOpen(false);
  };
  
  useEffect(() => {
    getParkingSpace();
  }, []);
  
  const handleSubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const getParkingSpace = async () => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8081/parkingowner/parkingspace/${currentUser.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setParkingSpace(response.data);
      setSlotsPerFloor(response.data.totalSlots / response.data.numberOfFloors);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  
  const onAddNewSlot = async () => {
    await addnewslot();
    getParkingSpace();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert("Please select an image file");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setparkingImage(imageUrl);

    let token = Cookies.get("jwt") || localStorage.getItem("token");

    console.log("Selected File:", file);
    console.log("Token:", token);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lotName", parkingSpace.lotName);

    try {
      const response = await axios.put(
        "http://localhost:8081/parkingspaces/updateimage",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleOpen();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Parking Info (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 transform hover:scale-[1.02] transition-all duration-300">
              <div className="p-6">
                {/* Parking Image */}
                <div className="text-center mb-6">
                  <div className="relative inline-block group">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-full lg:h-64 mx-auto rounded-2xl overflow-hidden shadow-lg ring-4 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
                      <img
                        src={
                          parkingImage ||
                          (parkingSpace?.parkingSpaceImage &&
                            `http://localhost:8081/${parkingSpace.parkingSpaceImage.trim()}`) ||
                          "../parkingspace.jpeg"
                        }
                        alt="Parking Space"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  
                  <button 
                    onClick={handleSubmit}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95"
                  >
                    📷 Change Image
                  </button>
                </div>

                {/* Parking Details */}
                <div className="text-center space-y-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800 font-mono bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {parkingSpace?.lotName || "Loading..."}
                  </h2>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Address</p>
                    </div>
                    <p className="text-gray-800 leading-relaxed font-medium text-sm">
                      {parkingSpace?.address || "Address not available"}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 hover:shadow-lg transition-all duration-300">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {parkingSpace?.numberOfFloors || 0}
                      </div>
                      <p className="text-xs text-blue-800 font-semibold">🏢 Floors</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200 hover:shadow-lg transition-all duration-300">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {parkingSpace?.totalSlots || 0}
                      </div>
                      <p className="text-xs text-green-800 font-semibold">🚗 Total Slots</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Slot Management (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              
              {/* Header with Legend and Add Button */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
                      <div className="w-4 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                      <span className="text-sm font-semibold text-gray-700">Reserved</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
                      <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full shadow-inner"></div>
                      <span className="text-sm font-semibold text-gray-700">Available</span>
                    </div>
                  </div>

                  {/* Add Slot Button */}
                  <Button 
                    variant="contained" 
                    onClick={onAddNewSlot}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    ➕ Add New Slot
                  </Button>
                </div>
              </div>

              {/* Floors and Slots */}
              <div className="p-6 max-h-[600px] lg:max-h-[700px] overflow-y-auto">
                {parkingSpace?.numberOfFloors ? (
                  <div className="space-y-6">
                    {Array.from({ length: parkingSpace.numberOfFloors }).map((_, floorIndex) => {
                      const slotsPerFloor = Math.ceil(
                        parkingSpace.totalSlots / parkingSpace.numberOfFloors
                      );
                      const start = floorIndex * slotsPerFloor;
                      const end = start + slotsPerFloor;
                      const floorSlots = parkingSpace?.parkingSlot?.slice(start, end);
                      
                      const availableSlots = floorSlots?.filter(slot => slot.available).length || 0;
                      const totalSlots = floorSlots?.length || 0;

                      return (
                        <div key={floorIndex} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300">
                          {/* Floor Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">{floorIndex + 1}</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  Floor {floorIndex + 1}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {availableSlots} available of {totalSlots} slots
                                </p>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                                  style={{ width: `${totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-600 min-w-[2.5rem]">
                                {totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0}%
                              </span>
                            </div>
                          </div>

                          {/* Slots Grid */}
                          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-16 gap-2">
                            {floorSlots?.map((slot, i) => (
                              <div
                                key={slot.slotId}
                                className={`
                                  aspect-square flex items-center justify-center rounded-lg text-xs font-bold
                                  border-2 transition-all duration-300 hover:scale-110 cursor-pointer shadow-sm hover:shadow-md
                                  ${slot.available 
                                    ? 'bg-white border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50 hover:shadow-green-200' 
                                    : 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                                  }
                                `}
                                title={`Slot ${i + 1} - ${slot.available ? 'Available' : 'Reserved'}`}
                              >
                                <span className="drop-shadow-sm">{i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-300 mb-6">
                      <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-gray-500 text-lg font-bold mb-2">No Parking Data Available</h3>
                    <p className="text-gray-400 text-sm">Please check your connection and try again</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Snackbar */}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handleCLose}
      >
        <Alert
          onClose={handleCLose}
          severity="success"
          variant="filled"
          sx={{ 
            width: "100%",
            borderRadius: '16px',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          🎉 Parking Image Updated Successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SlotManagement;