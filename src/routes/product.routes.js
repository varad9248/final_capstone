import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createProducts,  getProduct, updateProduct } from "../controllers/product.controller.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/create")
    .post(createProducts);

router
    .route("/:ProductId")
    .get(getProduct)
    .patch(updateProduct);

export default router