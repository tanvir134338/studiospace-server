import { Router } from "express";

import { issueJWT, clearJWT } from "../controllers/auth.controller.js";

const router = Router();

// Generate JWT after Better Auth login
router.post("/jwt", issueJWT);

// Clear JWT cookie during logout
router.post("/logout", clearJWT);

export default router;
