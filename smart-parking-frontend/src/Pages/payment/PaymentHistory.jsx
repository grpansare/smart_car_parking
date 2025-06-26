import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";

const PaymentHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { ownerDetails } = useSelector((state) => state.user);

  useEffect(() => {
    getPayments();
  }, []); // Empty dependency array to run only once on mount

  const getPayments = async () => {
    setLoading(true);
    const token = Cookies.get("jwt") || localStorage.getItem("token");
    
    try {
      // Check if ownerDetails and parkingSpaces exist
      if (!ownerDetails?.parkingSpaces?.length) {
        setError("No parking spaces found");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:8081/api/payment/getAllPayments/${ownerDetails.parkingSpaces[0].lotName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log(response.data);
      setPaymentHistory(response.data); // Fixed: was using res.data
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch payment history");
      setLoading(false);
    }
  };

  // Only filter when paymentHistory exists
  const filteredTransactions = paymentHistory?.filter((transaction) => {
    // Check if transaction and required properties exist
    if (!transaction) return false;
    
    const matchesSearch = transaction.lotName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      transaction.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const formatDate=(date)=>{
    if(date){
      const date1=`${date[0] }-${date[1]}-${date[2]}`

      return date1
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Payment History
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track and manage all your parking space payments
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by space or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading payment history...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Transactions List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment records found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id || transaction._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Transaction Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {transaction.lotName}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                            transaction.status?.toLowerCase() === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status?.toLowerCase() === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.status?.toLowerCase() === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-gray-500">Date</span>
                          <p className="text-gray-900 font-medium">
                            {formatDate(transaction.date) || '-'}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-gray-500">Amount</span>
                          <p className="text-lg font-bold text-green-600">
                            ${transaction.amount || '0.00'}
                          </p>
                        </div>
                        
                        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                          <span className="text-sm font-medium text-gray-500">Customer Name</span>
                          <p className="text-gray-900 font-medium">
                            {transaction.customerName || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;