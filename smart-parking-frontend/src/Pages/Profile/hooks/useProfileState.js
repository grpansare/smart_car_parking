import { useState, useRef } from "react";

export const useProfileState = () => {
  const [lotName, setlotName] = useState("");
  const [address, setAddress] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("");

  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [pricingPerHour, setPricingPerHour] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const [activeSection, setActiveSection] = useState("Parking Space");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showParkingSpaceModal, setShowParkingSpaceModal] = useState(false);
  const [showSpaceDetailsModal, setShowSpaceDetailsModal] = useState(false);
  const [ChangePasswordModal, setShowPasswordModal] = useState(false);

  const [tempProfileDetails, setTempProfileDetails] = useState();
  const [tempParkingDetails, setTempParkingDetails] = useState({
    lotName: "",
    address: "",
    totalSlots: "",
    numberOfFloors: "",
  });
  const [tempSpaceDetails, setTempSpaceDetails] = useState({
    accountHolderName: "",
    SpaceName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const [editMode, setEditMode] = useState(false);

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    lotName: "",
    address: "",
    totalSlots: "",
    numberOfFloors: "",
    accountHolderName: "",
    SpaceName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const [open, setOpen] = useState(false);
  const [openSpace, setOpenSpace] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const fileInputRef = useRef(null);

  return {
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
  };
};