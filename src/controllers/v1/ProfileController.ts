import { Request, Response } from "express";
import { MongoDBClient } from "../../clients/MongoDBClient";
import { AuthType } from "../../types/MongoDB";

type ProfileParams = {
  user: string;
  id?: string;
};

export class ProfileController {
  async getProfileContent(req: Request, res: Response) {
    const params = req.params as ProfileParams;

    const postsLenght = req.get("X-Loaded-Posts") ?? "0";

    const content = await MongoDBClient.getDefaultInstance().fetchProfileContent(params.user);
    if (!content) {
      res.send({ status: false, content: [] });
      return;
    }
    const postsLenghtInt = parseInt(postsLenght);
    const parsedContent = content.slice(postsLenghtInt, postsLenghtInt + 10);

    const token = req.get("X-Auth-Token");
    if (!token) {
      res.send({ status: true, content: parsedContent, lenght: content.length });
      return;
    }

    const data = await MongoDBClient.getDefaultInstance().findInCollection("auth", { token: token });

    let authenticated = false;
    if (data) {
      const parsed = data as AuthType;
      authenticated = parsed.username === params.user;
    }

    res.send({ status: true, authenticated: authenticated, content: parsedContent, lenght: content.length });
  }

  async getPost(req: Request, res: Response) {
    const params = req.params as ProfileParams;

    if (params.id) {
      const post = await MongoDBClient.getDefaultInstance().getPostByID(params.user, parseInt(params.id));
      res.send({ status: post !== null, content: post });
    }
  }
}
