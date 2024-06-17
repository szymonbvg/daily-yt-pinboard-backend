import { Request, Response } from "express";
import { MongoDBClient } from "../../clients/MongoDBClient";
import { AuthType } from "../../types/MongoDB";
import { Messages } from "../../enums/Messages";

type PostBody = {
  heading: string;
  url: string;
};

export class PostController {
  async addPost(req: Request, res: Response) {
    const body = req.body as PostBody;

    const token = req.get("X-Auth-Token");
    if (!token) {
      res.send({ status: false, message: Messages.UNAUTHORIZED });
      return;
    }

    const data = await MongoDBClient.getDefaultInstance().findInCollection("auth", { token: token });

    if (!data) {
      res.send({ status: false, message: Messages.UNAUTHORIZED });
      return;
    }

    const urlRegExp = new RegExp(/^(http(s)?:\/\/)?(((?:www|m).)?youtube.com|youtu.be)\/.+$/);
    if (!urlRegExp.test(body.url)) {
      res.send({ status: false, message: Messages.INVALID_URL });
      return;
    }

    if (body.url.length > 2000) {
      res.send({ status: false, message: Messages.URL_TOO_LONG });
      return;
    }

    if (body.heading.length > 80) {
      res.send({ status: false, message: Messages.HEADING_TOO_LONG });
      return;
    }

    const parsed = data as AuthType;
    const date = new Date();
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    const dateParsed = day + "-" + month + "-" + year;

    const posts = await MongoDBClient.getDefaultInstance().fetchProfileContent(parsed.username);
    const badInterval = posts?.some((i) => i.date === dateParsed);

    if (badInterval) {
      res.send({ status: false, message: Messages.POST_LIMIT });
      return;
    }

    const shared = await MongoDBClient.getDefaultInstance().addPost(
      parsed.username,
      dateParsed,
      body.heading,
      body.url
    );

    res.send({ status: shared, message: shared ? Messages.SUCCESS : Messages.ERROR });
  }
}
