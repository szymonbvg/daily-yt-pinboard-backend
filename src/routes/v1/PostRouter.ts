import { Router } from "express";
import { RoutesHandler } from "../RoutesHandler";
import { PostController } from "../../controllers/v1/PostController";

export class PostRouter implements RoutesHandler {
  private router: Router;
  private controller: PostController;

  constructor() {
    this.router = Router();
    this.controller = new PostController();
  }

  getInstance(): Router {
    return this.router;
  }

  handleRoutes(): void {
    this.router.post("/add", this.controller.addPost);
  }

  path(): string {
    return "/v1/post";
  }
}
