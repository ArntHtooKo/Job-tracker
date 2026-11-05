package com.jobtracker.backend.application;

import com.jobtracker.backend.user.User;
import com.jobtracker.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.jobtracker.backend.file.S3Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

        public JobApplicationController(JobApplicationRepository applicationRepository, UserRepository userRepository, S3Service s3Service) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
    }
    
        @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Controller is working!");
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public record ApplicationRequest(String companyName, String jobTitle, ApplicationStatus status, LocalDate appliedDate) {}

    @GetMapping
    public ResponseEntity<?> getAllApplications() {
        try {
            User user = getCurrentUser();
            return ResponseEntity.ok(applicationRepository.findByUserOrderByAppliedDateDesc(user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody ApplicationRequest request) {
        try {
            User user = getCurrentUser();
            JobApplication app = new JobApplication(
                    request.companyName(),
                    request.jobTitle(),
                    request.status() != null ? request.status() : ApplicationStatus.APPLIED,
                    request.appliedDate() != null ? request.appliedDate() : LocalDate.now(),
                    user
            );
            return ResponseEntity.ok(applicationRepository.save(app));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
        @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(@PathVariable Long id, @RequestBody ApplicationRequest request) {
        try {
            User user = getCurrentUser();
            JobApplication app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Compare emails to be safe with Lazy Loading
            if (!app.getUser().getEmail().equals(user.getEmail())) {
                return ResponseEntity.status(403).body("You can only update your own applications");
            }

            app.setCompanyName(request.companyName());
            app.setJobTitle(request.jobTitle());
            app.setStatus(request.status());
            if (request.appliedDate() != null) {
                app.setAppliedDate(request.appliedDate());
            }

            return ResponseEntity.ok(applicationRepository.save(app));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            JobApplication app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Compare emails to be safe with Lazy Loading
            if (!app.getUser().getEmail().equals(user.getEmail())) {
                return ResponseEntity.status(403).body("You can only delete your own applications");
            }

            applicationRepository.delete(app);
            return ResponseEntity.ok("Application deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
        @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadCv(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            User user = getCurrentUser();
            JobApplication app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (!app.getUser().getEmail().equals(user.getEmail())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }

            String fileName = s3Service.uploadFile(file);
            app.setCvFileName(fileName);
            applicationRepository.save(app);

            return ResponseEntity.ok("File uploaded successfully: " + fileName);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
