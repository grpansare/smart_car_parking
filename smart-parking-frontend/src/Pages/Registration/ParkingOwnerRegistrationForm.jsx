import React, { useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Container,
  Fade,
  Slide,
  StepConnector,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddressField from "../../Components/AddressField/AddressField";



import { useRef } from 'react';


const ParkingImageUpload = ({ image, formData, setFormData }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Update formData with the selected file
      setFormData({
        ...formData,
        parkingImage: file
      });
      
      // Optional: Create preview URL if needed
      const imageUrl = URL.createObjectURL(file);
      // You can store this URL in state if you want to show a preview
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        multiple={false}
      />
      <Box
        onClick={handleClick}
        sx={{
          border: '2px dashed #e0e0e0',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <UploadFileIcon sx={{ fontSize: 48, color: '#666', mb: 1 }} />
        <Typography variant="body2" color="textSecondary">
          {formData?.parkingImage?.name || 'Click to upload parking lot images'}
        </Typography>
      </Box>
    </>
  );
};
function ParkingOwnerRegistrationForm() {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contactno: "",
    password: "",
    confirmPassword: "",
    lotName: "",
    address: "",
    totalSlots: "",
    numberOfFloors: "",
    parkingImage: "",
    pricingPerHour: "",
    availableFrom: dayjs(),
    availableTo: dayjs(),
    businessRegCert: "",
    identityProof: "",
    lotImage: null,
    bankDetails: {
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    },
    acceptedTerms: false,
  });
  const [loading, setisLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    contactno: "",
    password: "",
    confirmPassword: "",
    lotName: "",
    address: "",
    totalSlots: "",
    pricingPerHour: "",
    availableTimings: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    acceptedTerms: "",
  });

  const steps = [
    { label: 'Personal Info', icon: <PersonIcon /> },
    { label: 'Parking Details', icon: <DirectionsCarIcon /> },
    { label: 'Pricing', icon: <AttachMoneyIcon /> },
    { label: 'Bank Details', icon: <AccountBalanceIcon /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      bankDetails: {
        ...prevData.bankDetails,
        [name]: value,
      },
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      fullname: formData.fullname,
      email: formData.email,
      contactno: formData.contactno,
      password: formData.password,
      acceptedTerms: formData.acceptedTerms,
      parkingSpaces: [
        {
          lotName: formData.lotName,
          address: formData.address,
          totalSlots: parseInt(formData.totalSlots),
          numberOfFloors: parseInt(formData.numberOfFloors),
          availableFrom: dayjs(formData.availableFrom).format("HH:mm:ss"),
          availableTo: dayjs(formData.availableTo).format("HH:mm:ss"),
          pricingPerHour: parseFloat(formData.pricingPerHour),
        },
      ],
      bankDetails: {
        accountHolderName: formData.bankDetails.accountHolderName,
        bankName: formData.bankDetails.bankName,
        ifscCode: formData.bankDetails.ifscCode,
        accountNumber: formData.bankDetails.accountNumber,
      },
    };

    try {
      setisLoading(true);
      const response = await axios.post(
        "http://localhost:8081/parkingowner",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const savedOwnerId = response.data.userId;

      if (formData.profileImage) {
        await uploadProfileImage(savedOwnerId, formData.profileImage);
      }

      alert("Registration Successful! Please check your email for approval details.");
    } catch (err) {
      console.log(err);
      alert("Something went wrong.");
    } finally {
      setisLoading(false);
    }
  };

  const uploadProfileImage = async (userId, imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    await axios.post(
      `http://localhost:8081/parkingowner/${userId}/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  };

  const handleTermsChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      acceptedTerms: e.target.checked,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      acceptedTerms: "",
    }));
  };

  const handleTimeChange = (newValue, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: newValue,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "",
    }));
  };

  const handleNext = () => {
    let validationErrors = {};

    if (step === 1) {
      if (!formData.fullname)
        validationErrors.fullName = "Please enter your full name.";
      if (!formData.email) validationErrors.email = "Please enter your email.";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        validationErrors.email = "Please enter a valid email address.";
      if (!formData.contactno)
        validationErrors.contactno = "Please enter your phone number.";
      else if (!/^\d{10}$/.test(formData.contactno))
        validationErrors.contactno = "Phone number must be 10 digits.";
      if (!formData.password)
        validationErrors.password = "Please enter your password.";
      if (!formData.confirmPassword)
        validationErrors.confirmPassword = "Please confirm your password.";
      if (formData.password !== formData.confirmPassword)
        validationErrors.confirmPassword = "Passwords do not match.";
    }

    if (step === 2) {
      if (!formData.lotName)
        validationErrors.lotName = "Please enter parking lot name.";
      if (!formData.address)
        validationErrors.address = "Please enter the parking address.";
      if (!formData.totalSlots)
        validationErrors.totalSlots = "Please enter the total number of slots.";
      else if (!/^\d+$/.test(formData.totalSlots))
        validationErrors.totalSlots = "Total slots must be a valid number.";
      if (!formData.numberOfFloors)
        validationErrors.numberOfFLoors = "Please provide floor details.";
    }

    if (step === 3) {
      if (!formData.pricingPerHour)
        validationErrors.pricingPerHour = "Please enter pricing per hour.";
      else if (!/^\d+$/.test(formData.pricingPerHour))
        validationErrors.pricingPerHour =
          "Pricing per hour must be a valid number.";

      if (!formData.availableFrom || !formData.availableTo) {
        validationErrors.availableTimings =
          "Please select both available from and to timings.";
      }
    }

    if (step === 4) {
      if (!formData.bankDetails.accountHolderName)
        validationErrors.accountHolderName =
          "Please enter account holder name.";
      if (!formData.bankDetails.bankName)
        validationErrors.bankName = "Please enter bank name.";
      if (!formData.bankDetails.accountNumber)
        validationErrors.accountNumber = "Please enter account number.";
      else if (!/^\d+$/.test(formData.bankDetails.accountNumber))
        validationErrors.accountNumber =
          "Account number must be a valid number.";
      if (!formData.bankDetails.ifscCode)
        validationErrors.ifscCode = "Please enter IFSC code.";
      if (!formData.acceptedTerms)
        validationErrors.acceptedTerms =
          "Please accept the terms and conditions.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Personal Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  className="no-border"
                />

                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  className="no-border"
                />

                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  name="contactno"
                  value={formData.contactno}
                  onChange={handleChange}
                  error={!!errors.contactno}
                  helperText={errors.contactno}
                  className="no-border"
                />

                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  className="no-border"
                />

                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  className="no-border"
                />
              </Box>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DirectionsCarIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Parking Space Details
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Parking Lot Name"
                  variant="outlined"
                  fullWidth
                  name="lotName"
                  value={formData.lotName}
                  onChange={handleChange}
                  error={!!errors.lotName}
                  helperText={errors.lotName}
                  className="no-border"
                />
                
                <ParkingImageUpload
                  image={image}
                  formData={formData}
                  setFormData={setFormData}
                />
                
                <AddressField
                  handleChange={handleChange}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Total Number of Slots"
                    variant="outlined"
                    fullWidth
                    name="totalSlots"
                    value={formData.totalSlots}
                    onChange={handleChange}
                    error={!!errors.totalSlots}
                    helperText={errors.totalSlots}
                    className="no-border"
                  />

                  <TextField
                    label="Number of Floors"
                    variant="outlined"
                    fullWidth
                    name="numberOfFloors"
                    value={formData.numberOfFloors}
                    onChange={handleChange}
                    error={!!errors.numberOfFLoors}
                    helperText={errors.numberOfFLoors}
                    className="no-border"
                  />
                </Box>
              </Box>
            </Box>
          </Fade>
        );

      case 3:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AttachMoneyIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Pricing & Availability
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Pricing Per Hour"
                  variant="outlined"
                  fullWidth
                  name="pricingPerHour"
                  value={formData.pricingPerHour}
                  onChange={handleChange}
                  error={!!errors.pricingPerHour}
                  helperText={errors.pricingPerHour}
                  className="no-border"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CurrencyRupeeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TimePicker
                      label="Available From"
                      value={formData.availableFrom}
                      onChange={(newValue) =>
                        handleTimeChange(newValue, "availableFrom")
                      }
                      ampm={false}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <TimePicker
                      label="Available To"
                      value={formData.availableTo}
                      onChange={(newValue) =>
                        handleTimeChange(newValue, "availableTo")
                      }
                      ampm={false}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Box>
                </LocalizationProvider>
                
                {errors.availableTimings && (
                  <Typography color="error" variant="body2">
                    {errors.availableTimings}
                  </Typography>
                )}
              </Box>
            </Box>
          </Fade>
        );

      case 4:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountBalanceIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Bank Details
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Account Holder Name"
                  variant="outlined"
                  fullWidth
                  name="accountHolderName"
                  value={formData.bankDetails.accountHolderName}
                  onChange={handleBankChange}
                  error={!!errors.accountHolderName}
                  helperText={errors.accountHolderName}
                  className="no-border"
                />

                <TextField
                  label="Bank Name"
                  variant="outlined"
                  fullWidth
                  name="bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleBankChange}
                  error={!!errors.bankName}
                  helperText={errors.bankName}
                  className="no-border"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Account Number"
                    variant="outlined"
                    fullWidth
                    name="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleBankChange}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber}
                    className="no-border"
                  />

                  <TextField
                    label="IFSC Code"
                    variant="outlined"
                    fullWidth
                    name="ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleBankChange}
                    error={!!errors.ifscCode}
                    helperText={errors.ifscCode}
                    className="no-border"
                  />
                </Box>

                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2, 
                  backgroundColor: '#fafafa' 
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.acceptedTerms}
                        onChange={handleTermsChange}
                        name="acceptedTerms"
                        color="primary"
                      />
                    }
                    label="I accept the terms and conditions"
                  />
                  {errors.acceptedTerms && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {errors.acceptedTerms}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        <Paper elevation={24} sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
          {/* Header */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <DirectionsCarIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                ParkEase
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Parking Owner Registration
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ p: 4, pb: 2 }}>
            <Stepper activeStep={step - 1} alternativeLabel
             connector={
    <StepConnector 
      sx={{
        '& .MuiStepConnector-line': {
          marginTop: '15px', // Half of your icon height (50px / 2)
        }
      }}
    />
  }
            
            >
              {steps.map((stepInfo, index) => (
                <Step key={stepInfo.label}>
                  <StepLabel 
                    StepIconComponent={({ active, completed }) => (
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: completed 
                          ? 'linear-gradient(135deg, #4caf50, #45a049)'
                          : active 
                          ? 'linear-gradient(135deg, #667eea, #764ba2)'
                          : '#e0e0e0',
                        color: completed || active ? 'white' : '#666',
                        transition: 'all 0.3s ease',
                        boxShadow: completed || active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                      }}>
                        {completed ? <CheckCircleIcon /> : stepInfo.icon}
                      </Box>
                    )}
                  >
                    <Typography variant="body2" sx={{ 
                      fontWeight: step === index + 1 ? 600 : 400,
                      color: step === index + 1 ? 'primary.main' : 'text.secondary'
                    }}>
                      {stepInfo.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 4, pt: 2 }}>
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ 
            p: 4, 
            pt: 2,
            display: 'flex', 
            justifyContent: 'space-between',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}>
            <Button
              variant="outlined"
              onClick={handlePrev}
              disabled={step === 1}
              sx={{ 
                minWidth: 120,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              sx={{ 
                minWidth: 120,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                background: step === 4 
                  ? 'linear-gradient(135deg, #4caf50, #45a049)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                '&:hover': {
                  background: step === 4 
                    ? 'linear-gradient(135deg, #45a049, #3d8b40)'
                    : 'linear-gradient(135deg, #5a6fd8, #6a4c93)',
                }
              }}
            >
              {loading ? 'Processing...' : step === 4 ? 'Submit Registration' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ParkingOwnerRegistrationForm;