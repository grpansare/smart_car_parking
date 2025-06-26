import React, { useEffect, useRef, useState } from "react";
import "./UserProfile.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import VehicleInfo from "../../Components/VehicleInfo/VehicleInfo";
import { Logout, setUser } from "../../Store/UserSlice/UserSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const UserProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [activeSection, setActiveSection] = useState("Vehicle Information");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [feedbackData, setFeedbackData] = useState({
    type: '',
    rating: 0,
    message: ''
  });
 
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    getVehicleInfo();
  }, []);
  const { currentUser } = useSelector((state) => state.user);
  const [userDetails, setUserDetails] = useState(currentUser);

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

      alert("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const logout = async () => {
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

  const getVehicleInfo = async () => {
    let token = Cookies.get("jwt");
    console.log(token);
    if (!token) {
      token = localStorage.getItem("token");
    } // ✅ Get Token From LocalStorage
    console.log(token);
    if (token) {
      try {
        const res = await axios.get(
          `http://localhost:8081/user/getvehiclesInfo/${currentUser.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Pass JWT Token in Header
            },
          }
        );

        console.log(res.data);
        setVehicles(res.data);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleUpdateInfo = () => {
    setIsModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  // Support & Feedback handlers
  const handleContactSupport = () => {
    Swal.fire({
      title: 'Contact Support',
      html: `
        <div style="text-align: left;">
          <p><strong>Email:</strong> support@company.com</p>
          <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          <p><strong>Hours:</strong> Mon-Fri, 9AM-6PM</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Got it'
    });
  };

  const handleFAQs = () => {
    Swal.fire({
      title: 'FAQs & Help',
      text: 'Redirecting to our help center...',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
    // Here you would typically navigate to FAQ page
    // navigate('/faqs');
  };

  const handleUserGuide = () => {
    Swal.fire({
      title: 'User Guide',
      text: 'Opening user guide in new tab...',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
    // Here you would typically open user guide
    // window.open('/user-guide', '_blank');
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackData.message.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter your feedback message.',
        icon: 'error',
      });
      return;
    }

    let token = Cookies.get("jwt");
    if (!token) {
      token = localStorage.getItem("token");
    }

    try {
      const feedbackPayload = {
        ...feedbackData,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString()
      };

      // Uncomment when API is ready
      // const res = await axios.post(
      //   'http://localhost:8081/user/feedback',
      //   feedbackPayload,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      Swal.fire({
        title: 'Thank You!',
        text: 'Your feedback has been submitted successfully. We appreciate your input!',
        icon: 'success',
      });

      // Clear form after successful submission
      setFeedbackData({
        type: '',
        rating: 0,
        message: ''
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit feedback. Please try again.',
        icon: 'error',
      });
    }
  };

  const handleClearFeedback = () => {
    setFeedbackData({
      type: '',
      rating: 0,
      message: ''
    });
  };

  const handleReportIssue = () => {
    setFeedbackData({
      type: 'bug',
      rating: 0,
      message: ''
    });
  };

  const handleSuggestFeature = () => {
    setFeedbackData({
      type: 'feature',
      rating: 0,
      message: ''
    });
  };

  const handleScheduleCall = () => {
    Swal.fire({
      title: 'Schedule a Call',
      html: `
        <p>To schedule a call with our support team:</p>
        <ol style="text-align: left; margin: 20px;">
          <li>Email us at: <strong>support@company.com</strong></li>
          <li>Include your preferred time slots</li>
          <li>Mention your contact number</li>
          <li>Brief description of your query</li>
        </ol>
        <p>We'll get back to you within 24 hours!</p>
      `,
      icon: 'info',
      confirmButtonText: 'Understood'
    });
  };

  const handleLogout = () => {
    console.log("Logged out");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Vehicle Information":
        return (
          <VehicleInfo
            setVehicles={setVehicles}
            vehicles={vehicles}
          ></VehicleInfo>
        );
      case "Support & Feedback":
        return (
          <div className="user-support-feedback-container">
            <h3>Support & Feedback</h3>
            
            {/* Support Section */}
            <div className="support-section">
              <h4>Need Help?</h4>
              <div className="support-grid">
                <div className="support-card">
                  <div className="support-icon">📞</div>
                  <h5>Contact Support</h5>
                  <p>Get in touch with our support team for immediate assistance</p>
                  <button onClick={() => handleContactSupport()}>Contact Now</button>
                </div>
                <div className="support-card">
                  <div className="support-icon">❓</div>
                  <h5>FAQs & Help</h5>
                  <p>Find answers to commonly asked questions</p>
                  <button onClick={() => handleFAQs()}>View FAQs</button>
                </div>
                <div className="support-card">
                  <div className="support-icon">📚</div>
                  <h5>User Guide</h5>
                  <p>Learn how to make the most of our platform</p>
                  <button onClick={() => handleUserGuide()}>View Guide</button>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="feedback-section">
              <h4>Share Your Feedback</h4>
              <div className="feedback-form">
                <div className="feedback-type">
                  <label>Feedback Type:</label>
                  <select 
                    value={feedbackData.type} 
                    onChange={(e) => setFeedbackData({...feedbackData, type: e.target.value})}
                  >
                    <option value="">Select feedback type</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement Suggestion</option>
                    <option value="general">General Feedback</option>
                    <option value="compliment">Compliment</option>
                  </select>
                </div>
                
                <div className="rating-section">
                  <label>Rate Your Experience:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${feedbackData.rating >= star ? 'active' : ''}`}
                        onClick={() => setFeedbackData({...feedbackData, rating: star})}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="feedback-message">
                  <label>Your Message:</label>
                  <textarea
                    value={feedbackData.message}
                    onChange={(e) => setFeedbackData({...feedbackData, message: e.target.value})}
                    placeholder="Tell us about your experience, suggestions, or report any issues..."
                    rows="5"
                  />
                </div>

                <div className="feedback-actions">
                  <button 
                    className="submit-feedback-btn"
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackData.message.trim()}
                  >
                    Submit Feedback
                  </button>
                  <button 
                    className="clear-feedback-btn"
                    onClick={handleClearFeedback}
                  >
                    Clear Form
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h4>Quick Actions</h4>
              <div className="quick-actions-grid">
                <button onClick={() => handleReportIssue()}>
                  <span className="action-icon">🐛</span>
                  Report Issue
                </button>
                <button onClick={() => handleSuggestFeature()}>
                  <span className="action-icon">💡</span>
                  Suggest Feature
                </button>
                <button onClick={() => handleScheduleCall()}>
                  <span className="action-icon">📅</span>
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const closeModal = () => setIsModalOpen(false);
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const saveChanges = async () => {
    let token = Cookies.get("jwt");
    console.log(token);
    if (!token) {
      token = localStorage.getItem("token");
    }
    try {
      const res = await axios.patch(
        `http://localhost:8081/user/updateinfo/${currentUser.email}`,
        userDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Pass JWT Token in Header
          },
        }
      );
      console.log(res.data);
      setUserDetails(res.data)
      dispatch(setUser(userDetails));
    } catch (e) {}

    console.log("Updated Info:", userDetails);
    setIsModalOpen(false);
    // You can call an API or dispatch to store here to save the updated info
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        title: "Error!",
        text: "New passwords do not match.",
        icon: "error",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        title: "Error!",
        text: "Password must be at least 6 characters long.",
        icon: "error",
      });
      return;
    }

    let token = Cookies.get("jwt");
    if (!token) {
      token = localStorage.getItem("token");
    }

    try {
      const res = await axios.patch(
        `http://localhost:8081/user/changepassword/${currentUser.email}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Password changed successfully.",
        icon: "success",
      });
      closePasswordModal();
    } catch (error) {
      console.error("Error changing password:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to change password.",
        icon: "error",
      });
    }
  };

  return (
    <div className="user-profile-container">
      <div className="user-profile-section">
        <div className="user-profile-left">
          <div className="user-profile-picture flex flex-col  items-center ">
            <img
              src={
                profilePicture ||
                (currentUser?.profileImage &&
                  `http://localhost:8081/uploads/${currentUser.profileImage.trim()}`) ||
                "../images.png"
              }
              alt="Profile"
              crossOrigin="anonymous"
            />

            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />
            <button className="mx-auto mt-5" onClick={handleSubmit}>
              Change Profile
            </button>
          </div>
        </div>
        <div className="user-profile-right">
          <label>Name:</label>
          <input
            type="text"
            value={currentUser?.fullname}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="name-input"
          />
          <label>Email:</label>
          <input
            type="email"
            value={currentUser?.email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          {currentUser?.contactno && (
            <>
              <label>Phone:</label>

              <input
                type="tel"
                value={currentUser?.contactno}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </>
          )}
          <button onClick={handleUpdateInfo}>Update Information</button>
          <button className="change-password-button" onClick={handleChangePassword}>
            Change Password
          </button>
          <button className="logout-button" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>

      <div className="horizontal-navbar">
        <button onClick={() => setActiveSection("Vehicle Information")}>
          Vehicle Information
        </button>
        <button onClick={() => setActiveSection("Support & Feedback")}>
          Support & Feedback
        </button>
      </div>

      <div className="section-content">{renderSection()}</div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Update Information</h2>
            <label>Name:</label>
            <input
              type="text"
              value={userDetails.fullname}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
            />
            <label>Email:</label>
            <input
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
            />
            <label>Phone:</label>
            <input
              type="tel"
              value={userDetails.contactno}
              onChange={(e) =>
                setUserDetails({ ...userDetails, contactno: e.target.value })
              }
            />
            <div className="modal-actions">
              <button onClick={saveChanges}>Save Changes</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Change Password</h2>
            <label>Current Password:</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              placeholder="Enter current password"
            />
            <label>New Password:</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              placeholder="Enter new password"
            />
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              placeholder="Confirm new password"
            />
            <div className="modal-actions">
              <button onClick={handlePasswordChange}>Change Password</button>
              <button onClick={closePasswordModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;