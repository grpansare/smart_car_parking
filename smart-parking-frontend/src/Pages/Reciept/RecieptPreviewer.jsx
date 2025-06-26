import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import Cookies from "js-cookie";
import ParkingDirections from "../../Components/ParkingDirections/ParkingDirections";
import { Alert, Snackbar } from "@mui/material";

const Receipt = () => {
  const { id } = useParams();
  console.log(id);

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    handleClick();
    fetchReceipt(id);
  }, [id]);

  const fetchReceipt = async (bookingId) => {
    let token = Cookies.get("jwt") || localStorage.getItem("token");
    console.log(token);
   console.log(bookingId);
   
    try {
      const response = await axios.get(
        `http://localhost:8081/api/bookings/generateReciept/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReceipt(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching receipt:", err);
      setError("Failed to load receipt. Please try again later.");
      setLoading(false);
    }
  };

  const handleShowDirection = () => {
    // Open Google Maps with directions to the parking spot
    if (receipt && receipt.parkingSpotAddress) {
      const encodedAddress = encodeURIComponent(receipt.parkingSpotAddress);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(googleMapsUrl, "_blank");
    }

    // Keep the existing modal functionality as well
  };

  const downloadReceipt = () => {
    if (!receipt) return;

    const doc = new jsPDF();

    // Header with background color and company logo area
    doc.setFillColor(37, 99, 235); // Blue background
    doc.rect(0, 0, 210, 35, "F");

    // Company name in white
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Smart Car Parking", 105, 18, { align: "center" });

    doc.setFontSize(12);
    doc.text("Official Receipt", 105, 28, { align: "center" });

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Receipt header section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Receipt Details", 20, 50);

    // Receipt ID with box
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.rect(130, 42, 60, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Receipt No.", 132, 48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${receipt.receiptId || receipt.recieptId}`, 132, 52);

    // Customer Information Section
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(20, 60, 170, 25, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Customer Information", 25, 70);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Customer Name:", 25, 78);
    doc.setFont("helvetica", "bold");
    doc.text(`${receipt.customerName}`, 70, 78);

    // Parking Details Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Parking Details", 25, 95);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Parking Space:", 25, 103);
    doc.setFont("helvetica", "bold");
    doc.text(`${receipt.lotName}`, 70, 103);

    doc.setFont("helvetica", "normal");
    doc.text("Address:", 25, 111);
    doc.setFont("helvetica", "bold");
    // Handle long addresses with text wrapping
    const addressLines = doc.splitTextToSize(
      `${receipt.parkingSpotAddress}`,
      115
    );
    doc.text(addressLines, 70, 111);

    // Calculate dynamic Y position based on address lines
    let currentY = 111 + addressLines.length * 6;

    // Booking Timeline Section
    doc.setFillColor(248, 250, 252);
    doc.rect(20, currentY + 8, 170, 35, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Booking Timeline", 25, currentY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Arrival Time:", 25, currentY + 26);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${new Date(receipt.arrivalTime * 1000).toLocaleString()}`,
      70,
      currentY + 26
    );

    doc.setFont("helvetica", "normal");
    doc.text("Departure Time:", 25, currentY + 34);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${new Date(receipt.departureTime * 1000).toLocaleString()}`,
      70,
      currentY + 34
    );

    // Payment Section with highlight
    currentY += 50;
    doc.setFillColor(34, 197, 94); // Green background
    doc.rect(20, currentY, 170, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Amount Paid:", 25, currentY + 10);
    doc.setFontSize(20);
    doc.text(`₹${receipt.amount}`, 25, currentY + 16);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Footer section
    currentY += 35;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, currentY, 190, currentY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.text("Thank you for using Smart Car Parking!", 105, currentY + 10, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text("Keep this receipt for your records", 105, currentY + 18, {
      align: "center",
    });

    // Add generation timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      105,
      currentY + 28,
      { align: "center" }
    );

    doc.save(
      `Smart_Parking_Receipt_${receipt.receiptId || receipt.recieptId}.pdf`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-700 font-medium">
            Loading receipt...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Receipt
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Parking Receipt
          </h1>
          <p className="text-gray-600">Thank you for using Smart Car Parking</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Receipt Details</h2>
                <p className="text-blue-100">Booking Confirmation</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Receipt No.</p>
                <p className="text-xl font-mono font-bold">
                  {receipt.recieptId}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-semibold text-gray-800">
                        {receipt.customerName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parking Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Parking Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-500">Parking Space</p>
                      <p className="font-semibold text-gray-800">
                        {receipt.lotName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-700 leading-relaxed">
                        {receipt.parkingSpotAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time & Payment Info */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Booking Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600">
                      Arrival Time
                    </p>
                  </div>
                  <p className="text-sm font-mono text-gray-800">
                    {new Date(receipt.arrivalTime * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600">
                      Departure Time
                    </p>
                  </div>
                  <p className="text-sm font-mono text-gray-800">
                    {new Date(receipt.departureTime * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <p className="text-sm font-medium">Amount Paid</p>
                  </div>
                  <p className="text-xl font-bold">₹{receipt.amount}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                onClick={downloadReceipt}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Download Receipt</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                onClick={handleShowDirection}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Show Directions</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                Thank you for choosing Smart Car Parking
              </p>
              <p className="text-xs mt-1">Keep this receipt for your records</p>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Slot booked successfully !!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Receipt;
