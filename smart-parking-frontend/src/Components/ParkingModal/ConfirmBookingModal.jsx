import {
  Modal,
  Box,
  Button,
  Typography,
  Divider,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useSelector } from "react-redux";
import { cancelBooking } from "../../Utils/BookingFunctions";
import {
  AccessTime,
  MonetizationOn,
  LocationOn,
  ConfirmationNumber,
  Cancel,
  Payment,
} from "@mui/icons-material";
import { FaCar } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";

dayjs.extend(duration);

export const ConfirmBookingModal = ({
  spot,
  selectedSlot,
  setSelectedSlot,
  open,
  onClose,
  onBook,
  startPayment,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { arrivalTime, departureTime, currentUser } = useSelector(
    (state) => state.user
  );

  const [totalAmount, setTotalAmount] = useState(0);
  const [arrival, setArrival] = useState(
    arrivalTime ? dayjs(arrivalTime) : dayjs()
  );
  const [departure, setDeparture] = useState(
    departureTime ? dayjs(departureTime) : dayjs().add(1, "hour")
  );

  // Format dates properly
  const formattedArrival = arrival.format("hh:mm A | DD MMM YYYY");
  const formattedDeparture = departure.format("hh:mm A | DD MMM YYYY");

  useEffect(() => {
    setTotalAmount(calculateTotalAmount());
  }, [arrival, departure]);

  const beginPayment = () => {
    const paymentData = {
      amount: totalAmount,
      name: currentUser.fullName,
      email: currentUser.email,
      phone: currentUser.contactno,
    };
    console.log(currentUser);

    const bookingData = {
      userId: currentUser.userId,
      parkingLotId: spot.spaceId || spot.id || spot.spaceIdd,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      amount: totalAmount,
    };
    startPayment(paymentData, bookingData);
  };

  const onCancelBooking = () => {
    cancelBooking(selectedSlot, spot);
    setSelectedSlot(null);
    onClose();
  };
  const handleProceed = () => {
    onClose();
    beginPayment();
  };
  const calculateTotalAmount = () => {
    if (!spot) return 0;
    const diff = dayjs.duration(departure.diff(arrival));
    const hours = diff.hours();
    const minutes = diff.minutes();

    if (hours < 0 || minutes < 0) return 0;

    let pricePerMin = spot.pricingPerHour / 60;
    let minAmount = pricePerMin * minutes;
    let hoursAmount = hours * spot.pricingPerHour;

    return (minAmount + hoursAmount).toFixed(2);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : 650,
          maxHeight: "90vh",
          p: isMobile ? 2 : 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          outline: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ConfirmationNumber fontSize="medium" />
          Confirm Your Booking
        </Typography>

        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {spot?.lotName}
          </Typography>
          <Typography
            variant="body1"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <LocationOn fontSize="small" color="primary" />
            {spot?.address}
          </Typography>
        </Paper>

        <Box sx={{ overflowY: "auto", flexGrow: 1, mb: 2 }}>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Booking Details
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 2,
              }}
            >
              <DetailItem
                icon={<FaCar style={{ color: theme.palette.secondary.main }} />}
                label="Selected Slot"
                value={selectedSlot}
              />

              <DetailItem
                icon={<AccessTime color="success" />}
                label="Arrival Time"
                value={formattedArrival}
              />

              <DetailItem
                icon={<AccessTime color="error" />}
                label="Departure Time"
                value={formattedDeparture}
              />

              <DetailItem
                icon={<MonetizationOn color="warning" />}
                label="Rate"
                value={`₹${spot?.pricingPerHour}/hour`}
              />
            </Box>
          </Box>

          <Paper elevation={2} sx={{ p: 2, bgcolor: "primary.light", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Total Amount:</span>
              <span>₹{totalAmount}</span>
            </Typography>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please review your booking details. Once confirmed, you'll be
            redirected to the payment page.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancelBooking}
            startIcon={<Cancel />}
            fullWidth={isMobile}
            sx={{
              fontWeight: 600,
              py: 1.5,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleProceed}
            startIcon={<Payment />}
            fullWidth={isMobile}
            sx={{
              fontWeight: 600,
              py: 1.5,
            }}
          >
            Proceed to Payment
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const DetailItem = ({ icon, label, value }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ color: "action.active" }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};
