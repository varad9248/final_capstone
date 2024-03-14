import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCategioryProducts, scrapeAmazon, scrapeFlipkart, trackproduct } from "../controllers/scrape.controller.js";

const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/amazon").post(scrapeAmazon);
router.route("/flipkart").post(scrapeFlipkart);
router.route("/getProducts/:categiory").get(getCategioryProducts);
router.route("/trackproduct/:useremail").post(trackproduct)

export default router;