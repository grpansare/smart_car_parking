import { LocationOn, Payment } from "@mui/icons-material";
import { Button, Chip } from "@mui/material";
import React, { useState } from "react";

const AvailableSpaces = ({
  parkingSpaces,
  handleChooseSlot,
  handleChooseRandom,
}) => {
  const [loading, setLoading] = useState(false);
  const getAvailabilityColor = (totalSlots) => {
    if (totalSlots > 10) return "success";
    if (totalSlots > 5) return "warning";
    if (totalSlots > 0) return "error";
    return "default";
  };

  const getAvailabilityText = (totalSlots) => {
    if (totalSlots > 10) return "High Availability";
    if (totalSlots > 5) return "Medium Availability";
    if (totalSlots > 0) return "Low Availability";
    return "Full";
  };
  return (
    <div className="">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          Available Parking Spaces
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Choose from {parkingSpaces.length} parking locations near you
        </p>
      </div>

      {parkingSpaces.length === 0 && !loading ? (
        <div className="text-center py-8 sm:py-12">
          <h3 className="text-lg sm:text-xl text-gray-600 mb-2">
            No parking spaces found
          </h3>
          <p className="text-gray-500">Try searching in a different area</p>
        </div>
      ) : (
        <div className="flex justify-center px-4">
          {parkingSpaces.length === 1 ? (
            // Single item - use flex to center it
            <div className="flex justify-center w-full">
              {parkingSpaces.map((spot, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-gray-100 w-full max-w-sm"
                >
                  <div className="relative">
                    <img
                      src={spot.image || "/parkingspace.jpeg"}
                      alt={spot.lotName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Chip
                        label={getAvailabilityText(spot.totalSlots)}
                        color={getAvailabilityColor(spot.totalSlots)}
                        size="small"
                        className="bg-white/90 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {spot.lotName}
                      </h3>
                      <p className="text-gray-600 text-sm flex items-start">
                        <LocationOn
                          className="text-gray-400 mr-1 mt-0.5"
                          fontSize="small"
                        />
                        {spot.address}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          Available Slots
                        </span>
                        <span className="font-bold text-lg text-green-600">
                          {spot.totalSlots || 0}
                        </span>
                      </div>
                      {spot.pricePerHour && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Price/Hour
                          </span>
                          <span className="font-semibold text-blue-600">
                            ₹{spot.pricePerHour}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <a
                        href={spot.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                      >
                        📍 View on Map
                      </a>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Payment />}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                        onClick={() => handleChooseSlot(spot)}
                        disabled={!spot.totalSlots || spot.totalSlots === 0}
                      >
                        {spot.totalSlots > 0 ? "Book Slot" : "Full"}
                      </Button>
                       <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleChooseRandom(spot)}
                        disabled={spot.totalSlots === 0}
                        className="w-full text-xs sm:text-sm py-2"
                        sx={{
                          borderColor: "#2563eb",
                          color: "#2563eb",
                          "&:hover": {
                            borderColor: "#1d4ed8",
                            backgroundColor: "#f0f9ff",
                          },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          padding: { xs: "6px 12px", sm: "8px 16px" },
                        }}
                      >
                        Choose Randomly
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Multiple items - use grid
            <div className="flex  gap-4 p-6 md:flex-col lg:flex-row sm:flex-col">
              {parkingSpaces.map((spot, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-gray-100 w-full max-w-sm"
                >
                  <div className="relative">
                    <img
                      src={
                        `http://localhost:8081/${spot.parkingSpaceImage}` ||
                        "parkingspace.jpeg"
                      }
                      alt={spot.lotName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Chip
                        label={getAvailabilityText(spot.totalSlots)}
                        color={getAvailabilityColor(spot.totalSlots)}
                        size="small"
                        className="bg-white/90 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {spot.lotName}
                      </h3>
                      <p className="text-gray-600 text-sm flex items-start">
                        <LocationOn
                          className="text-gray-400 mr-1 mt-0.5"
                          fontSize="small"
                        />
                        {spot.address}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          Available Slots
                        </span>
                        <span className="font-bold text-lg text-green-600">
                          {spot.totalSlots || 0}
                        </span>
                      </div>
                      {spot.pricePerHour && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Price/Hour
                          </span>
                          <span className="font-semibold text-blue-600">
                            ₹{spot.pricePerHour}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <a
                        href={spot.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                      >
                        📍 View on Map
                      </a>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Payment />}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                        onClick={() => handleChooseSlot(spot)}
                        disabled={!spot.totalSlots || spot.totalSlots === 0}
                      >
                        {spot.totalSlots > 0 ? "Book Slot" : "Full"}
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleChooseRandom(spot)}
                        disabled={spot.totalSlots === 0}
                        className="w-full text-xs sm:text-sm py-2"
                        sx={{
                          borderColor: "#2563eb",
                          color: "#2563eb",
                          "&:hover": {
                            borderColor: "#1d4ed8",
                            backgroundColor: "#f0f9ff",
                          },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          padding: { xs: "6px 12px", sm: "8px 16px" },
                        }}
                      >
                        Choose Randomly
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableSpaces;
