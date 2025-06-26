package com.parkease.enums;



public enum BookingStatus {
    BOOKED,           // Booking confirmed and upcoming
    IN_PROGRESS,      // User is currently using the slot
    COMPLETED,        // Booking successfully finished
    CANCELLED,        // Cancelled by user or system
    NO_SHOW,          // User did not show up
    EXPIRED,          // Automatically expired due to time
    PENDING_PAYMENT,  // Awaiting payment confirmation
    PAYMENT_FAILED,   // Payment failed
    REFUNDED          // Refund processed for cancelled booking
}
