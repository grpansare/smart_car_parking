import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  arrivalTime: null,
  departureTime: null,
  currentLocation: null,
  ownerDetails: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log(action.payload);
      state.currentUser = action.payload;
    },
    Logout: (state) => {
      state.currentUser = null;
      state.arrivalTime = null;
      state.departureTime = null;
      state.searchedPlace = null;
      state.currentLocation = null;
    },
    setArrivalTime: (state, action) => {
      state.arrivalTime = action.payload;
    },
    setDepartureTime: (state, action) => {
      state.departureTime = action.payload;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setOwnerDetails: (state, action) => {
      state.ownerDetails = action.payload;
    },
  },
});

export const {
  setUser,
  Logout,
  setArrivalTime,
  setDepartureTime,
  setCurrentLocation,
  setOwnerDetails
} = userSlice.actions;
export default userSlice.reducer;
