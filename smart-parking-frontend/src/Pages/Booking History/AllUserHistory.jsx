import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Search, Filter, Calendar, Clock, User, Mail, Car, DollarSign, RefreshCw, Check, X, AlertCircle, ChevronDown, Eye } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import api from "../../api/axios";

const AllUserHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("arrivalTime");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedRows, setExpandedRows] = useState(new Set());

  const { ownerDetails } = useSelector((state) => state.user);
  
  useEffect(() => {
    if (ownerDetails) {
      getBookingDetails();
    }
  }, []);
  
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString * 1000).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return "-";
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString * 1000).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "-";
    }
  };
  
  const calculateDuration = (start, end) => {
    const durationInSeconds = end - start;
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  const getBookingDetails = async () => {
    setLoading(true);
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    try {
     const response = await axios.get(
        `http://localhost:8081/api/bookings/${ownerDetails.parkingSpaces[0].id}/getbookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setTimeout(() => {
        setBookings(response.data);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    if (newStatus === "") return;
    
    const token = Cookies.get("jwt") || localStorage.getItem("token");
    setStatusUpdating(bookingId);
    
    try {
      const response = await api.put(
        `/api/bookings/${bookingId}/status`,
        { status: newStatus },
       
      );
      
      // Update the booking status in the local state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, bookingStatus: newStatus } 
          : booking
      );
      
      setBookings(updatedBookings);
      
      // If status changed to Completed and no departure time exists, set it to now
      if (newStatus === "Completed") {
        const bookingToUpdate = bookings.find(b => b.id === bookingId);
        if (bookingToUpdate && !bookingToUpdate.departureTime) {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          
          const departureResponse = await axios.put(
            `http://localhost:8081/api/bookings/${bookingId}/departure`,
            { departureTime: currentTimestamp },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          // Update departure time in local state
          const updatedBookingsWithTime = updatedBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, departureTime: currentTimestamp } 
              : booking
          );
          
          setBookings(updatedBookingsWithTime);
        }
      }
      
    } catch (err) {
      console.error("Error updating booking status:", err);
      alert("Failed to update booking status. Please try again.");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const toggleRowExpansion = (bookingId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <Check className="w-4 h-4" />;
      case 'active': return <Clock className="w-4 h-4" />;
      case 'canceled': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'canceled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAndSortedBookings = bookings
    .filter((booking) => {
      const matchesSearch =
        booking?.parkingUser?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking?.parkingUser?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking?.carNumber && booking.carNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === "all" || 
        booking.bookingStatus?.toLowerCase() === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'parkingUser') {
        aValue = a.parkingUser?.fullname || '';
        bValue = b.parkingUser?.fullname || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading bookings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Parking Bookings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage and track all parking space bookings</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or car number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter and Refresh Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 sm:max-w-xs">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-sm sm:text-base"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={getBookingDetails}
                className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm sm:text-base">
            Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('parkingUser')}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        User Details
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Vehicle
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('arrivalTime')}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timing
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Amount
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('bookingStatus')}
                    >
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {booking.parkingUser.fullname}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            {booking.parkingUser.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Car className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-mono text-sm font-medium">
                            {booking.carNumber || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-900">
                            <strong>Entry:</strong> {formatDate(booking.arrivalTime)}
                          </div>
                          <div className="text-gray-600">
                            <strong>Exit:</strong> {booking.departureTime ? formatDate(booking.departureTime) : "In Progress"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.departureTime
                            ? calculateDuration(booking.arrivalTime, booking.departureTime)
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-semibold text-gray-900">
                          ${booking.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.bookingStatus)}`}>
                          {getStatusIcon(booking.bookingStatus)}
                          {booking.bookingStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {statusUpdating === booking.id ? (
                          <div className="flex items-center gap-2 text-blue-600">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Updating...</span>
                          </div>
                        ) : (
                          <select
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value=""
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          >
                            <option value="">Change Status</option>
                            <option value="Active" disabled={booking.bookingStatus === "Active"}>
                              Set Active
                            </option>
                            <option value="Completed" disabled={booking.bookingStatus === "Completed"}>
                              Mark Completed
                            </option>
                            <option value="Canceled" disabled={booking.bookingStatus === "Canceled"}>
                              Cancel Booking
                            </option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredAndSortedBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 truncate">
                        {booking.parkingUser.fullname}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{booking.parkingUser.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpansion(booking.id)}
                    className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedRows.has(booking.id) ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-4">
                {/* Quick Info Row */}
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.bookingStatus)}`}>
                    {getStatusIcon(booking.bookingStatus)}
                    {booking.bookingStatus}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${booking.amount.toFixed(2)}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Vehicle</div>
                    <div className="font-mono text-sm font-medium">
                      {booking.carNumber || "Not specified"}
                    </div>
                  </div>
                </div>

                {/* Timing Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Entry:</span>
                    <span className="text-sm text-gray-600">{formatDateShort(booking.arrivalTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Exit:</span>
                    <span className="text-sm text-gray-600">
                      {booking.departureTime ? formatDateShort(booking.departureTime) : "In Progress"}
                    </span>
                  </div>
                  {booking.departureTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Duration:</span>
                      <span className="text-sm text-gray-600">
                        {calculateDuration(booking.arrivalTime, booking.departureTime)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedRows.has(booking.id) && (
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Full Entry Time:</div>
                      <div className="text-sm text-gray-600">{formatDate(booking.arrivalTime)}</div>
                    </div>
                    {booking.departureTime && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Full Exit Time:</div>
                        <div className="text-sm text-gray-600">{formatDate(booking.departureTime)}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  {statusUpdating === booking.id ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600 py-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Updating status...</span>
                    </div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      value=""
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                    >
                      <option value="">Change Status</option>
                      <option value="Active" disabled={booking.bookingStatus === "Active"}>
                        Set Active
                      </option>
                      <option value="Completed" disabled={booking.bookingStatus === "Completed"}>
                        Mark Completed
                      </option>
                      <option value="Canceled" disabled={booking.bookingStatus === "Canceled"}>
                        Cancel Booking
                      </option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAndSortedBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 text-sm sm:text-base px-4">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No booking data available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUserHistory;