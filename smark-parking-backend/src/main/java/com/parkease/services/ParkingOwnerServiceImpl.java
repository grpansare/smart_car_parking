package com.parkease.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.parkease.beans.ParkingOwner;
import com.parkease.beans.ParkingSlot;
import com.parkease.beans.ParkingSpace;
import com.parkease.beans.User;
import com.parkease.dao.ParkingOwnerRepo;
import com.parkease.dao.ParkingSpaceRepo;
import com.parkease.dao.ParkingUserRepo;
import com.parkease.dtos.NominatimResponse;
import com.parkease.dtos.ParkingSpaceDto;
import com.parkease.dtos.Role;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class ParkingOwnerServiceImpl implements ParkingOwnerService{
	
	@Autowired
	ParkingOwnerRepo parkingOwnerRepo;
	@Autowired
	ParkingSpaceRepo parkingSpaceRepo;
	
	@Autowired
	PasswordEncoder encoder;

	@Autowired
    private JavaMailSender mailSender;

	@Override
	public ParkingOwner createParkignOwner(ParkingOwner parkingOwner) {
	    // First, save the ParkingOwner
		
	    parkingOwner.setRoles(Set.of(Role.ROLE_PARKING_OWNER));
	  parkingOwner.setPassword(encoder.encode(  parkingOwner.getPassword()));
	    parkingOwner.setUsername(parkingOwner.getEmail());
	    parkingOwner.setRoles(Set.of(Role.ROLE_PARKING_OWNER));
	    ParkingOwner savedOwner = parkingOwnerRepo.save(parkingOwner);
         
	    // Now, associate the saved owner with ParkingSpace
	    ParkingSpace parkingSpace = savedOwner.getParkingSpaces().get(0);
	    parkingSpace.setParkingowner(savedOwner);
	    parkingOwner.setUsername(parkingOwner.getEmail());
	
	    parkingSpaceRepo.save(parkingSpace);
        try {
			sendApprovalPendingEmail(savedOwner);
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	    return savedOwner;
	}

	@Override
	public List<ParkingOwner> getAllParkingOwners() {
		// TODO Auto-generated method stub
		
		List<ParkingOwner> parkingOwners=parkingOwnerRepo.findAll();
		return parkingOwners;
	}

	@Override
	public boolean acceptOwnerRequest(long id) {
	    Optional<ParkingOwner> ownerOp = parkingOwnerRepo.findById(id);
	    if (ownerOp.isPresent()) {
	        ParkingOwner owner = ownerOp.get();
	        List<ParkingSpace> spaces = owner.getParkingSpaces();

	        if (spaces.isEmpty()) {
	            return false; 
	        }

	        ParkingSpace parkingSpace = spaces.get(0);
	        List<ParkingSlot> slots = new ArrayList<>();
            int slotsPerFloor=parkingSpace.getTotalSlots()/parkingSpace.getNumberOfFloors();
            
	        for (int i = 0; i < parkingSpace.getNumberOfFloors(); i++) {
	        	for(int j=0;j<slotsPerFloor;j++) {
	        		 ParkingSlot slot = new ParkingSlot(i + 1, true);
	        		 slot.setFloorNumber(i+1);
	 	            slot.setParkingSpace(parkingSpace); // Ensure bidirectional mapping
	 	            slots.add(slot);
	 	        }
	        	}	
	           
	        

	        // Ensure slots are correctly assigned
	        parkingSpace.setParkingSlot(slots);

	        // If necessary, update the spaces list (not needed if bidirectional mapping works)
	        owner.setStatus("Accepted");
	        parkingOwnerRepo.save(owner); // Save the updated owner along with changes
	        try {
				sendApprovalEmail(owner.getEmail(),owner.getFullname());
			} catch (MessagingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	        return true;
	    }
	    return false;
	}
	 public void sendApprovalEmail(String toEmail, String parkingOwnerName) throws MessagingException {
	        String subject = "Your Parking Request Has Been Approved!";
	        
	        // Styled HTML body for the email
	        String body = "<html>" +
	                      "<body style='font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;'>" +
	                      "<div style='background-color: #fff; padding: 20px; margin: 0 auto; width: 600px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);'>" +
	                      "<h2 style='color: #4CAF50;'>Dear " + parkingOwnerName + ",</h2>" +
	                      "<p style='font-size: 16px;'>We are pleased to inform you that your parking request has been <strong>approved</strong> by the admin.</p>" +
	                      "<p style='font-size: 16px;'>You can now manage your parking space through our platform. If you have any questions, feel free to contact us.</p>" +
	                      "<br>" +
	                      "<p style='font-size: 16px;'>Best regards,</p>" +
	                      "<p style='font-size: 16px;'>The Parking System Team</p>" +
	                      "<div style='text-align: center; margin-top: 30px;'>" +
	                      "<a href='http://yourparkingportal.com' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Go to Your Dashboard</a>" +
	                      "</div>" +
	                      "</div>" +
	                      "</body>" +
	                      "</html>";

	        MimeMessage message = mailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(message, true);
	        
	        helper.setTo(toEmail);
	        helper.setSubject(subject);
	        helper.setText(body, true);  // Set to true to send HTML email

	        mailSender.send(message);
	    }
	@Override
	public boolean rejectOwnerRequest(long id) {
		Optional<ParkingOwner> ownerop=parkingOwnerRepo.findById(id);
		if(ownerop.isPresent()) {
			ParkingOwner owner=ownerop.get();
			owner.setStatus("Rejected");
			parkingOwnerRepo.save(owner);
			return true;
		}
		return false;  
		
	}

	@Override
	public ParkingSpace getParkingSpace(String email) {
		ParkingOwner owner=parkingOwnerRepo.findByEmail(email);
	
		return owner.getParkingSpaces().get(0);
	}

	@Override
	public ParkingOwner getProfile(String email) {
		// TODO Auto-generated method stub
		return parkingOwnerRepo.findByEmail(email);
	}

	 

	 

	  

	 public void sendApprovalPendingEmail(ParkingOwner owner  ) throws MessagingException {
	       
	        String subject = "Your Parking Owner Registration - Awaiting Approval";

	        String htmlContent = """
	             <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4A90E2; color: white; padding: 15px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #4A90E2; }
          .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Registration Received</h2>
          </div>
          <div class="content">
            <p>Dear %s,</p>
            
            <p>Thank you for registering as a parking owner on our Parking System. We're excited to have you join our community of parking facility providers.</p>
            
            <p>Your registration details have been successfully received and are now pending administrative approval. Our team will review your information to ensure everything meets our platform standards.</p>
            
            <div class="details">
              <strong>Registration Details:</strong><br>
              Facility Name: %s<br>
           
              Registration ID: %s
            </div>
            
            <p><strong>What happens next:</strong></p>
            <ol>
              <li>Our administrative team will review your application (typically within 2-3 business days)</li>
              <li>You'll receive an email notification once your account is approved</li>
              <li>Upon approval, you'll gain access to the parking owner dashboard</li>
            </ol>
            
            <p>If you have any questions during this process or need to update your information, please contact our support team at support@parkingsystem.com or call (555) 123-4567.</p>
            
            <p>Thank you for choosing our Parking System. We look forward to a successful partnership.</p>
            
            <p>Best regards,<br>
            The Parking System Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2025 Parking System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
	            """.formatted(owner.getFullname(),owner.getParkingSpaces().get(0).getLotName(),owner.getUserId());

	        sendHtmlEmail(owner.getEmail(), subject, htmlContent);
	    }

	    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
	        MimeMessage message = mailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

	        helper.setTo(to);
	        helper.setSubject(subject);
	        helper.setText(htmlContent, true); // true for HTML

	        mailSender.send(message);
	    }
	   

}
