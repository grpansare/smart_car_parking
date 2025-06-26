import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { 
  CircularProgress, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Box, 
  Typography,
  Fade,
  Slide,
  IconButton,
  Tooltip
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CloseIcon from "@mui/icons-material/Close";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

const DynamicMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
};

const AddressField = ({handleChange, formData, errors, setFormData}) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([19.076, 72.8777]); // Default to Mumbai

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Failed to get user location:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      setMapLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { Accept: "application/json" } }
      );
      const data = await response.json();
      const address = data?.display_name || "Address not found. Try again.";
      setFormData({ ...formData, address });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setMapLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        await fetchAddressFromCoords(latitude, longitude);
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED)
          errorMessage = "Permission denied. Please allow location access.";
        else if (error.code === error.TIMEOUT)
          errorMessage = "Location request timed out. Try again.";
        else if (error.code === error.POSITION_UNAVAILABLE)
          errorMessage = "Location information is unavailable.";

        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapClick = async (latlng) => {
    setSelectedPosition(latlng);
    await fetchAddressFromCoords(latlng.lat, latlng.lng);
    setOpenMap(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Address Input Section */}
      <Box sx={{ mb: 2 }}>
        <TextField
          id="outlined-basic"
          label="Address"
          variant="outlined"
          fullWidth
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
          multiline
          rows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              '&.Mui-focused': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <LocationOnIcon sx={{ color: '#666', mr: 1, mt: 1, alignSelf: 'flex-start' }} />
            ),
          }}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
      }}>
        <Tooltip title="Use your current location" arrow>
          <Button
            variant="contained"
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation}
            startIcon={loadingLocation ? <CircularProgress size={20} /> : <MyLocationIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #4caf50, #45a049)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049, #3d8b40)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loadingLocation ? "Getting Location..." : "Current Location"}
          </Button>
        </Tooltip>

        <Tooltip title="Choose location on map" arrow>
          <Button 
            variant="outlined" 
            onClick={() => setOpenMap(true)}
            startIcon={<MapIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: '#667eea',
              color: '#667eea',
              borderWidth: 2,
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Select on Map
          </Button>
        </Tooltip>
      </Box>

      {/* Map Dialog */}
      <Dialog 
        open={openMap} 
        onClose={() => setOpenMap(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MapIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Select Location on Map
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setOpenMap(false)}
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, height: "500px", position: 'relative' }}>
          {mapLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress size={50} sx={{ color: '#667eea' }} />
              <Typography variant="body1" color="textSecondary">
                Loading address...
              </Typography>
            </Box>
          ) : (
            <Fade in={!mapLoading} timeout={500}>
              <Box sx={{ height: '100%', width: '100%' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <DynamicMapCenter center={mapCenter} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                  />
                  <LocationSelector onSelect={handleMapClick} />
                  {selectedPosition && <Marker position={selectedPosition} />} 
                </MapContainer>
                
                {/* Map Instructions Overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  zIndex: 1000,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <Typography variant="body2" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: '#666',
                    fontWeight: 500
                  }}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 20, color: '#667eea' }} />
                    Click anywhere on the map to select your location
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AddressField;