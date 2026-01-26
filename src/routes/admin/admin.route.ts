import { Router } from "express";
// import admin controller
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";

let adminUserController = new AdminUserController();

const router = Router();

router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, adminUserController.getOneUser);
// define admin user routes

export default router;