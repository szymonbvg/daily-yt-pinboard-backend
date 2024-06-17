import { ExpressServer } from "./ExpressServer";
import { Logger } from "./util/Logger";

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const server = new ExpressServer();

  if (!server.init(port)) {
    Logger.getInstance().log("server initialization failed!");
    process.exit();
  } else {
    Logger.getInstance().log("successfully initialized server");
  }
}

main().catch((e) => {
  if (e instanceof Error) {
    Logger.getInstance().error(e);
    process.exit();
  }
});
