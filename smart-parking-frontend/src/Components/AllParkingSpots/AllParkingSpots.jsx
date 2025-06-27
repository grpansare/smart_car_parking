import axios from 'axios';
import React, { useEffect, useState } from 'react';
// Added missing import
;
import Cookies from "js-cookie";
import ViewOnMapModal from '../ViewOnMapModal/ViewOnMapModal';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { BookSlotModal } from '../BookSlotModal/BookSlotModal';

import { ConfirmBookingModal } from '../ParkingModal/ConfirmBookingModal';
import LoginModal from "../../Pages/LoginPage/LoginPage";

const AllParkingSpots = () => {
  const [allSpots, setAllSpots] = useState([]);
  const [loading, setLoading] = useState(true); // for loader


  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const openLoginModal = () => {
      setIsLoginModalOpen(true);
    };
  
    const closeLoginModal = () => {
      setIsLoginModalOpen(false);
    };
   const handleSwitchToSignup = () => {
      // Close login modal and handle signup logic
      setIsLoginModalOpen(false);
      // Add your signup modal logic here or navigate to signup
      console.log("Switch to signup modal");
   }
  const [searchplace, setSearchPlace] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [open, setOpen] = useState(false);
  const [parkingSpot, setparkingSpot] = useState();
  const [showModal, setShowModal] = useState(false);
  const {currentUser} = useSelector((state) => state.user);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState();
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [bookingMode, setBookingMode] = useState('manual'); // Default to manual selection
  const navigate = useNavigate();

  const handleCloseBookModal = () => {
    setShowModal(false);
  };

  const handleOpenBookModal = () => {
    setShowModal(true);
  };
  const handleCloseConfirmModal = () => {
    setConfirmationModal(false);
    setSelectedSpot(null);
  };
  

  const handleOpenModal = (spot) => {
    setparkingSpot(spot);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

 const confirmBooking = async (selected, slotNumber = null) => {
    if (!selected || !selected.id) {
      console.log("No spot selected or invalid spot");
      return;
    }

    let token = Cookies.get("jwt") || localStorage.getItem("token");

    try {
      const response = await axios.put(
        `http://localhost:8081/parkingspaces/bookparking`,
        { spaceId: selected.id },
        {
          params: slotNumber ? { slotNumber } : {},
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);

      if (response.data) {
        console.log("Booking successful, opening confirmation modal...");
        setSelectedSlot(response.data);
        setShowModal(false)
        setConfirmationModal(true);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error booking parking:", error);
      alert("Booking failed. Try again.");
    }
  };
  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:8081/parkingspaces/getAllParkingSpaces')
      .then((res) => {
        console.log(res.data);
        
        setAllSpots(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setSearchPlace(e.target.value);
  };
  const startPayment = async (paymentData, bookingData) => {
    console.log("Starting payment process");
    let token = Cookies.get("jwt") || localStorage.getItem("token");

    try {
      console.log("Sending request to create order");
      const response = await axios.post(
        "http://localhost:8081/api/payment/create-order",
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = response.data;
      const options = {
        key: "rzp_test_5wU1xQg8xAioM6",
        amount: order.amount,
        currency: order.currency,
        name: "ParkEase",
        description: "Payment for order",
        order_id: order.id,
        handler: async function (response) {
          if (bookingConfirmed) return;
          console.log("Payment Success:", response);

          // Prepare data to send to backend
          const paymentDetails = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: order.amount / 100, // Convert from paise to INR
            currency: order.currency,
            customerEmail: currentUser.email,
            customerName: currentUser.fullname,
            lotName: selectedSpot.lotName,

            status: "SUCCESS",
          };

          try {
            await axios.post(
              "http://localhost:8081/api/payment/store",
              paymentDetails,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const response = await axios.post(
              `http://localhost:8081/api/bookings/${selectedSlot}`,
              bookingData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log(response);

            navigate(`/dashboard/reciept/${response.data.id}`);
            // getParkingSpaces();

            setConfirmationModal(false);
          } catch (error) {
            console.error("Error storing payment or booking details:", error);
            alert("Payment succeeded but failed to store booking details.");
          }
        },
        modal: {
          ondismiss: function () {
            cancelBooking(selectedSlot, selectedSpot);
            setSelectedSlot(null);
            setConfirmationModal(false);
            getParkingSpaces();
          },
        },
        prefill: {
          name: "Your Name",
          email: "youremail@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "note value",
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order.");
    }
  };

  const handleSearch = async () => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "You are not logged in ",
        text: "Please login first.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }
    if (!searchplace || !searchplace.trim()) {
      Swal.fire({
        title: "Search place is empty!",
        text: "Please enter a valid location.",
        icon: "warning",
      });
      return; // Stop execution if searchedplace is empty
    }
    // Implement your search logic here
  };
  const OpenConfirmModal=()=>{
      setShowModal(false)
        setConfirmationModal(true); 
  }
  const handleBook = (spot) => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "You are not logged in ",
        text: "Please login first.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }
    setSelectedSpot(spot)
    handleOpenBookModal()
   
  };

  const handleBookingRandom=async(spot)=>{
     await confirmBooking(spot, null);
  }
  const handleChooseRandom = async (space) => {
    setSelectedSpot(space);
    await confirmBooking(space); // Ensuring confirmBooking runs after state update
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-dashed rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <div className="mt-4 text-center">
              <p className="text-blue-600 font-medium">Loading parking spots...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search Section - Currently commented out but styled if needed */}
          {/* <div className='pt-32 pb-8'>
            <div className="searchbox text-gray-700 flex items-center w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-1 hover:shadow-xl transition-all duration-300">
              <input
                type="text"
                name=""
                id=""
                value={searchplace}
                onChange={handleChange}
                className="bg-transparent flex-grow p-4 outline-none placeholder-gray-400 text-gray-700 font-medium"
                placeholder="Search city, place, address..."
              />
              {searchplace && (
                <button className="clearbtn p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                  <FaX
                    onClick={() => {
                      setSearchPlace("");
                    }}
                    className="text-gray-400 hover:text-gray-600 w-4 h-4"
                  />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="searchbtn p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaSearch className="w-5 h-5" />
              </button>
            </div>
          </div> */}

          <div className="container mx-auto px-4 py-12 pt-20">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Explore Parking Spaces
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Find and book the perfect parking spot for your needs. Choose from our premium locations across the city.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-6 rounded-full"></div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="text-3xl font-bold text-blue-600 mb-2">{allSpots.length}</div>
                <div className="text-gray-700 font-medium">Available Spots</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-700 font-medium">Access Available</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="text-3xl font-bold text-purple-600 mb-2">Secure</div>
                <div className="text-gray-700 font-medium">& Protected</div>
              </div>
            </div>

            {/* Parking Spots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {allSpots.map((spot, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:bg-white/90"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`http://localhost:8081/${spot.parkingSpaceImage}` ||
                      "parkingspace.jpeg"}
                      alt={spot.lotName}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        Available
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {spot.lotName}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {spot.address}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleOpenModal(spot)}
                        className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 px-4 border-2 border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-300 hover:bg-blue-50 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        View on Map
                      </button>
                      
                      <button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        onClick={() => handleBook(spot)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book Slot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {allSpots.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H5m9 0v-5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Parking Spots Available</h3>
                <p className="text-gray-500">Check back later for available parking spaces.</p>
              </div>
            )}
          </div>

          {/* Modals */}
          {parkingSpot && (
            <ViewOnMapModal
              parking_spot={parkingSpot}
              open={open}
              onClose={handleCloseModal}
            />
          )}
          
          <BookSlotModal
            spot={selectedSpot}
            open={showModal}
            onClose={handleCloseBookModal}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            onBook={(slotNumber) => confirmBooking(selectedSpot, slotNumber)}
            handleBookingRandom={handleBookingRandom}
            OpenConfirmModal={OpenConfirmModal}
          />
          
          {selectedSlot && (
            <ConfirmBookingModal
              spot={selectedSpot}
              open={confirmationModal}
              onClose={handleCloseConfirmModal}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              startPayment={startPayment}
            />
            
          
          )}
             <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToSignup={handleSwitchToSignup}
      />
        </>
      )}
    </div>
  );
};

export default AllParkingSpots;