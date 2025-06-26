import React from "react";
import { Alert, Snackbar } from "@mui/material";

const NotificationSnackbars = ({
  open,
  handleClose,
  openSpace,
  handleSpaceClose,
  openPrice,
  handlePriceClose
}) => {
  return (
    <>
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
          Profile Updated Successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={openSpace}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handleSpaceClose}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Space Details Updated Successfully
        </Alert>
      </Snackbar>
      <Snackbar
        open={openPrice}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handlePriceClose}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Price Details Updated Successfully
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationSnackbars;