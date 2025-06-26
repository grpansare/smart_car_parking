package com.parkease.services;

import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpHeaders;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.parkease.beans.Booking;
import com.parkease.beans.ParkingOwner;
import com.parkease.beans.ParkingSlot;
import com.parkease.beans.ParkingSpace;
import com.parkease.beans.ParkingUser;
import com.parkease.beans.User;
import com.parkease.dao.BookingRepository;
import com.parkease.dao.ParkingSlotRepository;
import com.parkease.dao.ParkingSpaceRepo;
import com.parkease.dao.UserRepository;
import com.parkease.dtos.BookingRequest;
import com.parkease.dtos.BookingResponse;
import com.parkease.dtos.BookingUpdateRequest;
import com.parkease.exceptions.ResourceNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class BookingService {
	 @Autowired
	    private BookingRepository bookingRepository;
	 
	 @Autowired
	 private ParkingSlotRepository parkingSlotRepository;
	 
	 @Autowired
	 private ParkingSpaceRepo parkingSpaceRepo;
	 @Autowired
	 private UserRepository userRepository;;;

	    public Booking saveBooking(BookingRequest bookingReq, Long slotId) {
	    	  System.out.println("================="+bookingReq.getCarNumber());
	    	 ParkingSpace parkingSpace=parkingSpaceRepo.findById(bookingReq.getParkingLotId()).get();
	    	 ParkingOwner owner=parkingSpace.getParkingowner();
	    	  System.out.println();
	    	 owner.setTotalEarning(owner.getTotalEarning()+bookingReq.getAmount());
	    	 parkingSpace.setParkingowner(owner);
	    	 
	    	 parkingSpaceRepo.save(parkingSpace);
	    	 Booking booking=new Booking();
	    	 booking.setUserId(bookingReq.getUserId());
	    	 booking.setParkingLotId(bookingReq.getParkingLotId());
	    	 booking.setAmount(bookingReq.getAmount());
	    	 booking.setBookingStatus("Pending");
	    	 booking.setCarNumber(bookingReq.getCarNumber());
	    	 booking.setPaymentStatus("Completed");
	    	 
	    	if (bookingReq.getArrivalTime() != null) {
	    		booking.setArrivalTime(bookingReq.getArrivalTime());
	        }
	        if (bookingReq.getDepartureTime() != null) {
	            booking.setDepartureTime(bookingReq.getDepartureTime());
	        }
	    	ParkingSlot parkingSlot=parkingSlotRepository.findById(slotId).get();
	    	parkingSlot.getBookings().add(booking);
	    	booking.setParkingSlot(parkingSlot);
	    	
	    	
	    
	        return bookingRepository.save(booking);
	    }
	    public Booking updateBookingTimes(Long bookingId, BookingUpdateRequest request) {
	        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
	        if (optionalBooking.isEmpty()) {
	            throw new RuntimeException("Booking not found with ID: " + bookingId);
	        }

	        Booking booking = optionalBooking.get();
	        booking.setArrivalTime(request.getArrivalTime());
	        booking.setDepartureTime(request.getDepartureTime());

	        return bookingRepository.save(booking);
	    }

		public List<BookingResponse> getBookings(long id) {
			// TODO Auto-generated method stub
			
			
			List<Booking> bookings= bookingRepository.findByParkingLotId(id);
			List<BookingResponse> bookingResponses=new ArrayList<>();
			for(Booking booking:bookings) {
				BookingResponse bookingResponse=new BookingResponse();
				bookingResponse.setAmount(booking.getAmount());
				bookingResponse.setArrivalTime(booking.getArrivalTime());
				bookingResponse.setDepartureTime(booking.getDepartureTime());
				bookingResponse.setId(booking.getId());
				bookingResponse.setCarNumber(booking.getCarNumber());
				ParkingSpace parkingSpace=parkingSpaceRepo.findById(booking.getParkingLotId()).get();
				if(booking.getUserId() !=null) {
					
					User parkingUser=userRepository.findById(booking.getUserId()).get();
					bookingResponse.setParkingUser(parkingUser);
				}
				bookingResponse.setBookingStatus(booking.getBookingStatus());
				bookingResponse.setParkingLotName(parkingSpace.getLotName());
				bookingResponses.add(bookingResponse);
				
				
				
			}
			return bookingResponses;
		}

		public List<BookingResponse> getUserBookings(Long userId) {
			List<Booking> bookings= bookingRepository.findByUserId(userId);
			List<BookingResponse> bookingResponses=new ArrayList<>();
			for(Booking booking:bookings) {
				BookingResponse bookingResponse=new BookingResponse();
				bookingResponse.setAmount(booking.getAmount());
				bookingResponse.setArrivalTime(booking.getArrivalTime());
				bookingResponse.setDepartureTime(booking.getDepartureTime());
				bookingResponse.setId(booking.getId());
				bookingResponse.setCarNumber(booking.getCarNumber());
				ParkingSpace parkingSpace=null;
				if(booking.getParkingLotId() != 1) {
				parkingSpace=  parkingSpaceRepo.findById(booking.getParkingLotId()).get();
				}
				
			                     
				bookingResponse.setBookingStatus(booking.getBookingStatus());
				
				if(parkingSpace != null) {
					bookingResponse.setAddress(parkingSpace.getAddress());
					bookingResponse.setParkingLotName(parkingSpace.getLotName());
				}
				
				bookingResponses.add(bookingResponse);
				
				
				
			}
			return bookingResponses;
		
			
		}

		public void changeStatus(long bookingId) {
			 Optional<Booking> op=bookingRepository.findById(bookingId);
			 if(op.isPresent()) {
				Booking booking= op.get();
				
			 }
			
		}
		
		 @Transactional
		    public Booking updateBookingStatus(Long bookingId, String newStatus) {
		        Booking booking = bookingRepository.findById(bookingId)
		                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
		        
		        // Validate the status
		        if (!isValidStatus(newStatus)) {
		            throw new IllegalArgumentException("Invalid status: " + newStatus);
		        }
		        
		        booking.setBookingStatus(newStatus);
		        return bookingRepository.save(booking);
		    }
		   private boolean isValidStatus(String status) {
		        return status.equals("Active") || status.equals("Completed") || status.equals("Canceled");
		    }
	    
	   
}
