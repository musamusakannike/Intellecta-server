const express = require("express");
const router = express.Router();
const { getUser, updateUser, deleteUser, listUsers, getUserById, updateUserById, deleteUserById } = require("../controllers/user.controller");
const { updateUserValidation, adminUpdateUserValidation } = require("../validation/user.validation");
const roleAuth = require("../middlewares/auth.middleware");


router.get("/me", roleAuth(), getUser);
router.patch("/me", roleAuth(), updateUserValidation, updateUser);
router.delete("/me", roleAuth(), deleteUser);

// Admin user management
router.get("/", roleAuth(["admin", "superadmin"]), listUsers);
router.get("/:id", roleAuth(["admin", "superadmin"]), getUserById);
router.patch("/:id", roleAuth(["admin", "superadmin"]), adminUpdateUserValidation, updateUserById);
router.delete("/:id", roleAuth(["admin", "superadmin"]), deleteUserById);

module.exports = router;
