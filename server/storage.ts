import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, paints, projects, projectPaints, feedback,
  type User, type InsertUser,
  type Paint, type InsertPaint,
  type Project, type InsertProject, type UpdateProject,
  type ProjectPaint, type InsertProjectPaint,
  type Feedback, type InsertFeedback
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserEmail(token: string): Promise<boolean>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Email Change Verification
  requestEmailChange(userId: number, newEmail: string): Promise<{ token: string; pendingEmail: string }>;
  verifyEmailChange(token: string): Promise<boolean>;

  // Password Reset
  requestPasswordReset(email: string): Promise<{ token: string; email: string } | null>;
  verifyPasswordReset(token: string, newPassword: string): Promise<boolean>;

  // Paints
  getAllPaints(userId?: number): Promise<Paint[]>;
  getPaint(id: number): Promise<Paint | undefined>;
  createPaint(paint: InsertPaint): Promise<Paint>;
  updatePaint(id: number, paint: Partial<Paint>): Promise<Paint | undefined>;
  deletePaint(id: number): Promise<boolean>;

  // Projects
  getAllProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Project Paints
  getProjectPaints(projectId: number): Promise<ProjectPaint[]>;
  addPaintToProject(projectPaint: InsertProjectPaint): Promise<ProjectPaint>;
  removePaintFromProject(projectId: number, paintId: number): Promise<boolean>;

  // Admin Statistics
  getUserStats(): Promise<{ total: number; verified: number; unverified: number }>;
  getPaintStats(): Promise<{ total: number }>;
  getProjectStats(): Promise<{ total: number }>;
  getRecentSignups(): Promise<{ date: string; count: number }[]>;
  getPopularPaints(): Promise<{ name: string; brand: string; usage_count: number }[]>;
  
  // Admin User Management
  getAllUsers(): Promise<any[]>;
  toggleUserAdmin(userId: number): Promise<User | undefined>;
  deleteUser(userId: number): Promise<boolean>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback>;
  getFeedback(userId: number): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        verificationToken: crypto.randomUUID(),
        emailVerified: false,
      })
      .returning();
    return user;
  }

  async verifyUserEmail(token: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ emailVerified: true, verificationToken: null })
      .where(eq(users.verificationToken, token))
      .returning();
    return result.length > 0;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async requestEmailChange(userId: number, newEmail: string): Promise<{ token: string; pendingEmail: string }> {
    // Check if the new email is already in use
    const existingUser = await this.getUserByEmail(newEmail);
    if (existingUser) {
      throw new Error("Email address is already in use");
    }

    // Generate a verification token
    const token = crypto.randomUUID();
    
    // Update user with pending email and token
    await db
      .update(users)
      .set({
        pendingEmail: newEmail,
        emailChangeToken: token,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { token, pendingEmail: newEmail };
  }

  async verifyEmailChange(token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailChangeToken, token));

    if (!user || !user.pendingEmail) {
      return false;
    }

    // Check if the pending email is still available
    const emailInUse = await this.getUserByEmail(user.pendingEmail);
    if (emailInUse && emailInUse.id !== user.id) {
      // Clear the pending email change since it's no longer available
      await db
        .update(users)
        .set({
          pendingEmail: null,
          emailChangeToken: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      return false;
    }

    // Update the user's email
    await db
      .update(users)
      .set({
        email: user.pendingEmail,
        pendingEmail: null,
        emailChangeToken: null,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return true;
  }

  // Paint operations
  async getAllPaints(userId?: number): Promise<Paint[]> {
    if (userId) {
      return await db.select().from(paints).where(eq(paints.userId, userId));
    }
    return await db.select().from(paints);
  }

  async getPaint(id: number): Promise<Paint | undefined> {
    const [paint] = await db.select().from(paints).where(eq(paints.id, id));
    return paint || undefined;
  }



  async createPaint(insertPaint: InsertPaint): Promise<Paint> {
    const [paint] = await db
      .insert(paints)
      .values(insertPaint)
      .returning();
    return paint;
  }

  async updatePaint(id: number, updateData: Partial<Paint>): Promise<Paint | undefined> {
    const [paint] = await db
      .update(paints)
      .set(updateData)
      .where(eq(paints.id, id))
      .returning();
    return paint || undefined;
  }

  async deletePaint(id: number): Promise<boolean> {
    const result = await db.delete(paints).where(eq(paints.id, id)).returning();
    return result.length > 0;
  }

  // Project operations
  async getAllProjects(userId: number): Promise<Project[]> {
    try {
      return await db.select().from(projects).where(eq(projects.userId, userId));
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    } catch (error) {
      console.error("Error fetching project:", error);
      return undefined;
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    try {
      const [project] = await db.insert(projects).values(insertProject).returning();
      return project;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(id: number, updateData: UpdateProject): Promise<Project | undefined> {
    try {
      const [project] = await db
        .update(projects)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
      return project;
    } catch (error) {
      console.error("Error updating project:", error);
      return undefined;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  }

  // Project Paint operations
  async getProjectPaints(projectId: number): Promise<ProjectPaint[]> {
    try {
      const result = await db
        .select({
          projectPaint: projectPaints,
          paint: paints
        })
        .from(projectPaints)
        .leftJoin(paints, eq(projectPaints.paintId, paints.id))
        .where(eq(projectPaints.projectId, projectId));
      
      // Transform the result to match the expected interface
      return result.map(row => ({
        id: row.projectPaint.id,
        projectId: row.projectPaint.projectId,
        paintId: row.projectPaint.paintId,
        partName: row.projectPaint.partName,
        technique: row.projectPaint.technique,
        usageNotes: row.projectPaint.usageNotes,
        createdAt: row.projectPaint.createdAt,
        paint: row.paint ? {
          id: row.paint.id,
          name: row.paint.name,
          brand: row.paint.brand,
          color: row.paint.color,
          type: row.paint.type,
          quantity: row.paint.quantity,
          status: row.paint.status,
          isWishlist: row.paint.isWishlist,
          priority: row.paint.priority,
          notes: row.paint.notes,
          userId: row.paint.userId,
          createdAt: row.paint.createdAt
        } : undefined
      }));
    } catch (error) {
      console.error("Error fetching project paints:", error);
      return [];
    }
  }

  async addPaintToProject(projectPaint: InsertProjectPaint): Promise<ProjectPaint> {
    try {
      const [newProjectPaint] = await db.insert(projectPaints).values(projectPaint).returning();
      return newProjectPaint;
    } catch (error) {
      console.error("Error adding paint to project:", error);
      throw error;
    }
  }

  async removePaintFromProject(projectId: number, paintId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(projectPaints)
        .where(and(eq(projectPaints.projectId, projectId), eq(projectPaints.paintId, paintId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error removing paint from project:", error);
      return false;
    }
  }

  // Admin Statistics
  async getUserStats(): Promise<{ total: number; verified: number; unverified: number }> {
    try {
      const result = await db
        .select({
          total: sql<number>`count(*)`,
          verified: sql<number>`count(case when email_verified = true then 1 end)`,
          unverified: sql<number>`count(case when email_verified = false then 1 end)`
        })
        .from(users);
      
      return result[0] || { total: 0, verified: 0, unverified: 0 };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return { total: 0, verified: 0, unverified: 0 };
    }
  }

  async getPaintStats(): Promise<{ total: number }> {
    try {
      const result = await db
        .select({ total: sql<number>`count(*)` })
        .from(paints);
      
      return result[0] || { total: 0 };
    } catch (error) {
      console.error("Error fetching paint stats:", error);
      return { total: 0 };
    }
  }

  async getProjectStats(): Promise<{ total: number }> {
    try {
      const result = await db
        .select({ total: sql<number>`count(*)` })
        .from(projects);
      
      return result[0] || { total: 0 };
    } catch (error) {
      console.error("Error fetching project stats:", error);
      return { total: 0 };
    }
  }

  async getRecentSignups(): Promise<{ date: string; count: number }[]> {
    try {
      const result = await db
        .select({
          date: sql<string>`date(created_at)`,
          count: sql<number>`count(*)`
        })
        .from(users)
        .groupBy(sql`date(created_at)`)
        .orderBy(sql`date(created_at) desc`)
        .limit(10);
      
      return result.map(row => ({
        date: row.date,
        count: row.count
      }));
    } catch (error) {
      console.error("Error fetching recent signups:", error);
      return [];
    }
  }

  async getPopularPaints(): Promise<{ name: string; brand: string; usage_count: number }[]> {
    try {
      const result = await db
        .select({
          name: paints.name,
          brand: paints.brand,
          usage_count: sql<number>`count(project_paints.paint_id)`
        })
        .from(paints)
        .leftJoin(projectPaints, eq(paints.id, projectPaints.paintId))
        .groupBy(paints.id, paints.name, paints.brand)
        .orderBy(sql`count(project_paints.paint_id) desc`)
        .limit(10);
      
      return result.map(row => ({
        name: row.name,
        brand: row.brand,
        usage_count: row.usage_count
      }));
    } catch (error) {
      console.error("Error fetching popular paints:", error);
      return [];
    }
  }

  // Admin User Management
  async getAllUsers(): Promise<any[]> {
    try {
      // First get all users
      const usersResult = await db
        .select()
        .from(users)
        .orderBy(users.createdAt);
      
      // Get counts for each user
      const usersWithCounts = await Promise.all(
        usersResult.map(async (user) => {
          try {
            const paintCountResult = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(paints)
              .where(eq(paints.userId, user.id));
            
            const projectCountResult = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(projects)
              .where(eq(projects.userId, user.id));
            
            return {
              ...user,
              paintCount: paintCountResult[0]?.count || 0,
              projectCount: projectCountResult[0]?.count || 0
            };
          } catch (error) {
            console.error(`Error getting counts for user ${user.id}:`, error);
            return {
              ...user,
              paintCount: 0,
              projectCount: 0
            };
          }
        })
      );
      
      return usersWithCounts;
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  async toggleUserAdmin(userId: number): Promise<User | undefined> {
    try {
      // Get current user
      const user = await this.getUser(userId);
      if (!user) {
        return undefined;
      }

      // Toggle admin status
      const newAdminStatus = !user.isAdmin;
      
      const [updatedUser] = await db
        .update(users)
        .set({ isAdmin: newAdminStatus, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Error toggling user admin status:", error);
      return undefined;
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      // First delete all user's paints
      await db.delete(paints).where(eq(paints.userId, userId));
      
      // Then delete all user's projects (project_paints will be deleted via cascade)
      await db.delete(projects).where(eq(projects.userId, userId));
      
      // Finally delete the user
      const result = await db.delete(users).where(eq(users.id, userId)).returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async requestPasswordReset(email: string): Promise<{ token: string; email: string } | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return null; // User doesn't exist, but don't reveal this to prevent email enumeration
      }

      const resetToken = crypto.randomUUID();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await db
        .update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpiry: expiry,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return { token: resetToken, email: user.email };
    } catch (error) {
      console.error("Error requesting password reset:", error);
      return null;
    }
  }

  async verifyPasswordReset(token: string, newPassword: string): Promise<boolean> {
    if (!token || !newPassword) {
      return false;
    }

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.passwordResetToken, token));

      if (!user || !user.passwordResetExpiry) {
        return false;
      }

      // Check if token has expired
      if (new Date() > user.passwordResetExpiry) {
        // Clean up expired token
        await db
          .update(users)
          .set({
            passwordResetToken: null,
            passwordResetExpiry: null,
          })
          .where(eq(users.id, user.id));
        return false;
      }

      // Hash the new password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await db
        .update(users)
        .set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return true;
    } catch (error) {
      console.error("Error verifying password reset:", error);
      return false;
    }
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback & { userId: number }): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values({
        ...feedbackData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newFeedback;
  }

  async getFeedback(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(sql`${feedback.createdAt} DESC`);
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db
      .select({
        id: feedback.id,
        userId: feedback.userId,
        type: feedback.type,
        subject: feedback.subject,
        message: feedback.message,
        status: feedback.status,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .orderBy(sql`${feedback.createdAt} DESC`);
  }
}

export const storage = new DatabaseStorage();