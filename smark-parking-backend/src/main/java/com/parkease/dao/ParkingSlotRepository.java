package com.parkease.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.parkease.beans.ParkingSlot;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long>{
	 @Query("SELECT s FROM ParkingSlot s WHERE s.isAvailable = true")
	    List<ParkingSlot> findAvailableSlots();

	Optional<ParkingSlot> findFirstByParkingSpaceIdAndIsAvailableTrue(long spaceId);

	Optional<ParkingSlot> findBySlotNumberAndParkingSpaceIdAndIsAvailableTrue(long slotNumber, long spaceId);
}
