package com.parkease.beans;



import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    private int slotNumber;

    private boolean isAvailable;
    private int floorNumber;
    
    @ManyToOne
    @JoinColumn(name = "parkingspace_id")
    @JsonBackReference
    private ParkingSpace parkingSpace;
    
    @OneToMany(mappedBy = "parkingSlot",cascade = CascadeType.ALL)
	private List<Booking> bookings;

    public ParkingSlot() {
    }

    public ParkingSlot(int slotNumber, boolean isAvailable) {
        this.slotNumber = slotNumber;
        this.isAvailable = isAvailable;
    }


	public int getFloorNumber() {
		return floorNumber;
	}

	public void setFloorNumber(int floorNumber) {
		this.floorNumber = floorNumber;
	}

	public Long getSlotId() {
        return slotId;
    }
   
   

	public List<Booking> getBookings() {
		return bookings;
	}

	public void setBookings(List<Booking> bookings) {
		this.bookings = bookings;
	}

	public ParkingSpace getParkingSpace() {
		return parkingSpace;
	}

	public void setParkingSpace(ParkingSpace parkingSpace) {
		this.parkingSpace = parkingSpace;
	}

	public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public int getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(int slotNumber) {
        this.slotNumber = slotNumber;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }
}