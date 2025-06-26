package com.parkease.dtos;





import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.AssertTrue;



public class BookingUpdateRequest {
    private String arrivalTime;
    private String departureTime;

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }
}

