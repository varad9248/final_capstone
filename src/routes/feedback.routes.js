import { Router } from "express";
import { createfeedback , getUserFeedbacks , updateFeedback , deleteFeedback } from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create").post(createfeedback);
router.route("/user").get(getUserFeedbacks);
router.route("/:feedbackId").patch(updateFeedback).delete(deleteFeedback);

export default router;