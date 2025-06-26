import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import axios from "axios";
const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);

  const { currentUser } = useSelector((state) => state.user);
  const calculateDuration = (start, end) => {
    const durationInSeconds = end - start;
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const fetchBookings = async () => {
    console.log(currentUser.userId);
    const token = Cookies.get("jwt") || localStorage.getItem("token");
    console.log(token)
    try {
      const response = await axios.get(
        `http://localhost:8081/api/bookings/${currentUser.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Start editing a booking
  const startEditing = (booking) => {
    setEditingBooking(booking.id);
    setEditFormData({
      address: booking.address,
      arrivalTime: new Date(booking.arrivalTime * 1000).toISOString().slice(0, 16),
      departureTime: new Date(booking.departureTime * 1000).toISOString().slice(0, 16),
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingBooking(null);
    setEditFormData({});
  };

  // Save edited booking
  const saveBooking = async (bookingId) => {
    try {
      const token = Cookies.get("jwt") || localStorage.getItem("token");
      const updatedBooking = {
        ...editFormData,
        arrivalTime: Math.floor(new Date(editFormData.arrivalTime).getTime() / 1000),
        departureTime: Math.floor(new Date(editFormData.departureTime).getTime() / 1000),
      };

      // Update booking in the list
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, ...updatedBooking }
            : booking
        )
      );

      // Here you would make an API call to update the booking

      await axios.put(`http://localhost:8081/api/bookings/update-time/${bookingId}`, {
  arrivalTime: new Date(editFormData.arrivalTime).toISOString(),  // must be in ISO format
  departureTime: new Date(editFormData.departureTime).toISOString(),
}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

      console.log("Updating booking:", bookingId, updatedBooking);
      
      setEditingBooking(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter bookings based on selected status
  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.bookingStatus === filter);

  // Get current bookings for pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to previous page
  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // Go to next page
  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "✓";
      case "pending":
        return "⏳";
      case "canceled":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Booking History
          </h1>
          <p className="text-gray-600">
            Track and manage all your bookings in one place
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Filter Bookings
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {["all", "Completed", "Pending", "Canceled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  filter === status
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                }`}
              >
                {status === "all" ? "All Bookings" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-xl text-gray-600">Loading your bookings...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bookings List */}
            {currentBookings.length > 0 ? (
              currentBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Booking Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">
                        Booking #{booking.id}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                            booking.bookingStatus
                          )}`}
                        >
                          <span>{getStatusIcon(booking.bookingStatus)}</span>
                          {booking.bookingStatus}
                        </span>
                        {booking.bookingStatus === "Pending" && (
                          <div className="flex gap-2">
                            {editingBooking === booking.id ? (
                              <>
                                <button
                                  onClick={() => saveBooking(booking.id)}
                                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditing(booking)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Location & Amount */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Location
                            </p>
                            {editingBooking === booking.id ? (
                              <input
                                type="text"
                                value={editFormData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">
                                {booking.address}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Amount Paid
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              ₹{booking.amount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Time Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Duration
                            </p>
                            <p className="text-lg font-semibold text-purple-600">
                              {editingBooking === booking.id ? 
                                calculateDuration(
                                  Math.floor(new Date(editFormData.arrivalTime).getTime() / 1000),
                                  Math.floor(new Date(editFormData.departureTime).getTime() / 1000)
                                ) :
                                calculateDuration(
                                  booking.arrivalTime,
                                  booking.departureTime
                                )
                              }
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="grid grid-cols-1 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-medium mb-1">
                                Entry Time
                              </p>
                              {editingBooking === booking.id ? (
                                <input
                                  type="datetime-local"
                                  value={editFormData.arrivalTime}
                                  onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              ) : (
                                <p className="text-gray-900 font-semibold">
                                  {new Date(
                                    booking.arrivalTime * 1000
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium mb-1">
                                Exit Time
                              </p>
                              {editingBooking === booking.id ? (
                                <input
                                  type="datetime-local"
                                  value={editFormData.departureTime}
                                  onChange={(e) => handleInputChange('departureTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              ) : (
                                <p className="text-gray-900 font-semibold">
                                  {new Date(
                                    booking.departureTime * 1000
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {filter === "all"
                    ? "You haven't made any bookings yet. Start exploring to make your first booking!"
                    : `No ${filter.toLowerCase()} bookings found. Try adjusting your filter.`}
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredBookings.length > 0 && totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Pagination Info */}
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {indexOfFirstBooking + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(indexOfLastBooking, filteredBookings.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {filteredBookings.length}
                    </span>{" "}
                    bookings
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;