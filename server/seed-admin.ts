import { createAdminUser } from "./adminAuth";

export async function seedAdminUser() {
  try {
    // Create the admin user with the provided credentials
    await createAdminUser("simonenieddu", "arancia1");
    console.log("Admin user created successfully!");
  } catch (error) {
    console.log("Admin user might already exist or error occurred:", error);
  }
}

// Run if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdminUser().then(() => {
    console.log("Admin seeding completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exit(1);
  });
}