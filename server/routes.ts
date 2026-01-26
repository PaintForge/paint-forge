import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { insertPaintSchema, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, insertFeedbackSchema } from "@shared/schema";
import { scrapeAllCitadelPaints, scrapeKnownCitadelCategories } from "./citadel-scraper";
import { getAllCitadelPaints, getCitadelPaintsByType, searchCitadelPaints } from "./citadel-paint-database";
import { hashPassword, comparePassword, generateToken, requireAuth, sendVerificationEmail, type AuthenticatedRequest } from "./auth";
import { importAllPaints, getCatalogStats } from "./paintCatalogImport";
import { paintCatalog } from "@shared/schema";
import { ilike, or, and } from "drizzle-orm";
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
      console.log("[RESET-PASSWORD] Request received");
      const validatedData = resetPasswordSchema.parse(req.body);
      console.log("[RESET-PASSWORD] Token (first 8 chars):", validatedData.token?.substring(0, 8));
      console.log("[RESET-PASSWORD] Password length:", validatedData.password?.length);
      
      const success = await storage.verifyPasswordReset(validatedData.token, validatedData.password);
      
      if (!success) {
        console.log("[RESET-PASSWORD] Reset failed - invalid or expired token");
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      console.log("[RESET-PASSWORD] Password reset successful");
      res.json({
        message: "Password reset successfully. You can now log in with your new password.",
      });
    } catch (error: any) {
      console.error("[RESET-PASSWORD] Error:", error);
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
      const expectedAnswer = parseInt(captchaExpectedAnswer);
      if (isNaN(userAnswer) || isNaN(expectedAnswer) || userAnswer !== expectedAnswer) {
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

      // Send verification email (don't fail if email fails)
      const emailSent = await sendVerificationEmail(user.email, user.verificationToken!);
      
      const message = emailSent 
        ? "Account created successfully. Please check your email to verify your account."
        : "Account created successfully. Email verification temporarily unavailable - please contact support.";

      res.status(201).json({
        message,
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
        console.log("[LOGIN] User not found:", validatedData.email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      console.log("[LOGIN] User found:", validatedData.email, "emailVerified:", user.emailVerified);

      // Check password
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        console.log("[LOGIN] Invalid password for:", validatedData.email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        console.log("[LOGIN] Email not verified for:", validatedData.email);
        return res.status(401).json({ message: "Please verify your email before logging in" });
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      console.log("[LOGIN] Login successful for:", validatedData.email);
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          accountName: user.accountName,
        },
      });
    } catch (error: any) {
      console.error("[LOGIN] Error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        console.log("[VERIFY] Missing or invalid token");
        return res.redirect("/login?error=invalid_token");
      }

      console.log("[VERIFY] Attempting to verify email with token:", token.substring(0, 8) + "...");
      const success = await storage.verifyUserEmail(token);
      console.log("[VERIFY] Verification result:", success);
      
      if (success) {
        // Double-check the user was actually updated
        const [verifiedUser] = await db.select().from(users).where(eq(users.verificationToken, null));
        console.log("[VERIFY] User found after verification:", !!verifiedUser);
        res.redirect("/login?verified=true");
      } else {
        console.log("[VERIFY] Verification failed - token not found in database");
        res.redirect("/login?error=invalid_token");
      }
    } catch (error: any) {
      console.error("[VERIFY] Error during verification:", error);
      res.redirect("/login?error=verification_failed");
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
        accountName: user.accountName,
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
      const { accountName } = req.body;
      
      if (!accountName) {
        return res.status(400).json({ message: "Account name is required" });
      }

      const updatedUser = await storage.updateUser(req.user!.id, {
        accountName,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        accountName: updatedUser.accountName,
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
        accountName: updatedUser.accountName,
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
      const userName = user.accountName 
        ? user.accountName 
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

  // Public support contact form (no auth required - for login issues)
  app.post('/api/support', async (req, res) => {
    try {
      const { category, email, name, message } = req.body;
      
      // Validate required fields
      if (!category || !email || !name || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      
      // Validate category
      const validCategories = ['account-login', 'feature-suggestion', 'bug-report', 'inappropriate-content', 'other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      // Validate message length
      if (message.length < 10) {
        return res.status(400).json({ message: "Message must be at least 10 characters" });
      }
      
      if (message.length > 2000) {
        return res.status(400).json({ message: "Message must be less than 2000 characters" });
      }
      
      // Send email via SendGrid
      const { sendSupportRequest } = await import('./email');
      const success = await sendSupportRequest(category, email, name, message);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to send support request. Please try again later." });
      }
      
      res.status(200).json({ message: "Support request sent successfully" });
    } catch (error: any) {
      console.error('Support request error:', error);
      res.status(500).json({ message: "Failed to submit support request" });
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

  // Admin paint catalog import endpoint
  app.post('/api/admin/import-catalog', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.user!.id);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { forceRefresh = false } = req.body;
      console.log(`[ADMIN] Paint catalog import requested by ${user.email}, forceRefresh: ${forceRefresh}`);
      
      const result = await importAllPaints(forceRefresh);
      
      res.json({
        success: result.success,
        message: result.message,
        count: result.count,
        brands: result.brands,
      });
    } catch (error: any) {
      console.error('[ADMIN] Paint catalog import error:', error);
      res.status(500).json({ message: "Failed to import paint catalog", error: error.message });
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
        accountName: u.accountName,
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
        accountName: updatedUser.accountName,
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
      const paintData = { ...validatedData, userId: req.user!.id };
      const paint = await storage.createPaint(paintData);
      res.status(201).json(paint);
    } catch (error) {
      res.status(400).json({ message: "Invalid paint data" });
    }
  });

  app.put("/api/paints/:id", async (req, res) => {
    try {
      const paint = await storage.updatePaint(Number(req.params.id), req.body);
      if (!paint) {
        return res.status(404).json({ message: "Paint not found" });
      }
      res.json(paint);
    } catch (error) {
      res.status(500).json({ message: "Failed to update paint" });
    }
  });

  app.delete("/api/paints/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePaint(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: "Paint not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete paint" });
    }
  });



  // Paint inventory statistics
  app.get("/api/inventory/stats", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const paints = await storage.getAllPaints(userId);
      
      const stats = {
        total: paints.length,
        inStock: paints.filter(p => p.status === "in_stock").length,
        lowStock: paints.filter(p => p.status === "low_stock").length,
        outOfStock: paints.filter(p => p.status === "out_of_stock").length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory stats" });
    }
  });

  // Citadel paint data routes
  app.get("/api/citadel/paints", async (req, res) => {
    try {
      const { search } = req.query;
      let citadelPaints = getAllCitadelPaints();
      
      // If search query provided, filter paints by name
      if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase().trim();
        citadelPaints = searchCitadelPaints(searchTerm);
      }
      
      const formattedPaints = citadelPaints.map(paint => ({
        name: paint.name,
        type: paint.type,
        color: paint.hexCode,
        hexCode: paint.hexCode,
        description: paint.description,
        productCode: paint.productCode
      }));
      
      res.json({
        success: true,
        paints: formattedPaints,
        count: formattedPaints.length,
        source: "authentic_database",
        searchTerm: search || null
      });
    } catch (error: any) {
      console.error("Error fetching Citadel paints:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch Citadel paint data",
        error: error.message 
      });
    }
  });

  app.get("/api/citadel/paints/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const citadelPaints = getCitadelPaintsByType(type);
      const formattedPaints = citadelPaints.map(paint => ({
        name: paint.name,
        type: paint.type,
        color: paint.hexCode,
        description: paint.description,
        productCode: paint.productCode
      }));
      
      res.json({
        success: true,
        paints: formattedPaints,
        count: formattedPaints.length,
        type: type,
        source: "authentic_database"
      });
    } catch (error: any) {
      console.error("Error fetching Citadel paints by type:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch Citadel paint data",
        error: error.message 
      });
    }
  });

  app.post("/api/citadel/import", async (req, res) => {
    try {
      console.log("Importing authentic Citadel paint catalog...");
      const citadelPaints = getAllCitadelPaints();
      
      let importedCount = 0;
      let skippedCount = 0;
      
      for (const paint of citadelPaints) {
        if (!paint.name) continue;
        
        // Check if paint already exists by name and brand
        const existingPaints = await storage.getAllPaints();
        const existingPaint = existingPaints.find(p => 
          p.name === paint.name && p.brand === "Citadel"
        );
        
        if (!existingPaint) {
          await storage.createPaint({
            name: paint.name,
            brand: "Citadel",
            color: paint.hexCode,
            type: paint.type,
            status: "in_stock",
            quantity: 1,
            userId: 1
          });
          importedCount++;
        } else {
          skippedCount++;
        }
      }
      
      res.json({
        success: true,
        message: `Successfully imported ${importedCount} authentic Citadel paints`,
        imported: importedCount,
        skipped: skippedCount,
        total: citadelPaints.length,
        source: "authentic_database"
      });
    } catch (error: any) {
      console.error("Error importing Citadel paints:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to import Citadel paint data",
        error: error.message 
      });
    }
  });

  // Paint Catalog routes - pre-populated database of all paints
  app.get("/api/catalog/brands", async (req, res) => {
    try {
      const allPaints = await db.select().from(paintCatalog);
      
      const brandCounts: Record<string, number> = {};
      for (const paint of allPaints) {
        brandCounts[paint.brand] = (brandCounts[paint.brand] || 0) + 1;
      }
      
      const brands = Object.entries(brandCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      res.json({
        success: true,
        brands,
        totalPaints: allPaints.length
      });
    } catch (error: any) {
      console.error("Error fetching catalog brands:", error);
      res.status(500).json({ success: false, message: "Failed to fetch brands" });
    }
  });

  app.get("/api/catalog/types", async (req, res) => {
    try {
      const { brand } = req.query;
      
      let allPaints = await db.select().from(paintCatalog);
      
      if (brand && typeof brand === 'string') {
        allPaints = allPaints.filter(p => p.brand === brand);
      }
      
      const typeCounts: Record<string, number> = {};
      for (const paint of allPaints) {
        typeCounts[paint.type] = (typeCounts[paint.type] || 0) + 1;
      }
      
      const types = Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      res.json({
        success: true,
        types
      });
    } catch (error: any) {
      console.error("Error fetching catalog types:", error);
      res.status(500).json({ success: false, message: "Failed to fetch types" });
    }
  });

  app.get("/api/catalog/paints", async (req, res) => {
    try {
      const { brand, type, search, limit = "100", offset = "0" } = req.query;
      
      let allPaints = await db.select().from(paintCatalog);
      
      if (brand && typeof brand === 'string') {
        allPaints = allPaints.filter(p => p.brand === brand);
      }
      
      if (type && typeof type === 'string') {
        allPaints = allPaints.filter(p => p.type === type);
      }
      
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        allPaints = allPaints.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.type.toLowerCase().includes(searchLower)
        );
      }
      
      const total = allPaints.length;
      const limitNum = Math.min(parseInt(limit as string) || 100, 500);
      const offsetNum = parseInt(offset as string) || 0;
      
      const paginatedPaints = allPaints.slice(offsetNum, offsetNum + limitNum);
      
      res.json({
        success: true,
        paints: paginatedPaints,
        total,
        limit: limitNum,
        offset: offsetNum
      });
    } catch (error: any) {
      console.error("Error fetching catalog paints:", error);
      res.status(500).json({ success: false, message: "Failed to fetch paints" });
    }
  });

  app.post("/api/catalog/import", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }
      
      console.log("Starting paint catalog import...");
      const result = await importAllPaints();
      
      res.json({
        success: result.success,
        message: result.success 
          ? `Imported ${result.count} paints from ${result.brands.length} brands`
          : "Failed to import paints",
        count: result.count,
        brands: result.brands
      });
    } catch (error: any) {
      console.error("Error importing paint catalog:", error);
      res.status(500).json({ success: false, message: "Failed to import paint catalog" });
    }
  });

  app.get("/api/catalog/stats", async (req, res) => {
    try {
      const stats = await getCatalogStats();
      res.json({
        success: true,
        ...stats
      });
    } catch (error: any) {
      console.error("Error fetching catalog stats:", error);
      res.status(500).json({ success: false, message: "Failed to fetch catalog stats" });
    }
  });

  app.post("/api/catalog/add-to-inventory", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { catalogPaintId, quantity = 100 } = req.body;
      
      if (!catalogPaintId) {
        return res.status(400).json({ success: false, message: "Catalog paint ID is required" });
      }
      
      const catalogPaints = await db.select().from(paintCatalog).where(eq(paintCatalog.id, catalogPaintId));
      const catalogPaint = catalogPaints[0];
      
      if (!catalogPaint) {
        return res.status(404).json({ success: false, message: "Paint not found in catalog" });
      }
      
      const newPaint = await storage.createPaint({
        name: catalogPaint.name,
        brand: catalogPaint.brand,
        color: catalogPaint.hexColor,
        type: catalogPaint.type,
        quantity: quantity,
        status: "in_stock",
        isWishlist: false,
        userId
      });
      
      res.json({
        success: true,
        paint: newPaint,
        message: `Added ${catalogPaint.name} to your inventory`
      });
    } catch (error: any) {
      console.error("Error adding catalog paint to inventory:", error);
      res.status(500).json({ success: false, message: "Failed to add paint to inventory" });
    }
  });

  // Project routes
  app.get("/api/projects", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const projects = await storage.getAllProjects(userId);
      
      // Get paint details for each project
      const projectsWithPaints = await Promise.all(
        projects.map(async (project) => {
          const paints = await storage.getProjectPaints(project.id);
          return {
            ...project,
            paints
          };
        })
      );
      
      res.json(projectsWithPaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const project = await storage.getProject(Number(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const projectData = { ...req.body, userId };
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const project = await storage.updateProject(Number(req.params.id), req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteProject(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project Paint routes
  app.get("/api/projects/:id/paints", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = Number(req.params.id);
      const projectPaints = await storage.getProjectPaints(projectId);
      res.json(projectPaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project paints" });
    }
  });

  app.post("/api/projects/:id/paints", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = Number(req.params.id);
      const { paintId, partName, technique, usageNotes } = req.body;
      const projectPaint = await storage.addPaintToProject({
        projectId,
        paintId,
        partName,
        technique,
        usageNotes
      });
      res.status(201).json(projectPaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to add paint to project" });
    }
  });

  app.delete("/api/projects/:projectId/paints/:paintId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const paintId = Number(req.params.paintId);
      const success = await storage.removePaintFromProject(projectId, paintId);
      if (!success) {
        return res.status(404).json({ message: "Paint not found in project" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove paint from project" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
