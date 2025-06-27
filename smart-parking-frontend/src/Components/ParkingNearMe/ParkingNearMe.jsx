import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../ParkingSpaces/ParkingSpaces.module.css";
import SearchBox from "../Hero/SearchBox";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../../api/axios";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { ParkingModal } from "../ParkingModal/ParkingModal";
import { Alert, Button, Snackbar, CircularProgress, Chip } from "@mui/material";
import { ConfirmBookingModal } from "../ParkingModal/ConfirmBookingModal";

import { cancelBooking } from "../../Utils/BookingFunctions";

import { 
  LocationOn, 
  LocalParking, 
  DirectionsCar, 
  Payment,
  MapOutlined 
} from '@mui/icons-material';

const ParkingNearMe = () => {
  // State management
  const { currentLocation } = useSelector((state) => state.user);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); // Pune coords
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [geoLocations, setGeoLocations] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setConfirmationModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchedPlace, setSearchedPlace] = useState('');

  // Event handlers
  const handleMarkerClick = useCallback((spot) => {
    console.log("Clicked Spot:", spot);
    setSelectedSpot(spot);
    setShowModal(true);
  }, []);

  const handleClick = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmationModal(false);
    setSelectedSpot(null);
  }, []);

  const handleChooseSlot = useCallback((space) => {
    handleMarkerClick(space);
  }, [handleMarkerClick]);

  const handleChooseRandom = useCallback(async (space) => {
    setSelectedSpot(space);
    await confirmBooking(space); // Ensuring confirmBooking runs after state update
  }, []);

  // API functions
  const getParkingSpaces = useCallback(async () => {
    setLoading(true);

    
    try {
      const response = await api.get(
        `/parkingspaces/${searchedPlace}`,
      
      );
      setParkingSpaces(response.data);
    } catch (error) {
      console.error("Error fetching parking spaces:", error);
    } finally {
      setLoading(false);
    }
  }, [searchedPlace]);

  const getNearSpaces = useCallback(() => {
    if (!currentLocation) return;
   
    
    setLoading(true);
    api
      .get(
        `/parkingspaces/nearby?lat=${currentLocation.lat}&lon=${currentLocation.lon}`,
       
      )
      .then((response) => {
        console.log(response.data);
        setGeoLocations(response.data);
        setParkingSpaces(response.data);
        if (response.data.length > 0) {
          console.log(currentLocation);
          setMapCenter([currentLocation.lat, currentLocation.lon]);
        }
      })
      .catch((error) => console.error("Error fetching parking spots:", error))
      .finally(() => setLoading(false));
  }, [currentLocation]);

  const confirmBooking = useCallback(async (selected, slotNumber = null) => {
    console.log(selected);

    if (!selected || !selected.spaceIdd) {
      console.log("No spot selected or invalid spot");
      return;
    }

   

    try {
      const response = await api.put(
        `/parkingspaces/bookparking`,
        { spaceId: selected.spaceIdd },
        {
          params: slotNumber ? { slotNumber } : {},
        
        }
      );
      console.log(response.data);

      if (response.data) {
        console.log("Booking successful, opening confirmation modal...");
        setSelectedSlot(response.data);
        setConfirmationModal(true);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error booking parking:", error);
      alert("Booking failed. Try again.");
    }
  }, [handleCloseModal]);

  const startPayment = useCallback(async (paymentData, bookingData) => {
    console.log("Starting payment process");


    try {
      console.log("Sending request to create order");
      const response = await api.post(
        "/api/payment/create-order",
        paymentData,
       
      );
      console.log(currentUser.email);

      const order = response.data;
      const options = {
        key: "rzp_test_5wU1xQg8xAioM6",
        amount: order.amount,
        currency: order.currency,
        name: "ParkEase",
        description: "Payment for order",
        order_id: order.id,
        handler: async function (response) {
          console.log("Payment Success:", response);

          const paymentDetails = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: order.amount / 100,
            currency: order.currency,
            customerEmail: currentUser.email,
            customerName: currentUser.fullname,
            lotName: selectedSpot.lotName,
            status: "Completed",
          };

          try {
            await api.post(
              "/api/payment/store",
              paymentDetails,
             
            );

            const response = await api.post(
              `/api/bookings/${selectedSlot}`,
              bookingData,
             
            );
            console.log(response);

            handleClick();
            navigate(`/dashboard/reciept/${response.data.id}`);
            getParkingSpaces();
            setConfirmationModal(false);
          } catch (error) {
            console.error("Error storing payment or booking details:", error);
            alert("Payment succeeded but failed to store booking details.");
          }
        },
        modal: {
          ondismiss: function () {
            cancelBooking(selectedSlot, selectedSpot);
            setSelectedSlot(null);
            setConfirmationModal(false);
            getParkingSpaces();
          },
        },
        prefill: {
          name: currentUser?.fullname || "Your Name",
          email: currentUser?.email || "youremail@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "note value",
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order.");
    }
  }, [currentUser, selectedSpot, selectedSlot, handleClick, navigate, getParkingSpaces]);

  // Effects
  useEffect(() => {
    if (currentLocation) {
      getNearSpaces();
    }
  }, [currentLocation, getNearSpaces]);

  // Map component
  const DynamicMapCenter = ({ center }) => {
    const map = useMap();

    useEffect(() => {
      if (
        center &&
        Array.isArray(center) &&
        center.length === 2 &&
        typeof center[0] === "number" &&
        typeof center[1] === "number"
      ) {
        map.setView(center, 13);
      }
    }, [center, map]);

    return null;
  };

  // Utility functions
  const getMarkerIcon = (totalSlots) => {
    const iconColor = totalSlots > 0 ? 'green' : 'red';
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const getSelectedMarkerIcon = () => {
    return new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const getUserLocationIcon = () => {
    return new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const getAvailabilityColor = (totalSlots) => {
    if (totalSlots > 10) return 'success';
    if (totalSlots > 5) return 'warning';
    if (totalSlots > 0) return 'error';
    return 'default';
  };

  const getAvailabilityText = (totalSlots) => {
    if (totalSlots > 10) return 'High Availability';
    if (totalSlots > 5) return 'Medium Availability';
    if (totalSlots > 0) return 'Low Availability';
    return 'Full';
  };

  return (
    <div className={`p-4 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100`}>
      <div className="">
        <SearchBox />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <CircularProgress size={60} />
          <span className="ml-4 text-lg text-gray-600">Loading parking spaces...</span>
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Map Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                <MapOutlined className="mr-2" />
                Nearby Parking Locations
              </h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">
                Find the perfect parking spot near you
              </p>
            </div>
            
            <div className={` p-2 sm:p-4`}>
              <style jsx global>{`
                /* Enhanced responsive popup styles */
                .custom-popup .leaflet-popup-content-wrapper {
                  border-radius: 16px !important;
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                  padding: 0 !important;
                  background: white !important;
                  border: 1px solid rgba(0, 0, 0, 0.05) !important;
                  max-height: 80vh !important;
                  overflow: hidden !important;
                }
                
                .custom-popup .leaflet-popup-content {
                  margin: 0 !important;
                  padding: 20px !important;
                  min-width: 280px !important;
                  max-width: 320px !important;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                  line-height: 1.5 !important;
                  max-height: calc(80vh - 40px) !important;
                  overflow-y: auto !important;
                }
                
                .custom-popup .leaflet-popup-tip {
                  background: white !important;
                  border: 1px solid rgba(0, 0, 0, 0.05) !important;
                  border-top: none !important;
                  border-right: none !important;
                }
                
                .custom-popup .leaflet-popup-close-button {
                  color: #6b7280 !important;
                  font-size: 18px !important;
                  padding: 8px !important;
                  width: 30px !important;
                  height: 30px !important;
                  top: 8px !important;
                  right: 8px !important;
                  z-index: 1000 !important;
                  background: rgba(255, 255, 255, 0.9) !important;
                  border-radius: 50% !important;
                  backdrop-filter: blur(4px) !important;
                }
                
                .custom-popup .leaflet-popup-close-button:hover {
                  color: #374151 !important;
                  background: rgba(0, 0, 0, 0.05) !important;
                  transform: scale(1.1) !important;
                  transition: all 0.2s ease !important;
                }
                
                /* Map container responsive adjustments */
                .leaflet-container {
                  font-family: inherit !important;
                }
                
                /* Tablet styles - iPad and similar */
                @media (max-width: 1024px) {
                  .custom-popup .leaflet-popup-content {
                    padding: 18px !important;
                    min-width: 260px !important;
                    max-width: 300px !important;
                  }
                }
                
                /* Tablet styles - smaller tablets */
                @media (max-width: 768px) {
                  .custom-popup .leaflet-popup-content {
                    padding: 16px !important;
                    min-width: 240px !important;
                    max-width: 280px !important;
                  }
                  
                  .leaflet-popup-content-wrapper {
                    max-width: 300px !important;
                  }
                  
                  .leaflet-popup {
                    margin-bottom: 40px !important;
                  }
                  
                  /* Adjust map height for tablets */
                  .map-container {
                    height: 400px !important;
                  }
                }
                
                /* Mobile landscape */
                @media (max-width: 640px) and (orientation: landscape) {
                  .custom-popup .leaflet-popup-content {
                    padding: 12px !important;
                    min-width: 200px !important;
                    max-width: 240px !important;
                  }
                  
                  .leaflet-popup {
                    margin-bottom: 20px !important;
                  }
                }
                
                /* Mobile portrait */
                @media (max-width: 640px) {
                  .custom-popup .leaflet-popup-content {
                    padding: 14px !important;
                    min-width: 220px !important;
                    max-width: 260px !important;
                  }
                  
                  .leaflet-popup-content-wrapper {
                    max-width: 280px !important;
                  }
                  
                  .leaflet-popup {
                    margin-bottom: 35px !important;
                  }
                  
                  /* Reduce map height on mobile */
                  .map-container {
                    height: 350px !important;
                  }
                  
                  /* Make buttons stack better on mobile */
                  .popup-buttons {
                    gap: 8px !important;
                  }
                }
                
                /* Small mobile styles */
                @media (max-width: 480px) {
                  .custom-popup .leaflet-popup-content {
                    padding: 12px !important;
                    min-width: 200px !important;
                    max-width: 240px !important;
                  }
                  
                  .leaflet-popup-content-wrapper {
                    max-width: 260px !important;
                  }
                  
                  .leaflet-popup {
                    margin-bottom: 30px !important;
                  }
                  
                  .map-container {
                    height: 300px !important;
                  }
                }
                
                /* Extra small mobile styles */
                @media (max-width: 360px) {
                  .custom-popup .leaflet-popup-content {
                    padding: 10px !important;
                    min-width: 180px !important;
                    max-width: 220px !important;
                  }
                  
                  .leaflet-popup-content-wrapper {
                    max-width: 240px !important;
                  }
                  
                  .leaflet-popup {
                    margin-bottom: 25px !important;
                  }
                  
                  .map-container {
                    height: 280px !important;
                  }
                }
                
                /* Very small screens */
                @media (max-width: 320px) {
                  .custom-popup .leaflet-popup-content {
                    padding: 8px !important;
                    min-width: 160px !important;
                    max-width: 200px !important;
                  }
                  
                  .leaflet-popup-content-wrapper {
                    max-width: 220px !important;
                  }
                }
                
                /* High DPI displays */
                @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                  .custom-popup .leaflet-popup-content-wrapper {
                    border: 0.5px solid rgba(0, 0, 0, 0.1) !important;
                  }
                }
                
                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                  .custom-popup .leaflet-popup-content-wrapper {
                    background: #1f2937 !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                  }
                  
                  .custom-popup .leaflet-popup-tip {
                    background: #1f2937 !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                  }
                  
                  .custom-popup .leaflet-popup-close-button {
                    color: #d1d5db !important;
                    background: rgba(31, 41, 55, 0.9) !important;
                  }
                }
              `}</style>
              
              <MapContainer
                center={mapCenter}
                zoom={13}
                className="map-container"
                style={{ 
                  height: "450px", 
                  width: "100%", 
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              >
                <DynamicMapCenter center={mapCenter} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                />
                
                {currentLocation && (
                  <Marker 
                    position={[currentLocation.lat, currentLocation.lon]}
                    icon={getUserLocationIcon()}
                  >
                    <Popup 
                      maxWidth={200}
                      className="user-location-popup"
                    >
                      <div className="text-center py-2">
                        <LocationOn className="text-blue-600 mb-2" fontSize="small" />
                        <div className="text-sm font-medium text-gray-800">You are here</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {geoLocations.map((space, index) => (
                  <Marker 
                    key={index} 
                    position={[space.latitude, space.longitude]}
                    icon={getMarkerIcon(space.totalSlots)}
                  >
                    <Popup 
                      maxWidth={320}
                      minWidth={200}
                      className="custom-popup"
                    >
                      <div className="popup-content">
                        {/* Header Section */}
                        <div className="mb-4">
                          <div className="flex flex-col gap-2">
                            <h3 className="font-bold text-lg text-gray-800 leading-tight">
                              {space.lotName}
                            </h3>
                            <div className="flex items-center justify-between">
                              <Chip 
                                size="small" 
                                label={`${space.totalSlots || 0} available`}
                                color={getAvailabilityColor(space.totalSlots)}
                                style={{ 
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              />
                              {space.pricePerHour && (
                                <span className="text-sm font-semibold text-blue-600">
                                  ₹{space.pricePerHour}/hr
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Address Section */}
                        <div className="mb-4">
                          <p className="text-gray-600 text-sm leading-relaxed flex items-start">
                            <LocationOn className="text-gray-400 mr-1 mt-0.5 flex-shrink-0" fontSize="small" />
                            <span>{space.address}</span>
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 popup-buttons">
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            startIcon={<LocalParking fontSize="small" />}
                            onClick={() => handleChooseSlot(space)}
                            disabled={!space.totalSlots || space.totalSlots === 0}
                            sx={{
                              backgroundColor: space.totalSlots > 0 ? '#2563eb' : '#9ca3af',
                              '&:hover': { 
                                backgroundColor: space.totalSlots > 0 ? '#1d4ed8' : '#9ca3af' 
                              },
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              fontWeight: '600',
                              padding: { xs: '6px 12px', sm: '8px 16px' },
                              textTransform: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              minHeight: { xs: '32px', sm: '36px' }
                            }}
                          >
                            {space.totalSlots > 0 ? 'Choose Slot' : 'No Slots'}
                          </Button>
                          
                          {space.totalSlots > 0 && (
                            <Button
                              variant="outlined"
                              size="small"
                              fullWidth
                              startIcon={<DirectionsCar fontSize="small" />}
                              onClick={() => handleChooseRandom(space)}
                              sx={{
                                borderColor: '#16a34a',
                                color: '#16a34a',
                                '&:hover': { 
                                  backgroundColor: '#f0fdf4',
                                  borderColor: '#15803d'
                                },
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                fontWeight: '600',
                                padding: { xs: '6px 12px', sm: '8px 16px' },
                                textTransform: 'none',
                                borderRadius: '8px',
                                borderWidth: '1.5px',
                                minHeight: { xs: '32px', sm: '36px' }
                              }}
                            >
                              Quick Book
                            </Button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Parking Spaces Section */}
        <div className="">
          <div className="text-center mb-6 sm:mb-8 px-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Available Parking Spaces
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Choose from {parkingSpaces.length} parking locations near you
            </p>
          </div>

          {parkingSpaces.length === 0 && !loading ? (
            <div className="text-center py-8 sm:py-12">
              <LocalParking className="text-gray-400 text-4xl sm:text-6xl mb-4" />
              <h3 className="text-lg sm:text-xl text-gray-600 mb-2">No parking spaces found</h3>
              <p className="text-gray-500">Try searching in a different area</p>
            </div>
          ) : (
           <div className="flex justify-center px-4">
  {parkingSpaces.length === 1 ? (
    // Single item - use flex to center it
    <div className="flex justify-center w-full">
      {parkingSpaces.map((spot, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-gray-100 w-full max-w-sm"
        >
           <div className="relative">
          <img
            src={spot.image || "/parkingspace.jpeg"}
            alt={spot.lotName}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3">
            <Chip
              label={getAvailabilityText(spot.totalSlots)}
              color={getAvailabilityColor(spot.totalSlots)}
              size="small"
              className="bg-white/90 backdrop-blur-sm"
            />
          </div>
        </div>
        
        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {spot.lotName}
            </h3>
            <p className="text-gray-600 text-sm flex items-start">
              <LocationOn className="text-gray-400 mr-1 mt-0.5" fontSize="small" />
              {spot.address}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Available Slots</span>
              <span className="font-bold text-lg text-green-600">
                {spot.totalSlots || 0}
              </span>
            </div>
            {spot.pricePerHour && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price/Hour</span>
                <span className="font-semibold text-blue-600">
                  ₹{spot.pricePerHour}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <a
              href={spot.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
            >
              📍 View on Map
            </a>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<Payment />}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
              onClick={() => handleChooseSlot(spot)}
              disabled={!spot.totalSlots || spot.totalSlots === 0}
            >
              {spot.totalSlots > 0 ? 'Book Slot' : 'Full'}
            </Button>
          </div>
        </div>
        </div>
      ))}
    </div>
  ) : (
    // Multiple items - use grid
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 max-w-8xl w-full justify-items-center">
      {parkingSpaces.map((spot, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-gray-100 w-full max-w-sm"
        >
          {/* Same card content as above */}
        </div>
      ))}
    </div>
  )}
</div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ParkingModal
        spot={selectedSpot}
        open={showModal}
        onClose={handleCloseModal}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        onBook={(slotNumber) => confirmBooking(selectedSpot, slotNumber)}
      />
      
      {selectedSlot && (
        <ConfirmBookingModal
          spot={selectedSpot}
          open={showConfirmationModal}
          onClose={handleCloseConfirmModal}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          startPayment={startPayment}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          🎉 Slot booked successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ParkingNearMe;