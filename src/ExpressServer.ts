import express from "express";
import "dotenv/config";
import * as cors from "cors";
import { CorsOptions } from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { ProfileRouter } from "./routes/v1/ProfileRouter";
import { SearchRouter } from "./routes/v1/SearchRouter";
import { AuthRouter } from "./routes/v1/AuthRouter";
import { PostRouter } from "./routes/v1/PostRouter";

const WHITELIST = ["http://localhost:4173", "http://localhost:5173", "https://ytpinboard.vercel.app"];

const CORS_OPTIONS: CorsOptions = {
  origin: (origin, callback) => {
    if (WHITELIST.indexOf(origin as string) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("not allowed"));
    }
  },
};

export class ExpressServer {
  private app: express.Application;

  constructor() {
    this.app = express();
  }

  private controlRoutes() {
    const routers = [
      new ProfileRouter(),
      new SearchRouter(),
      new AuthRouter(),
      new PostRouter()
    ];

    for (const router of routers) {
      router.handleRoutes();
      this.app.use(router.path(), router.getInstance());
    }
  }

  public init(port: number): boolean {
    try {
      this.app.options("*", cors.default(CORS_OPTIONS));
      this.app.use(cors.default(CORS_OPTIONS));
      this.app.use(express.json());
      this.app.use(helmet());
      this.app.use(bodyParser.json());

      this.controlRoutes();

      this.app.listen(port ?? 3000);

      return true;
    } catch (e) {
      return false;
    }
  }
}
