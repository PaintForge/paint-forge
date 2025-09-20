import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaintSchema, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, insertFeedbackSchema } from "@shared/schema";
import { scrapeAllCitadelPaints, scrapeKnownCitadelCategories } from "./citadel-scraper";
import { getAllCitadelPaints, getCitadelPaintsByType, searchCitadelPaints } from "./citadel-paint-database";
import { hashPassword, comparePassword, generateToken, requireAuth, sendVerificationEmail, type AuthenticatedRequest } from "./auth";
import { sendPasswordResetEmail } from "./email";


export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      const result = await storage.requestPasswordReset(validatedData.email);
      
      // Always return success to prevent email enumeration
      res.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      });
      
      // Send email if user exists
      if (result) {
        await sendPasswordResetEmail(result.email, result.token);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Password reset request failed" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      const success = await storage.verifyPasswordReset(validatedData.token, validatedData.password);
      
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      res.json({
        message: "Password reset successfully. You can now log in with your new password.",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Password reset failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Validate captcha
      const { captchaAnswer, captchaExpectedAnswer } = req.body;
      if (!captchaAnswer || !captchaExpectedAnswer) {
        return res.status(400).json({ message: "Invalid captcha answer. Please try again." });
      }
      
      const userAnswer = parseInt(captchaAnswer);
      if (isNaN(userAnswer) || userAnswer !== captchaExpectedAnswer) {
        return res.status(400).json({ message: "Invalid captcha answer. Please try again." });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Send verification email
      await sendVerificationEmail(user.email, user.verificationToken!);

      res.status(201).json({
        message: "Account created successfully. Please check your email to verify your account.",
        userId: user.id,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(401).json({ message: "Please verify your email before logging in" });
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Verification token required" });
      }

      const success = await storage.verifyUserEmail(token);
      if (success) {
        res.json({ message: "Email verified successfully! You can now log in." });
      } else {
        res.status(400).json({ message: "Invalid or expired verification token" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        profileImageUrl: user.profileImageUrl,
        isAdmin: user.isAdmin,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  app.patch("/api/auth/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { firstName, lastName } = req.body;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }

      const updatedUser = await storage.updateUser(req.user!.id, {
        firstName,
        lastName,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        emailVerified: updatedUser.emailVerified,
        profileImageUrl: updatedUser.profileImageUrl,
        isAdmin: updatedUser.isAdmin,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch("/api/auth/profile-image", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { profileImageUrl } = req.body;
      
      if (!profileImageUrl) {
        return res.status(400).json({ message: "Profile image is required" });
      }

      const updatedUser = await storage.updateUser(req.user!.id, {
        profileImageUrl,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        emailVerified: updatedUser.emailVerified,
        profileImageUrl: updatedUser.profileImageUrl,
        isAdmin: updatedUser.isAdmin,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update profile image" });
    }
  });

  app.patch("/api/auth/password", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      // Get current user to verify current password
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      const updatedUser = await storage.updateUser(req.user!.id, {
        password: hashedNewPassword,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Password updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Email Change Request
  app.post("/api/auth/request-email-change", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { newEmail } = req.body;
      
      if (!newEmail) {
        return res.status(400).json({ message: "New email is required" });
      }

      const { token, pendingEmail } = await storage.requestEmailChange(req.user!.id, newEmail);
      
      // Send verification email
      await sendVerificationEmail(newEmail, token);
      
      res.json({ 
        message: "Verification email sent to your new email address",
        pendingEmail
      });
    } catch (error: any) {
      if (error.message === "Email address is already in use") {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to request email change" });
      }
    }
  });

  // Email Change Verification
  app.get("/api/auth/verify-email-change", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Verification token required" });
      }

      const success = await storage.verifyEmailChange(token);
      if (success) {
        res.json({ message: "Email address updated successfully!" });
      } else {
        res.status(400).json({ message: "Invalid or expired verification token, or email address is no longer available" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, async (req: AuthenticatedRequest, res) => {
    // Check if user is admin
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      // Get user statistics
      const userStats = await storage.getUserStats();
      
      // Get paint statistics
      const paintStats = await storage.getPaintStats();
      
      // Get project statistics
      const projectStats = await storage.getProjectStats();
      
      // Get recent signups
      const recentSignups = await storage.getRecentSignups();
      
      // Get popular paints
      const popularPaints = await storage.getPopularPaints();
      
      // System health (mock data for now)
      const systemHealth = {
        uptime: process.uptime(),
        lastBackup: new Date().toISOString().split('T')[0],
        errorRate: 0.1
      };

      res.json({
        totalUsers: userStats.total,
        verifiedUsers: userStats.verified,
        unverifiedUsers: userStats.unverified,
        totalPaints: paintStats.total,
        totalProjects: projectStats.total,
        recentSignups,
        popularPaints,
        systemHealth
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch admin stats" });
    }
  });

  // Feedback routes
  app.post('/api/feedback', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = insertFeedbackSchema.parse(req.body);
      
      // Get user information for email notification
      const user = await storage.getUser(authReq.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const feedback = await storage.createFeedback({
        ...validatedData,
        userId: authReq.user!.id,
      });

      // Send email notification to support@paintsforge.com
      const { sendFeedbackNotification } = await import('./email');
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email;
      
      await sendFeedbackNotification(
        validatedData.type,
        validatedData.message,
        user.email,
        userName
      );
      
      res.status(201).json(feedback);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to submit feedback" });
    }
  });

  app.get('/api/feedback', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userFeedback = await storage.getFeedback(authReq.user!.id);
      res.json(userFeedback);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to retrieve feedback" });
    }
  });

  app.get('/api/admin/feedback', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.user!.id);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to retrieve feedback" });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", requireAuth, async (req: AuthenticatedRequest, res) => {
    // Check if user is admin
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isAdmin: u.isAdmin,
        emailVerified: u.emailVerified,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        paintCount: u.paintCount,
        projectCount: u.projectCount
      }));
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/toggle-admin", requireAuth, async (req: AuthenticatedRequest, res) => {
    // Check if user is admin
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const userId = parseInt(req.params.id);
      
      // Prevent user from removing their own admin status
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "Cannot modify your own admin status" });
      }

      const updatedUser = await storage.toggleUserAdmin(userId);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const safeUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isAdmin: updatedUser.isAdmin,
        emailVerified: updatedUser.emailVerified,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt
      };

      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to toggle admin status" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    // Check if user is admin
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const userId = parseInt(req.params.id);
      
      // Prevent user from deleting themselves
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete user" });
    }
  });

  // Paint routes
  app.get("/api/paints", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Only return paints owned by the authenticated user
      const paints = await storage.getAllPaints(req.user!.id);
      res.json(paints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch paints" });
    }
  });

  // All available paints from comprehensive database (for showcases)
  app.get("/api/paints/all", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Import all paint databases
      const { getAllCitadelPaints } = await import("./citadel-paint-database");
      const { getAllVallejoPaints } = await import("./vallejo-complete-database");
      const { getAllArmyPainterPaints } = await import("./army-painter-database");
      const { getAllScale75Paints } = await import("./scale75-database");
      const { getAllTwoThinCoatsPaints } = await import("./two-thin-coats-database");
      const { getAllReaperPaints } = await import("./reaper-database");

      // Combine all paints and format for showcase use
      const allPaints = [
        ...getAllCitadelPaints().map((paint, index) => ({
          id: `citadel-${index}`,
          name: paint.name,
          brand: "Citadel",
          color: paint.hexCode || paint.color,
          type: paint.type
        })),
        ...getAllVallejoPaints().map((paint, index) => ({
          id: `vallejo-${index}`,
          name: paint.name,
          brand: "Vallejo",
          color: paint.color,
          type: paint.type
        })),
        ...getAllArmyPainterPaints().map((paint, index) => ({
          id: `army-painter-${index}`,
          name: paint.name,
          brand: "Army Painter",
          color: paint.color,
          type: paint.type
        })),
        ...getAllScale75Paints().map((paint, index) => ({
          id: `scale75-${index}`,
          name: paint.name,
          brand: "Scale75",
          color: paint.color,
          type: paint.type
        })),
        ...getAllTwoThinCoatsPaints().map((paint, index) => ({
          id: `two-thin-coats-${index}`,
          name: paint.name,
          brand: "Two Thin Coats",
          color: paint.color,
          type: paint.type
        })),
        ...getAllReaperPaints().map((paint, index) => ({
          id: `reaper-${index}`,
          name: paint.name,
          brand: "Reaper",
          color: paint.color,
          type: paint.type
        }))
      ];

      // Sort alphabetically by brand, then name
      allPaints.sort((a, b) => {
        if (a.brand !== b.brand) {
          return a.brand.localeCompare(b.brand);
        }
        return a.name.localeCompare(b.name);
      });

      res.json(allPaints);
    } catch (error) {
      console.error("Error fetching all paints:", error);
      res.status(500).json({ message: "Failed to fetch all paints" });
    }
  });

  app.get("/api/paints/search", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const query = req.query.q as string;
      console.log(`Received search request with query: "${query}"`);
      
      if (!query || query.length < 2) {
        console.log("Query too short, returning empty array");
        return res.json([]);
      }
      
      console.log("Searching entire paint database for autocomplete...");
      const allPaints = await storage.getAllPaints(); // Get all paints, not user-specific
      console.log(`Successfully retrieved ${allPaints.length} total paints from database`);
      
      if (allPaints.length === 0) {
        console.log("No paints found in database");
        return res.json([]);
      }
      
      console.log("Filtering paints...");
      const filteredPaints = allPaints.filter(paint => {
        const nameMatch = paint.name && paint.name.toLowerCase().includes(query.toLowerCase());
        const brandMatch = paint.brand && paint.brand.toLowerCase().includes(query.toLowerCase());
        return nameMatch || brandMatch;
      }).slice(0, 10);
      
      console.log(`Filtered to ${filteredPaints.length} matching paints`);
      console.log("Sample paint:", allPaints[0]);
      res.json(filteredPaints);
    } catch (error) {
      console.error("Paint search error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : error);
      res.status(500).json({ 
        message: "Failed to search paints", 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get("/api/paints/:id", async (req, res) => {
    try {
      const paint = await storage.getPaint(Number(req.params.id));
      if (!paint) {
        return res.status(404).json({ message: "Paint not found" });
      }
      res.json(paint);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch paint" });
    }
  });

  app.post("/api/paints", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertPaintSchema.parse(req.body);
      // Override userId with authenticated user's ID
      const paint = await storage.createPaint({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(paint);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add paint" });
    }
  });

  app.delete("/api/paints/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const paintId = parseInt(req.params.id);
      const paint = await storage.getPaint(paintId);
      
      if (!paint) {
        return res.status(404).json({ message: "Paint not found" });
      }
      
      // Check if paint belongs to authenticated user
      if (paint.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this paint" });
      }
      
      await storage.deletePaint(paintId);
      res.json({ message: "Paint deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete paint" });
    }
  });

  // Project routes
  app.get("/api/projects", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projects = await storage.getAllProjects(req.user!.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if project belongs to authenticated user
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this project" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description, imageUrl, paints } = req.body;
      
      const project = await storage.createProject({
        name,
        description,
        imageUrl,
        userId: req.user!.id,
      });
      
      // Add paints to project if provided
      if (paints && paints.length > 0) {
        for (const paintData of paints) {
          await storage.addPaintToProject(project.id, paintData);
        }
      }
      
      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { name, description, imageUrl } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if project belongs to authenticated user
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this project" });
      }
      
      const updatedProject = await storage.updateProject(projectId, {
        name,
        description,
        imageUrl,
      });
      
      res.json(updatedProject);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if project belongs to authenticated user
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this project" });
      }
      
      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project paint routes
  app.post("/api/projects/:id/paints", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const paintData = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if project belongs to authenticated user
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to modify this project" });
      }
      
      const projectPaint = await storage.addPaintToProject(projectId, paintData);
      res.status(201).json(projectPaint);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add paint to project" });
    }
  });

  app.delete("/api/projects/:projectId/paints/:paintId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const paintId = parseInt(req.params.paintId);
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if project belongs to authenticated user
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to modify this project" });
      }
      
      await storage.removePaintFromProject(projectId, paintId);
      res.json({ message: "Paint removed from project successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove paint from project" });
    }
  });

  // Citadel paint database routes
  app.get("/api/citadel-paints", (req, res) => {
    const citadelPaints = getAllCitadelPaints();
    res.json(citadelPaints);
  });

  app.get("/api/citadel-paints/:type", (req, res) => {
    const { type } = req.params;
    const paintsByType = getCitadelPaintsByType(type);
    res.json(paintsByType);
  });

  app.get("/api/citadel-paints/search/:query", (req, res) => {
    const { query } = req.params;
    const searchResults = searchCitadelPaints(query);
    res.json(searchResults);
  });

  app.post("/api/citadel-paints/scrape", async (req, res) => {
    try {
      const category = req.body.category;
      const results = await scrapeKnownCitadelCategories(category ? [category] : undefined);
      res.json({ message: "Scraping complete", results });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Scraping failed" });
    }
  });

  app.post("/api/citadel-paints/scrape-all", async (req, res) => {
    try {
      const results = await scrapeAllCitadelPaints();
      res.json({ message: "Full scraping complete", results });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Full scraping failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
