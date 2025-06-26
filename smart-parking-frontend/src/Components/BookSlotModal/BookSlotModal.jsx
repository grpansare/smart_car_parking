import { Modal, Box, Button, Typography, Divider, useTheme, useMediaQuery, Chip } from "@mui/material";
import { useState } from "react";
import DateTimePickerComponent from "../DateTimePicker/DateTImePicker";
import Cookies from "js-cookie";
import axios from "axios";
import { Lock, MapPin, Clock, IndianRupee, Calendar, Car } from "lucide-react";

export const BookSlotModal = ({
  spot,
  selectedSlot,
  setSelectedSlot,
  open,
  onClose,
  onBook,
  handleBookingRandom
}) => {
  const [autoSelect, setAutoSelect] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [confirmationModal, setConfirmationModal] = useState(false);

  const handleClose = () => {
    onClose();
    setSelectedSlot(null);
  };

  const handleSlotClick = (slotId) => {
    setSelectedSlot(slotId);
  };

  const handleRandom = async () => {
   handleBookingRandom(spot)
  };

  // const confirmBooking = async (selected, slotNumber = null) => {
  //   if (!selected) {
  //     console.log("No spot selected or invalid spot");
  //     return;
  //   }

  //   const token = Cookies.get("jwt") || localStorage.getItem("token");

  //   try {
  //     const response = await axios.put(
  //       `http://localhost:8081/parkingspaces/bookparking`,
  //       { spaceId: selected.id },
  //       {
  //         params: slotNumber ? { slotNumber } : {},
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (response.data) {
  //       console.log("Booking successful");
  //       setSelectedSlot(response.data);
        
  //       setShowModal(false)
  //       setConfirmationModal(true);
  //     }
  //   } catch (error) {
  //     console.error("Error booking parking:", error);
  //   }
  // };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {
      xs: '95vw',
      sm: '90vw',
      md: 650,
      lg: 700
    },
    maxWidth: '95vw',
    maxHeight: '95vh',
    bgcolor: 'background.paper',
    borderRadius: { xs: 2, sm: 3 },
    boxShadow: 24,
    p: 0,
    outline: 'none',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    p: { xs: 2, sm: 3, md: 4 },
    pb: { xs: 1, sm: 2 },
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' },
  };

  const contentStyle = {
    p: { xs: 2, sm: 3, md: 4 },
    flexGrow: 1,
    overflow: 'auto',
  };

  const infoCardStyle = {
    p: { xs: 2, sm: 2.5 },
    mb: 3,
    bgcolor: 'grey.50',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'grey.200',
  };

  const infoItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 1,
    '&:last-child': { mb: 0 },
  };

  const slotButtonStyle = (slot) => ({
    width: { xs: 32, sm: 40, md: 44 },
    height: { xs: 32, sm: 40, md: 44 },
    minWidth: 'unset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    borderColor: slot.available 
      ? (selectedSlot === slot.slotId ? 'primary.main' : 'grey.300')
      : 'error.light',
    borderRadius: 1.5,
    cursor: slot.available ? 'pointer' : 'not-allowed',
    backgroundColor: slot.available
      ? (selectedSlot === slot.slotId ? 'primary.main' : 'background.paper')
      : 'grey.100',
    color: slot.available 
      ? (selectedSlot === slot.slotId ? 'primary.contrastText' : 'text.primary')
      : 'text.disabled',
    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
    '&:hover': slot.available ? {
      borderColor: 'primary.main',
      backgroundColor: selectedSlot === slot.slotId ? 'primary.dark' : 'primary.light',
      transform: 'scale(1.05)',
      boxShadow: 2,
    } : {},
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  });

  const floorContainerStyle = {
    mb: 3,
    p: { xs: 1.5, sm: 2 },
    bgcolor: 'background.default',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'grey.200',
  };

  const floorHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
    pb: 1,
    borderBottom: '1px solid',
    borderColor: 'grey.300',
  };

  const slotsGridStyle = {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(auto-fit, minmax(32px, 1fr))',
      sm: 'repeat(auto-fit, minmax(40px, 1fr))',
      md: 'repeat(auto-fit, minmax(44px, 1fr))'
    },
    gap: { xs: 1, sm: 1.5 },
    maxWidth: '100%',
  };

  const footerStyle = {
    p: { xs: 2, sm: 3, md: 4 },
    pt: { xs: 2, sm: 3 },
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    position: 'sticky',
    bottom: 0,
  };

  const availableSlots = spot?.parkingSlot?.filter(slot => slot.available).length || 0;
  const totalSlots = spot?.totalSlots || 0;

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      disableScrollLock
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1,
      }}
    >
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={headerStyle}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              fontWeight: 700,
              mb: 1,
            }}
          >
            {spot?.lotName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<Car size={16} />}
              label={`${availableSlots}/${totalSlots} Available`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'inherit',
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          </Box>
        </Box>

        {/* Content */}
        <Box sx={contentStyle}>
          {/* Info Card */}
          <Box sx={infoCardStyle}>
            <Box sx={infoItemStyle}>
              <MapPin size={18} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">
                {spot?.address}
              </Typography>
            </Box>
            <Box sx={infoItemStyle}>
              <IndianRupee size={18} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">
                ₹{spot?.pricingPerHour}/hour
              </Typography>
            </Box>
          </Box>

          {/* Date Time Picker */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Select Date & Time
            </Typography>
            <DateTimePickerComponent color="white" />
          </Box>

          {/* Slot Selection Options */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Slot Selection Options
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' } 
              }}
            >
              <Button
                variant={!autoSelect ? "contained" : "outlined"}
                color="primary"
                onClick={() => setAutoSelect(false)}
                startIcon={<Lock size={18} />}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Choose Specific Slot
              </Button>
              <Button
                variant={autoSelect ? "contained" : "outlined"}
                color="secondary"
                onClick={() => setAutoSelect(true)}
                startIcon={<Car size={18} />}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Auto-Assign Slot
              </Button>
            </Box>
          </Box>

          {/* Slot Selection Grid */}
          {!autoSelect && (
            <>
              <Divider sx={{ my: 3 }} />
              {totalSlots > 0 ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Available Slots
                  </Typography>
                  {Array.from({ length: spot?.numberOfFloors || 1 }).map((_, floorIndex) => {
                    const floorSlots = spot?.parkingSlot?.slice(
                      floorIndex * 30, 
                      (floorIndex + 1) * 30
                    ) || [];
                    
                    return (
                      <Box key={floorIndex} sx={floorContainerStyle}>
                        <Box sx={floorHeaderStyle}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700,
                              color: 'primary.main',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            Floor {floorIndex + 1}
                          </Typography>
                          <Chip 
                            label={`${floorSlots.filter(s => s.available).length} available`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                        <Box sx={slotsGridStyle}>
                          {floorSlots.map((slot) => (
                            <Button
                              key={slot.slotId}
                              onClick={() => slot.available && handleSlotClick(slot.slotId)}
                              disabled={!slot.available}
                              sx={slotButtonStyle(slot)}
                            >
                              {slot.slotId}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="error" gutterBottom>
                    No Slots Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please try selecting a different time or location.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Footer */}
        <Box sx={footerStyle}>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', sm: 'row' } 
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={!autoSelect && !selectedSlot}
              onClick={() => autoSelect ? handleRandom() : onBook(selectedSlot)}
              sx={{ 
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {autoSelect ? "Auto Book Slot" : "Book Selected Slot"}
            </Button>
            <Button 
              onClick={handleClose} 
              variant="outlined" 
              color="secondary"
              size="large"
              fullWidth
              sx={{ 
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};