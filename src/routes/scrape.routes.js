import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCategioryProducts,  scrapeProducts, trackproduct } from "../controllers/scrape.controller.js";

const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/products").post(scrapeProducts);
router.route("/getCategioryProducts").get(getCategioryProducts);
router.route("/trackproduct/:productId").post(trackproduct)

export default router;