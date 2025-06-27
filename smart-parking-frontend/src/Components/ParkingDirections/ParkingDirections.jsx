import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Box, Button, Modal, CircularProgress, Alert } from "@mui/material";
import Cookies from "js-cookie";
import api from "../../api/axios";

const ParkingDirections = ({ PARKING_ADDRESS, open, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [parkingLocation, setParkingLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
 let token = Cookies.get("jwt") || localStorage.getItem("token");
    console.log(token);
  // OpenRouteService API Key - Consider moving to environment variables
  const ORS_API_KEY = "5b3ce3597851110001cf62485009d6189dfe4865b7a422b0ab77ba50";

  useEffect(() => {
    if (!PARKING_ADDRESS) return;

    // Convert Parking Address to Lat/Lng
    const fetchParkingCoordinates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            PARKING_ADDRESS
          )}&limit=1`
        );
        
        if (response.data.length > 0) {
          const coords = {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon),
          };
          setParkingLocation(coords);
          console.log("Parking coordinates found:", coords);
        } else {
          setError("Parking location not found. Please check the address.");
          console.error("No location found for the address:", PARKING_ADDRESS);
        }
      } catch (error) {
        console.error("Error fetching parking coordinates:", error);
        setError("Failed to find parking location. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingCoordinates();
  }, [PARKING_ADDRESS]);

  useEffect(() => {
    if (!open) return; // Only get location when modal is open

    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("User location fetched:", coords);
          setUserLocation(coords);
          setLocationError(null);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to get your location. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          
          setLocationError(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, [open]);

  useEffect(() => {
    if (userLocation && parkingLocation && open) {
      fetchRoute();
    }
  }, [userLocation, parkingLocation, open]);

  // Alternative routing using OSRM (Open Source Routing Machine)
  const fetchRouteWithOSRM = async () => {
    if (!userLocation || !parkingLocation) return;

    console.log("Fetching route from:", userLocation, "to:", parkingLocation);
    
    try {
      setLoading(true);
      setError(null);

      // Using OSRM demo server (free, no API key required, but has usage limits)
  const response = await api.get("/api/directions", {
  params: {
    startLat: 18.5204,
    startLng: 73.8567,
    endLat: 18.5362,
    endLng: 73.8911
  },
 
});



      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        // Extract coordinates from the route geometry
        const coordinates = route.geometry.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        setRoute(coordinates);

        // Get route information
        setEta(Math.round(route.duration / 60)); // Convert to minutes
        setDistance((route.distance / 1000).toFixed(1)); // Convert to km

        console.log("Route fetched successfully", route);
      } else {
        setError("No route found between the locations.");
        console.error("No route found in response");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      
      // Fallback to simple straight line if routing fails
      setRoute([
        { lat: userLocation.lat, lng: userLocation.lng },
        { lat: parkingLocation.lat, lng: parkingLocation.lng }
      ]);
      
      // Calculate approximate straight-line distance
      const straightLineDistance = calculateStraightLineDistance(
        userLocation.lat, userLocation.lng,
        parkingLocation.lat, parkingLocation.lng
      );
      
      setDistance(straightLineDistance.toFixed(1));
      setEta(Math.round(straightLineDistance * 2)); // Rough estimate: 2 minutes per km
      
      setError("Using approximate route. Actual directions may vary.");
    } finally {
      setLoading(false);
    }
  };

  // Original OpenRouteService function (will cause CORS in browser)
  const fetchRoute = async () => {
    if (!userLocation || !parkingLocation) return;

    console.log("Fetching route from:", userLocation, "to:", parkingLocation);
    
    try {
      setLoading(true);
      setError(null);

      // Try OpenRouteService first (will likely fail due to CORS)
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${userLocation.lng},${userLocation.lat}&end=${parkingLocation.lng},${parkingLocation.lat}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.data.features && response.data.features.length > 0) {
        const route = response.data.features[0];
        
        // Extract coordinates from GeoJSON
        const coordinates = route.geometry.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        setRoute(coordinates);

        // Get route information from properties
        if (route.properties && route.properties.summary) {
          setEta(Math.round(route.properties.summary.duration / 60)); // Convert to minutes
          setDistance((route.properties.summary.distance / 1000).toFixed(1)); // Convert to km
        }

        console.log("Route fetched successfully", route);
      } else {
        setError("No route found between the locations.");
        console.error("No route found in response");
      }
    } catch (error) {
      console.error("OpenRouteService failed, trying OSRM:", error);
      
      // Fallback to OSRM if OpenRouteService fails (due to CORS)
      try {
        await fetchRouteWithOSRM();
      } catch (osrmError) {
        console.error("OSRM also failed:", osrmError);
        
        // Final fallback: straight line
        setRoute([
          { lat: userLocation.lat, lng: userLocation.lng },
          { lat: parkingLocation.lat, lng: parkingLocation.lng }
        ]);
        
        const straightLineDistance = calculateStraightLineDistance(
          userLocation.lat, userLocation.lng,
          parkingLocation.lat, parkingLocation.lng
        );
        
        setDistance(straightLineDistance.toFixed(1));
        setEta(Math.round(straightLineDistance * 2));
        
        setError("Showing approximate straight-line route. For detailed directions, please use a dedicated navigation app.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function to calculate straight-line distance
  const calculateStraightLineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRetry = () => {
    setError(null);
    setLocationError(null);
    
    if (userLocation && parkingLocation) {
      fetchRoute();
    } else if (!userLocation) {
      // Retry getting user location
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          setLocationError("Unable to get your location. Please try again.");
          setLoading(false);
        }
      );
    }
  };

  const openInGoogleMaps = () => {
    if (userLocation && parkingLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${parkingLocation.lat},${parkingLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: "90%", sm: 650 },
          maxWidth: "90vw",
          maxHeight: "85vh",
          p: 3,
          bgcolor: "background.paper",
          margin: "auto",
          mt: { xs: 5, sm: 8 },
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          boxShadow: 24,
          overflow: "hidden",
        }}
      >
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🚗 Directions to Parking
          </h1>
          {eta && distance && (
            <div className="flex justify-center space-x-4 text-sm text-gray-600">
              <span className="bg-blue-100 px-3 py-1 rounded-full">
                📍 {distance} km
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full">
                ⏱️ {eta} mins
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 mb-4" style={{ minHeight: "400px" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <CircularProgress size={48} className="mb-4" />
              <p className="text-gray-600">
                {userLocation ? "Getting directions..." : "Getting your location..."}
              </p>
            </div>
          ) : error || locationError ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <Alert severity="error" className="mb-4 w-full">
                {error || locationError}
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  onClick={handleRetry}
                  className="mt-2"
                >
                  Try Again
                </Button>
                {userLocation && parkingLocation && (
                  <Button
                    variant="outlined"
                    onClick={openInGoogleMaps}
                    className="mt-2"
                  >
                    Open in Google Maps
                  </Button>
                )}
              </div>
            </div>
          ) : userLocation && parkingLocation ? (
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: "100%", width: "100%", borderRadius: "12px" }}
              key={`${userLocation.lat}-${userLocation.lng}-${parkingLocation.lat}-${parkingLocation.lng}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User's Location Marker */}
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center">
                    <strong className="text-blue-600">📍 Your Location</strong>
                    <br />
                    <span className="text-sm text-gray-600">Starting point</span>
                  </div>
                </Popup>
              </Marker>

              {/* Parking Location Marker */}
              <Marker position={parkingLocation}>
                <Popup>
                  <div className="text-center">
                    <strong className="text-green-600">🅿️ Parking Location</strong>
                    <br />
                    <span className="text-sm text-gray-600">{PARKING_ADDRESS}</span>
                    {eta && distance && (
                      <div className="mt-2 text-xs">
                        <div>Distance: {distance} km</div>
                        <div>ETA: {eta} minutes</div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Route Polyline */}
              {route.length > 0 && (
                <Polyline 
                  positions={route} 
                  color="#2563eb" 
                  weight={5}
                  opacity={0.7}
                />
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Preparing map...</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <div className="text-sm text-gray-500">
            {PARKING_ADDRESS && (
              <span className="truncate max-w-xs">📍 {PARKING_ADDRESS}</span>
            )}
          </div>
          <div className="flex gap-2">
            {userLocation && parkingLocation && (
              <Button 
                onClick={openInGoogleMaps} 
                variant="outlined" 
                size="small"
              >
                Google Maps
              </Button>
            )}
            <Button 
              onClick={onClose} 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default ParkingDirections;