import Cookies from "js-cookie";
import axios from "axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { Logout } from "../../../Store/UserSlice/UserSlice";

export const useProfileHandlers = ({
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
}) => {
  const handleOpne = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpenPrice = () => {
    setOpenPrice(true);
  };
  const handlePriceClose = () => {
    setOpenPrice(false);
  };
  const handleOpenSpace = () => {
    setOpenSpace(true);
  };
  const handleSpaceClose = () => {
    setOpenSpace(false);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    // alert(value)
    setTempProfileDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleParkingInputChange = (e) => {
    const { name, value } = e.target;
    setTempParkingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpaceInputChange = (e) => {
    const { name, value } = e.target;
    setTempSpaceDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfileForm = () => {
    let errors = {};
    if (!/^[A-Za-z\s]+$/.test(tempProfileDetails.name)) {
      errors.name = "Name should only contain letters.";
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(tempProfileDetails.email)) {
      errors.email = "Please enter a valid email.";
    }
    if (!/^\d{10}$/.test(tempProfileDetails.contactno)) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateInfo = () => {
    setShowProfileModal(true);
  };

  const handleSaveProfileChanges = async () => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    if (validateProfileForm()) {
      setUserDetails(tempProfileDetails);
      setShowProfileModal(false);
    }
    try {
      await axios.put(
        `http://localhost:8081/parkingowner/update/${ownerDetails.userId}`,
        tempProfileDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleOpne();
      console.log("==========================");
    } catch (Err) {
      console.log(Err);
    }
  };

  const handleSubmitParkingSpace = () => {
    setTempParkingDetails({
      lotName,
      address,
      totalSlots,
      numberOfFloors,
    });
    setShowParkingSpaceModal(true);
  };
  const handleUpdateClick = async () => {
    setEditMode(true);
    
  };
  const handleSaveClick=async()=>{
    setEditMode(false)
    const formData = new FormData();
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    formData.append("pricingPerHour", pricingPerHour);
    formData.append("availableFrom", dayjs(availableFrom).format("HH:mm:ss"));
    formData.append("availableTo", dayjs(availableTo).format("HH:mm:ss"));
    try {
      const response = await axios.put(
        `http://localhost:8081/parkingspaces/updatepriceandtime/${lotName}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        handleOpenPrice(); // only show snackbar if update was successful
      }
      
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }
  const handleSaveParkingSpaceChanges = async () => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    let errors = {};
    if (!/^[A-Za-z\s]+$/.test(tempParkingDetails.lotName)) {
      errors.lotName = "Parking Lot Name should only contain letters.";
    }
    if (!tempParkingDetails.address) {
      errors.address = "Address is required.";
    }
    if (!/^\d+$/.test(tempParkingDetails.totalSlots)) {
      errors.totalSlots = "Total Number of Slots should only contain numbers.";
    }
    if (!/^\d+$/.test(tempParkingDetails.numberOfFloors)) {
      errors.numberOfFloors = "Number of Floors should only contain numbers.";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setlotName(tempParkingDetails.lotName);
      setAddress(tempParkingDetails.address);
      setTotalSlots(tempParkingDetails.totalSlots);
      setNumberOfFloors(tempParkingDetails.numberOfFloors);
      setShowParkingSpaceModal(false);
    }
    const id = ownerDetails.parkingSpaces[0].id;

    await axios.put(
      `http://localhost:8081/parkingspaces/update/${id}?userId=${ownerDetails.userId}`,
      tempParkingDetails,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    handleOpenSpace();
  };

  const handleSubmitSpaceDetails = () => {
    setTempSpaceDetails({
      accountHolderName,
      SpaceName,
      accountNumber,
      ifscCode,
    });
    setShowSpaceDetailsModal(true);
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert("Please select an image file");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfilePicture(imageUrl);

    let token = Cookies.get("jwt") || localStorage.getItem("token");

    console.log("Selected File:", file);
    console.log("Token:", token);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", currentUser.email);

    try {
      const response = await axios.patch(
        "http://localhost:8081/user/uploadimage",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     handleOpne()
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const handleSubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleSaveSpaceDetailsChanges = async () => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    let errors = {};
    if (!/^[A-Za-z\s]+$/.test(tempSpaceDetails.accountHolderName)) {
      errors.accountHolderName =
        "Account Holder Name should only contain letters.";
    }
    if (!/^[A-Za-z\s]+$/.test(tempSpaceDetails.SpaceName)) {
      errors.SpaceName = "Space Name should only contain letters.";
    }
    if (!/^\d{11,16}$/.test(tempSpaceDetails.accountNumber)) {
      errors.accountNumber =
        "Account Number should be between 11 and 16 digits.";
    }
    if (!/^[A-Za-z0-9]{11}$/.test(tempSpaceDetails.ifscCode)) {
      errors.ifscCode =
        "IFSC Code should contain exactly 11 alphanumeric characters.";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setAccountHolderName(tempSpaceDetails.accountHolderName);
      setSpaceName(tempSpaceDetails.SpaceName);
      setAccountNumber(tempSpaceDetails.accountNumber);
      setIfscCode(tempSpaceDetails.ifscCode);
      setShowSpaceDetailsModal(false);
    }
    await axios.put(
      `http://localhost:8081/parkingowner/${ownerDetails.userId}/update-Space`,
      tempSpaceDetails,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(Logout());
        localStorage.removeItem("token");
        Cookies.remove("jwt", { path: "", domain: "" });
        Swal.fire(
          "Logged Out!",
          "You have been logged out successfully.",
          "success"
        ).then(() => {
          navigate("/");
        });
      }
    });
  };

  return {
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
  };
};