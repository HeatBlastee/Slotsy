import "dotenv/config";
import "./config/passport.config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/app.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middeware";
import { BadRequestException } from "./utils/app-error";
import { initializeDatabase } from "./database/database";
import authRoutes from "./routes/auth.route";
import passport from "passport";
import eventRoutes from "./routes/event.route";
import availabilityRoutes from "./routes/availability.route";
import integrationRoutes from "./routes/integration.route";
import meetingRoutes from "./routes/meeting.route";

// Add these debug logs at the very top to see if anything gets processed
console.log('SERVER STARTING: Entering index.ts');
console.log('SERVER STARTING: Node ENV:', process.env.NODE_ENV);
console.log('SERVER STARTING: Front End Origin ENV:', process.env.FRONTEND_ORIGIN);


const app = express();
const BASE_PATH = config.BASE_PATH;

console.log('EXPRESS APP INSTANCE CREATED');

// --- Place CORS middleware here, at the very beginning ---
app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true }));
console.log('CORS Middleware Applied. Origin:', config.FRONTEND_ORIGIN);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
console.log('Body parsers and Passport Initialized');

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Handling / route');
    // Consider temporarily removing the throw, just to confirm it can send a response
    // throw new BadRequestException("throwing async error");
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/event`, eventRoutes);
app.use(`${BASE_PATH}/availability`, availabilityRoutes);
app.use(`${BASE_PATH}/integration`, integrationRoutes);
app.use(`${BASE_PATH}/meeting`, meetingRoutes);
console.log('Routes Applied');

app.use(errorHandler);
console.log('Error Handler Applied');

// ** IMPORTANT FOR VERCEL DEPLOYMENT **
// Vercel manages the HTTP server for serverless functions.
// You should export your Express app instance.
// The app.listen block is typically for local development only.
// For Vercel, you often comment it out or make it conditional.

// For local development, keep this:
if (process.env.NODE_ENV !== 'production') {
  app.listen(config.PORT, async () => {
    await initializeDatabase(); // Initialize DB if not already done by Vercel's lifecycle
    console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  });
}

// ** This is the KEY for Vercel to run your app as a serverless function **
export default app;
console.log('Express app exported for Vercel.');