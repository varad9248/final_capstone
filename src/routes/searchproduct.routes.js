import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addproduct, createSearchHistory, deleteSearchHistory, getSearchHistoryById, getUserSearchHistory, removeProduct } from "../controllers/searchproduct.controller.js";

const router = Router()

router.use(verifyJWT);

router.route("/create").post(createSearchHistory)

router
    .route("/:searchHistoryId")
    .get(getSearchHistoryById)
    .delete(deleteSearchHistory);

router.route("/add/:productId/:searchHistoryId").patch(addproduct);
router.route("/remove/:videoId/:searchHistoryId").patch(removeProduct);

router.route("/user/:userId").get(getUserSearchHistory);


export default router;