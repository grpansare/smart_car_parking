import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { 
  Box, 
  Button, 
  Modal, 
  Typography, 
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const ViewOnMapModal = ({ parking_spot, open, onClose }) => {
  const [parkingLocation, setParkingLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!parking_spot?.address || !open) return;
    
    const fetchParkingCoordinates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(parking_spot.address)}`
        );
        
        if (response.data.length > 0) {
          setParkingLocation({
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon),
          });
        } else {
          setError("Location not found for the given address");
        }
      } catch (error) {
        console.error("Error fetching parking coordinates:", error);
        setError("Failed to fetch location. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingCoordinates();
  }, [parking_spot?.address, open]);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '95vw' : isTablet ? '85vw' : 700,
    maxWidth: 800,
    maxHeight: isMobile ? '90vh' : '85vh',
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const mapHeight = isMobile ? '300px' : isTablet ? '400px' : '450px';

  return (
    <Modal 
      open={open} 
      onClose={onClose}
      aria-labelledby="map-modal-title"
      closeAfterTransition
    >
      <Box sx={modalStyle}>
        {/* Header */}
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
            color: 'white',
            p: { xs: 2, sm: 3 },
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography
            id="map-modal-title"
            variant={isMobile ? "h6" : "h5"}
            component="h2"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              pr: { xs: 4, sm: 0 },
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            }}
          >
            {parking_spot?.lotName || 'Parking Location'}
          </Typography>
          
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
            }}
          >
            <CloseIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Box>

        {/* Address Display */}
        {parking_spot?.address && (
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: 'grey.50' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                textAlign: 'center',
              }}
            >
              📍 {parking_spot.address}
            </Typography>
          </Box>
        )}

        {/* Map Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {loading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: mapHeight,
                gap: 2,
              }}
            >
              <CircularProgress size={40} color="primary" />
              <Typography variant="body2" color="text.secondary">
                Loading map location...
              </Typography>
            </Box>
          )}

          {error && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: mapHeight,
                gap: 2,
                bgcolor: 'error.light',
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography variant="body1" color="error.main" textAlign="center">
                ❌ {error}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Box>
          )}

          {parkingLocation && !loading && !error && (
            <Box
              sx={{
                height: mapHeight,
                borderRadius: 2,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: 'grey.200',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <MapContainer
                center={parkingLocation}
                zoom={isMobile ? 13 : 15}
                style={{ height: "100%", width: "100%" }}
                key={`${parkingLocation.lat}-${parkingLocation.lng}`}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <Marker position={parkingLocation}>
                  <Popup>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        🅿️ {parking_spot?.lotName || 'Parking Location'}
                      </Typography>
                      {parking_spot?.address && (
                        <Typography variant="caption" display="block" mt={0.5}>
                          {parking_spot.address}
                        </Typography>
                      )}
                    </Box>
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>
          )}
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderTop: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'grey.50',
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            sx={{
              minWidth: { xs: 80, sm: 100 },
              fontWeight: 500,
            }}
          >
            Close
          </Button>
          
          {parkingLocation && (
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              sx={{
                minWidth: { xs: 120, sm: 140 },
                fontWeight: 500,
                background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                },
              }}
              onClick={() => {
                const url = `https://www.google.com/maps?q=${parkingLocation.lat},${parkingLocation.lng}`;
                window.open(url, '_blank');
              }}
            >
              Open in Google Maps
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewOnMapModal;