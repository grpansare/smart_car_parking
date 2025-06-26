package com.parkease.dtos;

import java.util.List;

import com.parkease.beans.Vehicle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString

public class AuthResponse {
	  private String accessToken;
	    private String refreshToken;
    private Long userId;
    private String username;
    private String fullname;
    private String email;
    private String contactno;
    private String profileImage;
    private List<Vehicle> vehicleInfo;
	public AuthResponse(String accessToken, String refreshToken) {
		super();
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}
    

   
    
}

