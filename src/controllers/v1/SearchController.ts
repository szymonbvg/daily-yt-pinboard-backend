import { Request, Response } from "express";
import { MongoDBClient } from "../../clients/MongoDBClient";

type SearchQuery = {
  term: string;
};

export class SearchController {
  async searchByKeyword(req: Request, res: Response) {
    const query = req.query as SearchQuery;

    if (query.term) {
      const parsedTerm = query.term.replaceAll("\\", "\\\\");
      const results = await MongoDBClient.getDefaultInstance().searchByKeyword(parsedTerm);

      const parsedResults = results.map((profile) => {
        return { username: profile.username, posts: profile.posts.length };
      });

      res.send(parsedResults);
    }
  }
}
