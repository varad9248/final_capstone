import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createfeedback);
router.route("/user/:userId").get(getUserfeedback);
router.route("/:tweetId").patch(updatefeedback).delete(deletefeedback);

export default router