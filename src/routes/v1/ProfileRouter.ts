import { Router } from "express";
import { ProfileController } from "../../controllers/v1/ProfileController";
import { RoutesHandler } from "../RoutesHandler";

export class ProfileRouter implements RoutesHandler {
  private router: Router;
  private controller: ProfileController;

  constructor() {
    this.router = Router();
    this.controller = new ProfileController();
  }

  getInstance(): Router {
    return this.router;
  }

  handleRoutes(): void {
    this.router.get("/:user", this.controller.getProfileContent);
    this.router.get("/:user/post/:id", this.controller.getPost);
  }

  path(): string {
    return "/v1/profiles";
  }
}
