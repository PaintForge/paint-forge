import { pgTable, text, integer, serial, boolean, real, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  profileImageUrl: text("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  pendingEmail: text("pending_email"),
  emailChangeToken: text("email_change_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paints = pgTable("paints", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  color: text("color").notNull(), // hex color code
  type: text("type").notNull(), // base, shade, layer, etc.

  quantity: integer("quantity").default(100), // percentage full
  status: text("status").notNull().default("in_stock"), // in_stock, low_stock, out_of_stock, wishlist
  isWishlist: boolean("is_wishlist").default(false), // true for wishlist items
  priority: text("priority").default("medium"), // high, medium, low for wishlist items
  notes: text("notes"), // user notes for wishlist or inventory items
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, completed, on_hold
  imageUrl: text("image_url"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectPaints = pgTable("project_paints", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  paintId: integer("paint_id").references(() => paints.id, { onDelete: "cascade" }),
  partName: text("partName").notNull(), // e.g. "Armor", "Weapon", "Base", "Eyes", etc.
  technique: text("technique"), // e.g. "Base coat", "Highlight", "Wash", "Dry brush"
  usageNotes: text("usage_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});



// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  emailVerified: true,
  verificationToken: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  captchaAnswer: z.string().min(1, "Please solve the captcha"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertPaintSchema = createInsertSchema(paints).omit({
  id: true,
  createdAt: true,
});

export const addPaintSchema = insertPaintSchema.extend({
  name: z.string().min(1, "Paint name is required"),
  brand: z.string().min(1, "Brand is required"),
  color: z.string().min(1, "Color is required"),
  type: z.string().min(1, "Type is required"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const updateProjectSchema = insertProjectSchema.partial();

export const insertProjectPaintSchema = createInsertSchema(projectPaints).omit({
  id: true,
  createdAt: true,
}).extend({
  partName: z.string().min(1, "Part name is required"),
  technique: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Paint = typeof paints.$inferSelect;
export type InsertPaint = z.infer<typeof insertPaintSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;

export type ProjectPaint = typeof projectPaints.$inferSelect & {
  paint?: Paint;
};
export type InsertProjectPaint = z.infer<typeof insertProjectPaintSchema>;

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("general"), // "feature", "bug", "general"
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"), // "open", "in_progress", "resolved", "closed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["feature", "bug", "general"]).default("general"),
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
