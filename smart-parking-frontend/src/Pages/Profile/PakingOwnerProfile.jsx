import React, { useState, useRef, useEffect } from "react";
import "./ParkingOwnerProfile.css";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import axios from "axios";
import ProfileModal from "./modals/ProfileModal";
import ParkingSpaceModal from "./modals/ParkingSpaceModal";
import SpaceDetailsModal from "./modals/BankDetails";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { Box } from "lucide-react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import { Logout } from "../../Store/UserSlice/UserSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Alert, InputAdornment, Snackbar } from "@mui/material";
import ChangePassword from "./modals/ChangePassword";
import { useProfileState } from "./hooks/useProfileState";
import { useProfileHandlers } from "./hooks/useProfileHandlers";
import ProfileSection from "./ProfileSection";
import NavigationBar from "./NavigationBar";
import SectionContent from "./SectionContent";
import NotificationSnackbars from "./NotificationSnackbars";

const ParkingOwnerProfile = () => {
  const {
    lotName, setlotName,
    address, setAddress,
    totalSlots, setTotalSlots,
    numberOfFloors, setNumberOfFloors,
    accountHolderName, setAccountHolderName,
    bankName, setBankName,
    accountNumber, setAccountNumber,
    ifscCode, setIfscCode,
    pricingPerHour, setPricingPerHour,
    availableFrom, setAvailableFrom,
    availableTo, setAvailableTo,
    profilePicture, setProfilePicture,
    activeSection, setActiveSection,
    showProfileModal, setShowProfileModal,
    showParkingSpaceModal, setShowParkingSpaceModal,
    showSpaceDetailsModal, setShowSpaceDetailsModal,
    ChangePasswordModal, setShowPasswordModal,
    tempProfileDetails, setTempProfileDetails,
    tempParkingDetails, setTempParkingDetails,
    tempSpaceDetails, setTempSpaceDetails,
    editMode, setEditMode,
    formErrors, setFormErrors,
    userDetails, setUserDetails,
    open, setOpen,
    openSpace, setOpenSpace,
    openPrice, setOpenPrice,
    fileInputRef
  } = useProfileState();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, ownerDetails } = useSelector((state) => state.user);

  const {
    handleOpne,
    handleClose,
    handleOpenPrice,
    handlePriceClose,
    handleOpenSpace,
    handleSpaceClose,
    handleProfileInputChange,
    handleParkingInputChange,
    handleSpaceInputChange,
    validateProfileForm,
    handleUpdateInfo,
    handleSaveProfileChanges,
    handleSubmitParkingSpace,
    handleUpdateClick,
    handleSaveClick,
    handleSaveParkingSpaceChanges,
    handleSubmitSpaceDetails,
    handleImageChange,
    handleSubmit,
    handleSaveSpaceDetailsChanges,
    handleLogout
  } = useProfileHandlers({
    tempProfileDetails, setTempProfileDetails,
    tempParkingDetails, setTempParkingDetails,
    tempSpaceDetails, setTempSpaceDetails,
    setFormErrors,
    setUserDetails,
    setShowProfileModal,
    setShowParkingSpaceModal,
    setShowSpaceDetailsModal,
    setEditMode,
    setProfilePicture,
    setOpen,
    setOpenSpace,
    setOpenPrice,
    fileInputRef,
    ownerDetails,
    currentUser,
    dispatch,
    navigate,
    lotName,
    pricingPerHour,
    availableFrom,
    availableTo,
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode
  });

  console.log(ownerDetails);

  useEffect(() => {
    if (ownerDetails) {
      setTempProfileDetails({
        fullname: ownerDetails.fullname || "",
        email: ownerDetails.email || "",
        contactno: ownerDetails.contactno || "",
      });

      if (ownerDetails.parkingSpaces?.length > 0) {
        const parking = ownerDetails.parkingSpaces[0];
        setlotName(parking.lotName || "");
        setAddress(parking.address || "");
        setTotalSlots(parking.totalSlots || "");
        setPricingPerHour(parking.pricingPerHour);
        setAvailableFrom(
          dayjs()
            .hour(parking.availableFrom[0])
            .minute(parking.availableFrom[1])
            .second(parking.availableFrom[2])
        );
        setAvailableTo(
          dayjs(
            dayjs()
              .hour(parking.availableTo[0])
              .minute(parking.availableTo[1])
              .second(parking.availableTo[2])
          )
        );
        setNumberOfFloors(parking.numberOfFloors || "");
      }

      // If Space details are available:
      if (ownerDetails.bankDetails) {
        const bank = ownerDetails.bankDetails;
        setAccountHolderName(bank.accountHolderName || "");
        setBankName(bank.bankName || "");
        setAccountNumber(bank.accountNumber || "");
        setIfscCode(bank.ifscCode || "");
      }
    }
  }, [ownerDetails]);

  return (
    <div className="owner-profile-container">
      {showProfileModal && (
        <ProfileModal
          tempProfileDetails={tempProfileDetails}
          formErrors={formErrors}
          onChange={handleProfileInputChange}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfileChanges}
        />
      )}
      {showParkingSpaceModal && (
        <ParkingSpaceModal
          tempParkingDetails={tempParkingDetails}
          formErrors={formErrors}
          onChange={handleParkingInputChange}
          onClose={() => setShowParkingSpaceModal(false)}
          onSave={handleSaveParkingSpaceChanges}
        />
      )}

      {showSpaceDetailsModal && (
        <SpaceDetailsModal
          tempSpaceDetails={tempSpaceDetails}
          formErrors={formErrors}
          onChange={handleSpaceInputChange}
          onClose={() => setShowSpaceDetailsModal(false)}
          onSave={handleSaveSpaceDetailsChanges}
        />
      )}
      {ChangePasswordModal && (
        <ChangePassword onClose={() => setShowPasswordModal(false)} />
      )}

      <ProfileSection
        profilePicture={profilePicture}
        currentUser={currentUser}
        fileInputRef={fileInputRef}
        handleImageChange={handleImageChange}
        handleSubmit={handleSubmit}
        tempProfileDetails={tempProfileDetails}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        formErrors={formErrors}
        handleUpdateInfo={handleUpdateInfo}
        handleLogout={handleLogout}
      />

      <NavigationBar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <SectionContent
        activeSection={activeSection}
        lotName={lotName}
        setlotName={setlotName}
        address={address}
        setAddress={setAddress}
        totalSlots={totalSlots}
        setTotalSlots={setTotalSlots}
        numberOfFloors={numberOfFloors}
        setNumberOfFloors={setNumberOfFloors}
        formErrors={formErrors}
        handleSubmitParkingSpace={handleSubmitParkingSpace}
        pricingPerHour={pricingPerHour}
        setPricingPerHour={setPricingPerHour}
        editMode={editMode}
        availableFrom={availableFrom}
        setAvailableFrom={setAvailableFrom}
        availableTo={availableTo}
        setAvailableTo={setAvailableTo}
        handleUpdateClick={handleUpdateClick}
        handleSaveClick={handleSaveClick}
        accountHolderName={accountHolderName}
        setAccountHolderName={setAccountHolderName}
        bankName={bankName}
        setBankName={setBankName}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        ifscCode={ifscCode}
        setIfscCode={setIfscCode}
        setShowPasswordModal={setShowPasswordModal}
      />

      <NotificationSnackbars
        open={open}
        handleClose={handleClose}
        openSpace={openSpace}
        handleSpaceClose={handleSpaceClose}
        openPrice={openPrice}
        handlePriceClose={handlePriceClose}
      />
    </div>
  );
};

export default ParkingOwnerProfile;