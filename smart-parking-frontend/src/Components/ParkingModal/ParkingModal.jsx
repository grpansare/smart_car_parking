import { Modal, Box, Button, Typography, Chip, IconButton, Skeleton, Fade, Slide } from "@mui/material";
import { useState, useMemo, useCallback } from "react";
import { Close as CloseIcon, LocalParking, Schedule, LocationOn, AttachMoney } from "@mui/icons-material";
import DateTimePickerComponent from "../DateTimePicker/DateTImePicker";

export const ParkingModal = ({
  spot,
  selectedSlot,
  setSelectedSlot,
  open,
  onClose,
  onBook,
  loading = false
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Memoize slot calculations for better performance
  const slotStats = useMemo(() => {
    if (!spot?.parkingSlot) return { available: 0, total: 0, occupied: 0 };
    
    const available = spot.parkingSlot.filter(slot => slot.available).length;
    const total = spot.parkingSlot.length;
    const occupied = total - available;
    
    return { available, total, occupied };
  }, [spot?.parkingSlot]);

  const handleSlotClick = useCallback((slotId, isAvailable) => {
    if (isAvailable) {
      setSelectedSlot(prev => prev === slotId ? null : slotId);
    }
  }, [setSelectedSlot]);
  
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setSelectedSlot(null);
      setIsClosing(false);
    }, 200);
  }, [onClose, setSelectedSlot]);

  const handleBook = useCallback(() => {
    if (selectedSlot) {
      onBook(selectedSlot);
    }
  }, [selectedSlot, onBook]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 3 }} />
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 3 }} />
    </Box>
  );

  if (loading) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            width: { xs: '95%', sm: '90%', md: 700, lg: 800 },
            maxWidth: '95vw',
            maxHeight: { xs: '95vh', sm: '90vh', md: '85vh' },
            bgcolor: "white",
            margin: "auto",
            mt: { xs: 1, sm: 3, md: 6 },
            borderRadius: { xs: 2, md: 3 },
            boxShadow: 24,
          }}
        >
          <LoadingSkeleton />
        </Box>
      </Modal>
    );
  }

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      closeAfterTransition
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }
      }}
    >
      <Fade in={open && !isClosing} timeout={300}>
        <Box
          sx={{
            width: { xs: '95%', sm: '90%', md: 700, lg: 800 },
            maxWidth: '95vw',
            maxHeight: { xs: '95vh', sm: '90vh', md: '85vh' },
            bgcolor: "white",
            margin: "auto",
            mt: { xs: 1, sm: 3, md: 6 },
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: 2, md: 3 },
            boxShadow: 24,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: { xs: 8, sm: 16 },
                top: { xs: 8, sm: 16 },
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  fontWeight: 600,
                  pr: 5
                }}
              >
                {spot?.lotName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {spot?.address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                {/* <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} /> */}
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  ₹{spot?.pricingPerHour}/hour
                </Typography>
              </Box>
            </Box>

            {/* Stats Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${slotStats.available} Available`}
                size="small"
                sx={{ 
                  bgcolor: slotStats.available > 0 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  fontWeight: 500
                }}
              />
              <Chip 
                label={`${slotStats.occupied} Occupied`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>

          {/* Content */}
          <Box 
            sx={{ 
              flex: 1,
              overflow: 'auto',
              p: { xs: 2, sm: 3 },
              '&::-webkit-scrollbar': { width: 8 },
              '&::-webkit-scrollbar-track': { bgcolor: '#f1f5f9' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4 },
            }}
          >
            {/* DateTime Picker */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: '#64748b' }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, color: '#1e293b' }}>
                  Select Date & Time
                </Typography>
              </Box>
              <DateTimePickerComponent color="white" />
            </Box>

            {/* Parking Slots */}
            {spot?.totalSlots > 0 ? (
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.125rem' }, 
                    mb: 3,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <LocalParking sx={{ mr: 1, color: '#64748b' }} />
                  Choose Your Parking Slot
                  {selectedSlot && (
                    <Chip 
                      label={`Slot ${selectedSlot} Selected`}
                      color="primary"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: 'white', border: '2px solid #10b981', borderRadius: 1 }} />
                    <Typography variant="caption">Available</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#6b7280', borderRadius: 1 }} />
                    <Typography variant="caption">Occupied</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
                    <Typography variant="caption">Selected</Typography>
                  </Box>
                </Box>

                {Array.from({ length: spot?.numberOfFloors }).map((_, floorIndex) => (
                  <Slide key={floorIndex} direction="up" in={true} timeout={300 + floorIndex * 100}>
                    <Box
                      sx={{
                        mb: 3,
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: '#fafafa'
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: '#f1f5f9',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#334155',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          Floor {floorIndex + 1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {spot?.parkingSlot?.slice(floorIndex * 30, (floorIndex + 1) * 30)
                            .filter(slot => slot.available).length} available
                        </Typography>
                      </Box>
                      
                      <Box sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'repeat(auto-fill, minmax(48px, 1fr))',
                              sm: 'repeat(auto-fill, minmax(52px, 1fr))',
                              md: 'repeat(auto-fill, minmax(56px, 1fr))'
                            },
                            gap: { xs: 1.5, sm: 2 },
                            maxWidth: '100%'
                          }}
                        >
                          {spot?.parkingSlot
                            ?.slice(floorIndex * 30, (floorIndex + 1) * 30)
                            .map((slot, i) => (
                              <Box
                                key={slot.slotId}
                                onClick={() => handleSlotClick(slot.slotId, slot.available)}
                                sx={{
                                  aspectRatio: '1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 2,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  fontWeight: 600,
                                  cursor: slot.available ? 'pointer' : 'not-allowed',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  position: 'relative',
                                  bgcolor: !slot.available 
                                    ? '#6b7280' 
                                    : selectedSlot === slot.slotId 
                                    ? '#3b82f6' 
                                    : 'white',
                                  color: !slot.available || selectedSlot === slot.slotId ? 'white' : '#374151',
                                  border: slot.available 
                                    ? selectedSlot === slot.slotId 
                                      ? '2px solid #1d4ed8'
                                      : '2px solid #10b981'
                                    : '2px solid #6b7280',
                                  transform: selectedSlot === slot.slotId ? 'scale(1.05)' : 'scale(1)',
                                  boxShadow: selectedSlot === slot.slotId 
                                    ? '0 4px 12px rgba(59, 130, 246, 0.4)' 
                                    : slot.available 
                                    ? '0 2px 4px rgba(0,0,0,0.1)' 
                                    : 'none',
                                  '&:hover': slot.available ? {
                                    transform: 'scale(1.02)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                    bgcolor: selectedSlot === slot.slotId ? '#2563eb' : '#f9fafb'
                                  } : {},
                                  '&:active': slot.available ? {
                                    transform: 'scale(0.98)'
                                  } : {}
                                }}
                              >
                                {i + 1}
                                {selectedSlot === slot.slotId && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: -2,
                                      right: -2,
                                      width: 8,
                                      height: 8,
                                      bgcolor: '#10b981',
                                      borderRadius: '50%',
                                      border: '2px solid white'
                                    }}
                                  />
                                )}
                              </Box>
                            ))}
                        </Box>
                        
                      
                      </Box>
                      </Box>
                  </Slide>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  color: '#64748b'
                }}
              >
                <LocalParking sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  No Slots Available
                </Typography>
                <Typography variant="body2">
                  All parking slots are currently occupied. Please try again later.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderTop: '1px solid #e5e7eb',
              bgcolor: '#fafafa',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 2 },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {selectedSlot && (
                <Typography variant="body2" color="text.secondary">
                  Slot {selectedSlot} selected • ₹{spot?.pricingPerHour}/hour
                </Typography>
              )}
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                minWidth: { sm: 200 }
              }}
            >
              <Button
                variant="contained"
                onClick={handleBook}
                disabled={!selectedSlot}
                sx={{
                  flex: 1,
                  py: { xs: 1.5, sm: 1.25 },
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' },
                  '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                }}
              >
                {selectedSlot ? `Book Slot ${selectedSlot}` : 'Select a Slot'}
              </Button>

              <Button 
                onClick={handleClose} 
                variant="outlined"
                sx={{
                  py: { xs: 1.5, sm: 1.25 },
                  px: 3,
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': { 
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};