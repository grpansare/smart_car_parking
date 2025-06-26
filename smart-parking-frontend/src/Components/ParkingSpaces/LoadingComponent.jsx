import { Car, Map } from "lucide-react";

  // Enhanced Loading Component
 export const LoadingComponent = () => (
    <div className="flex flex-col justify-center items-center h-96 space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <Car className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse" />
      </div>
      <div className="text-blue-600 font-semibold text-xl animate-pulse">
        Finding parking spots...
      </div>
      <div className="text-gray-500 text-sm">
        This may take a few moments
      </div>
    </div>
  );


    // Map Loading Component
   export const MapLoadingComponent = () => (
      <div className="flex flex-col justify-center items-center h-96 space-y-4 bg-white rounded-lg shadow-lg">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
          <Map className="absolute inset-0 m-auto h-8 w-8 text-green-600 animate-pulse" />
        </div>
        <div className="text-green-600 font-semibold text-xl animate-pulse">
          Loading map locations...
        </div>
        <div className="text-gray-500 text-sm">
          Geocoding addresses and preparing map
        </div>
      </div>
    );