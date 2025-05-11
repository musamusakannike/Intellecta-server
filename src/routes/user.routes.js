const express = require("express");
const router = express.Router();
const { getUser, updateUser, deleteUser } = require("../controllers/user.controller");
const { updateUserValidation } = require("../validation/user.validation");
const roleAuth = require("../middlewares/auth.middleware");


router.get("/me", roleAuth(), getUser);
router.patch("/me", roleAuth(), updateUserValidation, updateUser);
router.delete("/me", roleAuth(), deleteUser);

module.exports = router;
