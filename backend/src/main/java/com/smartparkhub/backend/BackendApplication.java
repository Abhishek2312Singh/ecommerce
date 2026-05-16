package com.smartparkhub.backend;

import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.enums.Role;
import com.smartparkhub.backend.repository.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	/**
	 * Seed default accounts on first startup (runs only if the users table is empty).
	 *
	 * Default Super Admin credentials:
	 *   Email    : superadmin@smartparkhub.com
	 *   Password : SuperAdmin@123
	 */
	@Bean
	CommandLineRunner seedDefaultUsers(UserRepo userRepo) {
		return args -> {
			if (userRepo.count() > 0) {
				System.out.println("[SmartParkHub] Database already seeded — skipping default user creation.");
				return;
			}

			// ── Super Admin (system-wide, no campus restriction) ────────────
			userRepo.save(buildUser(
					"Super Admin",
					"superadmin@smartparkhub.com",
					"SuperAdmin@123",
					Role.SUPER_ADMIN,
					"main",      // campus — use any valid value; SA has access to all
					null,        // batch — not applicable
					"SA-0001",   // collegeId / employeeId
					null,        // license
					null         // vehicle
			));

			// ── Campus Admin (Main Campus) ───────────────────────────────────
			userRepo.save(buildUser(
					"Main Campus Admin",
					"admin@smartparkhub.com",
					"Admin@123",
					Role.ADMIN,
					"main",
					null,
					"ADMIN-0001",
					null,
					null
			));

			// ── Demo Student (Main Campus) ───────────────────────────────────
			userRepo.save(buildUser(
					"Demo Student",
					"student@smartparkhub.com",
					"Student@123",
					Role.STUDENT,
					"main",
					"BCA 2023-26",   // batch — required for students
					"23BCA1001",
					"DL-STU-001",
					"UP14 AB 1234"
			));

			// ── Demo Faculty (Main Campus) ───────────────────────────────────
			userRepo.save(buildUser(
					"Demo Faculty",
					"faculty@smartparkhub.com",
					"Faculty@123",
					Role.FACULTY,
					"main",
					null,           // batch — not applicable
					"FAC-0001",
					"DL-FAC-001",
					"UP14 CD 5678"
			));

			// ── Demo Staff (Main Campus) ─────────────────────────────────────
			userRepo.save(buildUser(
					"Demo Staff",
					"staff@smartparkhub.com",
					"Staff@123",
					Role.STAFF,
					"main",
					null,           // batch — not applicable
					"STF-0001",
					"DL-STF-001",
					"UP14 EF 9012"
			));

			System.out.println("[SmartParkHub] ✅ Default accounts created:");
			System.out.println("  SUPER_ADMIN : superadmin@smartparkhub.com / SuperAdmin@123");
			System.out.println("  ADMIN       : admin@smartparkhub.com       / Admin@123");
			System.out.println("  STUDENT     : student@smartparkhub.com     / Student@123");
			System.out.println("  FACULTY     : faculty@smartparkhub.com     / Faculty@123");
			System.out.println("  STAFF       : staff@smartparkhub.com       / Staff@123");
		};
	}

	/** Build a User entity with all common fields. */
	private User buildUser(String name, String email, String password,
						   Role role, String campus, String batch,
						   String collegeId, String license, String vehicle) {
		User user = new User();
		user.setName(name);
		user.setEmail(email);
		user.setPassword(password);
		user.setRole(role);
		user.setCampus(campus);
		user.setBatch(batch);
		user.setCollegeId(collegeId);
		user.setLicense(license);
		user.setVehicle(vehicle);
		return user;
	}
}
