import React from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TextField from "@mui/material/TextField";
import { InputAdornment } from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const SectionContent = ({
  activeSection,
  lotName, setlotName,
  address, setAddress,
  totalSlots, setTotalSlots,
  numberOfFloors, setNumberOfFloors,
  formErrors,
  handleSubmitParkingSpace,
  pricingPerHour, setPricingPerHour,
  editMode,
  availableFrom, setAvailableFrom,
  availableTo, setAvailableTo,
  handleUpdateClick,
  handleSaveClick,
  accountHolderName, setAccountHolderName,
  bankName, setBankName,
  accountNumber, setAccountNumber,
  ifscCode, setIfscCode,
  setShowPasswordModal
}) => {
  const renderSection = () => {
    switch (activeSection) {
      case "Parking Space":
        return (
          <div className="parking-space-container">
            <h3>Parking Space</h3>
            <label>Parking Lot Name:</label>
            <input
              type="text"
              value={lotName}
              onChange={(e) => setlotName(e.target.value)}
              placeholder="Enter parking lot name"
            />
            {formErrors.lotName && (
              <p style={{ color: "red" }}>{formErrors.lotName}</p>
            )}
            <label>Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
            {formErrors.address && (
              <p style={{ color: "red" }}>{formErrors.address}</p>
            )}
            <label>Total Number of Slots:</label>
            <input
              type="number"
              value={totalSlots}
              onChange={(e) => setTotalSlots(e.target.value)}
              placeholder="Enter total number of slots"
            />
            {formErrors.totalSlots && (
              <p style={{ color: "red" }}>{formErrors.totalSlots}</p>
            )}
            <label>Number of Floors:</label>
            <input
              type="number"
              value={numberOfFloors}
              onChange={(e) => setNumberOfFloors(e.target.value)}
              placeholder="Enter number of floors"
            />
            {formErrors.numberOfFloors && (
              <p style={{ color: "red" }}>{formErrors.numberOfFloors}</p>
            )}
            <button
              className="submit-button"
              onClick={handleSubmitParkingSpace}
            >
              Update
            </button>
          </div>
        );
      case "Pricing & Availability":
        return (
          <div className="pricing-availability-container">
            <h3>Pricing & Availability</h3>
            <label>Pricing per Hour:</label>
            <TextField
              type="number"
              value={pricingPerHour}
              className="border-2 mb-4 p-3 "
              disabled={!editMode}
              onChange={(e) => setPricingPerHour(e.target.value)}
              placeholder="Enter pricing per hour"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CurrencyRupeeIcon />
                  </InputAdornment>
                ),
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="flex mt-3 flex-col gap-4">
                <TimePicker
                  label="Available From"
                  disabled={!editMode}
                  value={availableFrom}
                  onChange={(newValue) => setAvailableFrom(newValue)}
                  ampm={false}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TimePicker
                  label="Available To"
                  value={availableTo}
                  disabled={!editMode}
                  onChange={(newValue) => setAvailableTo(newValue)}
                  ampm={false}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </div>
            </LocalizationProvider>

            {!editMode ? (
              <button
                className="submit-button mt-4"
                onClick={handleUpdateClick}
              >
                Update
              </button>
            ) : (
              <button
                className="submit-button mt-4"
                onClick={() => {
                  // Save logic here if needed
                  handleSaveClick()
                }}
              >
                Save
              </button>
            )}
          </div>
        );
      case "bank Details":
        return (
          <div className="bank-details-container">
            <h3>Bank Details</h3>
            <label>Account Holder Name:</label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Enter account holder name"
            />
            {formErrors.accountHolderName && (
              <p style={{ color: "red" }}>{formErrors.accountHolderName}</p>
            )}
            <label>Bank Name:</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Enter Space name"
            />
            {formErrors.bankName && (
              <p style={{ color: "red" }}>{formErrors.SpaceName}</p>
            )}
            <label>Account Number:</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
            />
            {formErrors.accountNumber && (
              <p style={{ color: "red" }}>{formErrors.accountNumber}</p>
            )}
            <label>IFSC Code:</label>
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="Enter IFSC code"
            />
            {formErrors.ifscCode && (
              <p style={{ color: "red" }}>{formErrors.ifscCode}</p>
            )}
            {/* // <button className="submit-button" onClick={handleSubmitSpaceDetails}>
            //   Update
            // </button> */}
          </div>
        );
      case "Security Settings":
        return (
          <div>
            <h3>Security Settings</h3>
            <div className="user-language-preference-container">
              <label>Language Preferences:</label>
              <select>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <button
              className="user-security-button"
              onClick={() => {
                setShowPasswordModal(true);
              }}
            >
              Change Password
            </button>
            <button className="user-security-button">
              Enable Two-Factor Authentication
            </button>
          </div>
        );
      case "Support & Feedback":
        return (
          <div className="user-support-buttons-container">
            <h3>Support & Feedback</h3>
            <button>Contact Support</button>
            <button>FAQs/Help</button>
            <button>Give Feedback</button>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="section-content">{renderSection()}</div>;
};

export default SectionContent;