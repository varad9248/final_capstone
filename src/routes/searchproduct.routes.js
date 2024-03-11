import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT);

router.route("/").post(createSearchHistorylist)

router
    .route("/:searchHistoryId")
    .get(getSearchHistoryById)
    .delete(deleteSearchHistory);

router.route("/add/:productId/:searchHistoryId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:searchHistoryId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);


export default router