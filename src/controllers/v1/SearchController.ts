import { Request, Response } from "express";
import { MongoDBClient } from "../../clients/MongoDBClient";

type SearchQuery = {
  term: string;
  i: string;
};

export class SearchController {
  async searchByKeyword(req: Request, res: Response) {
    const query = req.query as SearchQuery;

    if (query.term) {
      const parsedTerm = query.term.replaceAll("\\", "\\\\");
      let index = 0;
      if (query.i) {
        index = !isNaN(parseInt(query.i)) ? parseInt(query.i) : 0;
      }
      const results = await MongoDBClient.getDefaultInstance().searchByKeyword(parsedTerm, index);

      const parsedResults = results.map((profile) => {
        return { username: profile.username, posts: profile.posts.length };
      });

      res.send(parsedResults);
    }
  }
}
