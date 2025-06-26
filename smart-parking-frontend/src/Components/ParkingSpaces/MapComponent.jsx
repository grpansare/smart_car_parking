import React, { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Button } from "@mui/material"; // Corrected import for MUI
import "leaflet/dist/leaflet.css"; // Make sure you have Leaflet styles


const PUNE_COORDS = [18.5204, 73.8567];
const MAP_ZOOM = 13;

// Component to dynamically change map center
const DynamicMapCenter = React.memo(({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (
      center &&
      Array.isArray(center) &&
      center.length === 2 &&
      typeof center[0] === "number" &&
      typeof center[1] === "number"
    ) {
      map.setView(center, MAP_ZOOM);
    }
  }, [center, map]);

  return null;
});

const Mapcomponent = ({ geoLocations, getMarkerIcon, handleChooseSlot, handleChooseRandom }) => {
  const [mapCenter, setMapCenter] = useState(PUNE_COORDS);

  return (
    <div>
      <div className={` rounded-lg overflow-hidden shadow-lg`}>
        <MapContainer
          center={mapCenter}
          zoom={MAP_ZOOM}
          style={{ height: "450px", width: "100%" }}
          className="z-10"
        >
          <DynamicMapCenter center={mapCenter} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
          />

          {geoLocations.map((space, index) => (
            <Marker
              key={`${space.spaceId}-${index}`}
              position={[space.latitude, space.longitude]}
              icon={getMarkerIcon(space.totalSlots)}
            >
              <Popup className="custom-popup">
                <div className="p-3 sm:p-4 w-full min-w-0 max-w-xs sm:max-w-sm md:max-w-md">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-2 truncate">
                    {space.lotName}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed break-words">
                    {space.address}
                  </p>

                  <div className="mb-4 text-xs sm:text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex-shrink-0">Available slots:</span>
                      <span
                        className={`font-semibold ml-2 ${
                          space.totalSlots > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {space.totalSlots}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex-shrink-0">Price/hour:</span>
                      <span className="font-semibold text-blue-600 ml-2">
                        ₹{space.pricingPerHour}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-3">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleChooseSlot(space)}
                      disabled={space.totalSlots === 0}
                      className="w-full text-xs sm:text-sm py-2"
                      sx={{
                        backgroundColor: "#2563eb",
                        "&:hover": { backgroundColor: "#1d4ed8" },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "6px 12px", sm: "8px 16px" },
                      }}
                    >
                      Choose Slot
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleChooseRandom(space)}
                      disabled={space.totalSlots === 0}
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
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Mapcomponent;
