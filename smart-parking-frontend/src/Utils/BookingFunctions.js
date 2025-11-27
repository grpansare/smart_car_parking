import axios from "axios";

export const cancelBooking = async (selectedSlot, selectedSpot) => {
  console.log(selectedSpot);

  try {
    const response = await axios.put(
      `https://smart-car-parking-wa4f.onrender.com/parkingspaces/cancelbooking/${selectedSlot}`,
      { spaceId: selectedSpot.spaceIdd || selectedSpot.spaceId},
      { withCredentials: true }
    );
  } catch (err) {
    console.log(err);
  }
};
