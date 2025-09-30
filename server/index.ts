import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from './storage';
import { hashPassword } from './auth';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function seedUsers() {
  try {
    // Seed admin
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
    const superEmail = process.env.SUPERUSER_SEED_EMAIL || 'superuser@example.com';

    const existingAdmin = await storage.getUserByEmail(adminEmail);
    if (!existingAdmin) {
      const adminPass = await hashPassword(process.env.ADMIN_SEED_PASSWORD || 'admin123');
      const admin = await storage.createUser({
        username: 'admin',
        email: adminEmail,
        phone: '0000000001',
        password: adminPass,
        bio: 'Admin user',
        about: '',
        avatar: undefined,
      } as any);
      await storage.updateUserRole(admin.id, 'admin');
      log(`Seeded admin user ${adminEmail}`);
    }

    const existingSuper = await storage.getUserByEmail(superEmail);
    if (!existingSuper) {
      const superPass = await hashPassword(process.env.SUPERUSER_SEED_PASSWORD || 'super123');
      const superuser = await storage.createUser({
        username: 'superuser',
        email: superEmail,
        phone: '0000000002',
        password: superPass,
        bio: 'Superuser account',
        about: '',
        avatar: undefined,
      } as any);
      await storage.updateUserRole(superuser.id, 'superuser');
      log(`Seeded superuser ${superEmail}`);
    }
  } catch (e) {
    log(`Seeding users failed: ${(e as Error).message}`);
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  await seedUsers();

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
