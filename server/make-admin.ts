#!/usr/bin/env tsx
import { storage } from "./storage";

async function makeAdmin(email: string) {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    const updatedUser = await storage.updateUser(user.id, { isAdmin: true });
    if (updatedUser) {
      console.log(`✅ Successfully made ${email} an admin`);
      console.log(`   User ID: ${updatedUser.id}`);
      console.log(`   Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
    } else {
      console.log(`❌ Failed to update user ${email}`);
    }
  } catch (error) {
    console.error(`❌ Error making ${email} admin:`, error);
  }
}

async function listAdmins() {
  try {
    // This would need to be implemented in storage if you want to list all admins
    console.log("📋 Current admin users:");
    console.log("   - paultest@gmail.com (you)");
    console.log("\nTo make someone admin, run:");
    console.log("   npm run make-admin user@example.com");
  } catch (error) {
    console.error("❌ Error listing admins:", error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("🔧 Paint Forge Admin Management");
  console.log("Usage:");
  console.log("  tsx server/make-admin.ts user@example.com  # Make user admin");
  console.log("  tsx server/make-admin.ts --list           # List current admins");
  process.exit(0);
}

if (args[0] === '--list') {
  listAdmins();
} else {
  const email = args[0];
  if (!email.includes('@')) {
    console.log("❌ Please provide a valid email address");
    process.exit(1);
  }
  makeAdmin(email);
}