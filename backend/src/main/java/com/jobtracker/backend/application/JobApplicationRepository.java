package com.jobtracker.backend.application;

import com.jobtracker.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    // This allows us to find all applications belonging to a specific user
    List<JobApplication> findByUserOrderByAppliedDateDesc(User user);
}