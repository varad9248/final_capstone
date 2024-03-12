import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createReviews, deleteProductReviews, getProductReviews } from "../controllers/review.controller.js";

const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:productId")
      .get(getProductReviews)
      .post(createReviews)
      .delete(deleteProductReviews);


export default router;