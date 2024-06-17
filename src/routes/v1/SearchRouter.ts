import { Router } from "express";
import { RoutesHandler } from "../RoutesHandler";
import { SearchController } from "../../controllers/v1/SearchController";

export class SearchRouter implements RoutesHandler {
  private router: Router;
  private controller: SearchController;

  constructor() {
    this.router = Router();
    this.controller = new SearchController();
  }

  getInstance(): Router {
    return this.router;
  }

  handleRoutes(): void {
    this.router.get("/", this.controller.searchByKeyword);
  }

  path(): string {
    return "/v1/search";
  }
}
