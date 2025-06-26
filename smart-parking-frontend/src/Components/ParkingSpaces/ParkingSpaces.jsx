import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchBox from "../Hero/SearchBox";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { ParkingModal } from "../ParkingModal/ParkingModal";
import {
  Alert,
  Button,
  Snackbar,
  CircularProgress,
  Backdrop,
  Chip,
} from "@mui/material";
import { ConfirmBookingModal } from "../ParkingModal/ConfirmBookingModal";
import { useSelector } from "react-redux";
import { cancelBooking } from "../../Utils/BookingFunctions";

import { AlertCircle, MapPin, Clock } from "lucide-react";
import { LocationOn, Payment } from "@mui/icons-material";
import { LoadingComponent, MapLoadingComponent } from "./LoadingComponent";
import Mapcomponent from "./MapComponent";
import AvailableSpaces from "./AvailableSpaces";
import api from "../../api/axios"; // Your configured axios instance
import axios from "axios";

// Constants
const PUNE_COORDS = [18.5204, 73.8567];
const RAZORPAY_KEY = "rzp_test_5wU1xQg8xAioM6";

const ParkingSpaces = () => {
  const { searchedPlace } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // State management
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [mapCenter, setMapCenter] = useState(PUNE_COORDS);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [geoLocations, setGeoLocations] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setConfirmationModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState();
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Helper function to show snackbar messages
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  // Error handling wrapper
  const handleAsyncError = useCallback(
    (error, fallbackMessage) => {
      console.error(fallbackMessage, error);
      const errorMessage =
        error?.response?.data?.message || error?.message || fallbackMessage;
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    },
    [showSnackbar]
  );

  // Clear booking function
  const clearBookingState = useCallback(async () => {
    if (selectedSlot && selectedSpot) {
      try {
        await cancelBooking(selectedSlot, selectedSpot);
        console.log("Booking cancelled successfully");
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    }
    setSelectedSlot(null);
    setSelectedSpot(null);
    setConfirmationModal(false);
    setBookingConfirmed(false);
    // Refresh parking spaces to update availability
    await getParkingSpaces();
  }, [selectedSlot, selectedSpot]);

  // Modal handlers
  const handleMarkerClick = useCallback((spot) => {
    console.log("Clicked Spot:", spot);
    setSelectedSpot(spot);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleCloseConfirmModal = useCallback(async () => {
    await clearBookingState();
  }, [clearBookingState]);

  const handleChooseSlot = useCallback(
    (space) => {
      handleMarkerClick(space);
    },
    [handleMarkerClick]
  );

  const handleChooseRandom = useCallback(async (space) => {
    setSelectedSpot(space);
    await confirmBooking(space);
  }, []);

  // API Functions using the configured axios instance
  const getParkingSpaces = useCallback(async () => {
    if (!searchedPlace) return;

    setLoading(true);
    setError(null);

    try {
      // No need to manually handle tokens - your axios interceptor handles this
      const response = await api.get(`/parkingspaces/${searchedPlace}`);
      
      setParkingSpaces(response.data || []);

      if (response.data?.length === 0) {
        showSnackbar("No parking spaces found for this location", "info");
      }
    } catch (error) {
      handleAsyncError(error, "Error fetching parking spaces");
      setParkingSpaces([]);
    } finally {
      setLoading(false);
    }
  }, [searchedPlace, handleAsyncError, showSnackbar]);

  const fetchGeoLocations = useCallback(async () => {
    if (parkingSpaces.length === 0) return;

    setMapLoading(true);

    try {
      const locations = await Promise.allSettled(
        parkingSpaces.map(async (space) => {
          try {
            // For external APIs like Nominatim, we can still use axios directly
            // since it doesn't need authentication
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/search`,
              {
                params: {
                  q: space.address,
                  format: "json",
                  limit: 1,
                },
                timeout: 10000,
              }
            );

            if (response.data?.length > 0) {
              const location = response.data[0];
              return {
                lotName: space.lotName,
                spaceId: space.id,
                address: space.address,
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon),
                numberOfFloors: space.numberOfFloors,
                parkingSlot: space.parkingSlot || [],
                totalSlots: space.totalSlots,
                pricingPerHour: space.pricingPerHour,
              };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to geocode address: ${space.address}`, error);
            return null;
          }
        })
      );

      const validLocations = locations
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      setGeoLocations(validLocations);

      if (validLocations.length > 0) {
        setMapCenter([validLocations[0].latitude, validLocations[0].longitude]);
      }
    } catch (error) {
      handleAsyncError(error, "Error processing location data");
    } finally {
      setMapLoading(false);
    }
  }, [parkingSpaces, handleAsyncError]);

  const confirmBooking = useCallback(
    async (selected, slotNumber = null) => {
      console.log(selected.id, "selected spot");
      const spaceId = selected.spaceId || selected.id;
      if (!spaceId) {
        showSnackbar("No parking spot selected", "error");
        return;
      }

      if (!currentUser) {
        showSnackbar("Please login to book parking", "error");
        navigate("/login");
        return;
      }

      try {
        // Using configured axios instance - token handling is automatic
        const response = await api.put(
          `/parkingspaces/bookparking`,
          { spaceId: spaceId },
          {
            params: slotNumber ? { slotNumber } : {},
          }
        );

        if (response.data) {
          console.log("Booking successful, opening confirmation modal...");
          setSelectedSlot(response.data);
          setConfirmationModal(true);
          showSnackbar("Parking slot reserved successfully!", "success");
        }

        handleCloseModal();
      } catch (error) {
        handleAsyncError(error, "Booking failed. Please try again.");
      }
    },
    [currentUser, navigate, handleAsyncError, showSnackbar, handleCloseModal]
  );

  const startPayment = useCallback(
    async (paymentData, bookingData) => {
      if (!selectedSpot || !selectedSlot || !currentUser) {
        showSnackbar("Missing required booking information", "error");
        return;
      }

      console.log("Starting payment process");

      try {
        console.log("Sending request to create order");
        const response = await api.post(`/api/payment/create-order`, paymentData);

        const order = response.data;

        const options = {
          key: RAZORPAY_KEY,
          amount: order.amount,
          currency: order.currency,
          name: "ParkEase",
          description: "Parking Space Booking Payment",
          order_id: order.id,
          handler: async function (response) {
            if (bookingConfirmed) return;

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
              status: "COMPLETED",
            };

            try {
              await api.post(`/api/payment/store`, paymentDetails);

              const bookingResponse = await api.post(
                `/api/bookings/${selectedSlot}`,
                bookingData
              );

              setBookingConfirmed(true);
              showSnackbar(
                "Payment successful! Redirecting to receipt...",
                "success"
              );
              console.log(bookingResponse.data.id);

              navigate(`/dashboard/reciept/${bookingResponse.data.id}`);
              getParkingSpaces();
              setConfirmationModal(false);
            } catch (error) {
              handleAsyncError(
                error,
                "Payment succeeded but failed to store booking details"
              );
              console.log(error);
            }
          },
          modal: {
            ondismiss: async function () {
              console.log("Payment modal dismissed, cancelling booking...");
              try {
                await clearBookingState();
                showSnackbar(
                  "Payment cancelled. Booking has been released.",
                  "info"
                );
              } catch (error) {
                console.error("Error during payment cancellation:", error);
                showSnackbar("Payment cancelled", "info");
              }
            },
          },
          prefill: {
            name: currentUser?.fullname || "Your Name",
            email: currentUser?.email || "youremail@example.com",
            contact: currentUser?.phone || "9999999999",
          },
          notes: {
            address: selectedSpot?.address || "Parking booking",
          },
          theme: {
            color: "#2563eb",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } catch (error) {
        handleAsyncError(error, "Failed to create payment order");
      }
    },
    [
      selectedSpot,
      selectedSlot,
      currentUser,
      bookingConfirmed,
      handleAsyncError,
      showSnackbar,
      navigate,
      getParkingSpaces,
      clearBookingState,
    ]
  );

  // Fix for default Leaflet marker icons
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // Add custom CSS for markers
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-marker {
        background: none !important;
        border: none !important;
      }
      
      .custom-marker-selected {
        background: none !important;
        border: none !important;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .leaflet-popup-tip {
        background: white;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Marker icon generators
  const getMarkerIcon = useCallback((totalSlots) => {
    try {
      const color = totalSlots > 0 ? "#10b981" : "#ef4444";

      const svgIcon = `
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 10.9 12.5 28.5 12.5 28.5S25 23.4 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="7" fill="white"/>
          <text x="12.5" y="17" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">${totalSlots}</text>
        </svg>
      `;

      return new L.DivIcon({
        html: svgIcon,
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
        popupAnchor: [0, -41],
        className: "custom-marker",
      });
    } catch (error) {
      console.warn("Using default marker icon");
      return new L.Icon.Default();
    }
  }, []);

  const getSelectedMarkerIcon = useCallback(() => {
    try {
      const svgIcon = `
        <svg width="30" height="46" viewBox="0 0 30 46" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0C6.7 0 0 6.7 0 15c0 13.1 15 31 15 31s15-17.9 15-31C30 6.7 23.3 0 15 0z" fill="#2563eb"/>
          <circle cx="15" cy="15" r="8" fill="white"/>
          <circle cx="15" cy="15" r="4" fill="#2563eb"/>
        </svg>
      `;

      return new L.DivIcon({
        html: svgIcon,
        iconSize: [30, 46],
        iconAnchor: [15, 46],
        popupAnchor: [0, -46],
        className: "custom-marker-selected",
      });
    } catch (error) {
      return new L.Icon.Default();
    }
  }, []);

  // Enhanced No Parking Component
  const NoParkingComponent = () => (
    <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center transform transition-all hover:scale-105">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-red-100 to-orange-100 p-4 rounded-full shadow-md">
            <AlertCircle className="text-red-500 w-12 h-12" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          No Parking Available
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We're sorry, but there are currently no parking spaces available in{" "}
          <span className="font-semibold text-blue-600">{searchedPlace}</span>.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1"
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>

          {showDetails && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg text-left border border-gray-200 transform transition-all duration-300">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Why is parking unavailable?
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>All spaces are currently occupied</li>
                <li>Peak hours are between 9am-5pm</li>
                <li>Next available spot estimated in 30 minutes</li>
                <li>High demand in this area during business hours</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-sm bg-white px-4 py-2 rounded-full shadow-sm">
        <Clock className="w-4 h-4 inline mr-1" />
        Last updated: Just now
      </div>
    </div>
  );

  // Effects
  useEffect(() => {
    if (searchedPlace) {
      getParkingSpaces();
    }
  }, [searchedPlace, getParkingSpaces]);

  useEffect(() => {
    if (parkingSpaces.length > 0) {
      fetchGeoLocations();
    }
  }, [parkingSpaces, fetchGeoLocations]);

  // Memoized map component
  const MapComponent = useMemo(() => {
    if (mapLoading) {
      return <MapLoadingComponent />;
    }

    if (geoLocations.length === 0) return null;

    return (
      <Mapcomponent
        geoLocations={geoLocations}
        getMarkerIcon={getMarkerIcon}
        handleChooseRandom={handleChooseRandom}
        handleChooseSlot={handleChooseSlot}
      />
    );
  }, [
    geoLocations,
    mapCenter,
    mapLoading,
    getMarkerIcon,
    handleChooseSlot,
    handleChooseRandom,
  ]);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="">
        <SearchBox searchPlace={searchedPlace} />
      </div>

      {/* Loading Backdrop */}
      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="primary" size={60} />
      </Backdrop>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <LoadingComponent />
        ) : parkingSpaces.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Available Parking Spaces
              </h1>
              <p className="text-gray-600">
                Found {parkingSpaces.length} parking locations in{" "}
                {searchedPlace}
              </p>
            </div>
            {MapComponent}
          </div>
        ) : (
          <NoParkingComponent />
        )}
      </div>
      
      <AvailableSpaces
        parkingSpaces={parkingSpaces}
        handleChooseSlot={handleChooseSlot}
        handleChooseRandom={handleChooseRandom}
      />

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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ParkingSpaces;