import { Router } from "express";
import { RoutesHandler } from "../RoutesHandler";
import { AuthController } from "../../controllers/v1/AuthController";

export class AuthRouter implements RoutesHandler {
  private router: Router;
  private controller: AuthController;

  constructor() {
    this.router = Router();
    this.controller = new AuthController();
  }

  getInstance(): Router {
    return this.router;
  }

  handleRoutes(): void {
    this.router.post("/login", this.controller.handleLogin);
    this.router.post("/register", this.controller.handleRegistration);
  }

  path(): string {
    return "/v1/auth";
  }
}
