import axios from "axios";

export const cancelBooking = async (selectedSlot, selectedSpot) => {
  console.log(selectedSpot);

  try {
    const response = await axios.put(
      `http://localhost:8081/parkingspaces/cancelbooking/${selectedSlot}`,
      { spaceId: selectedSpot.spaceIdd || selectedSpot.spaceId},
      { withCredentials: true }
    );
  } catch (err) {
    console.log(err);
  }
};
