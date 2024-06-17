import { Document, Filter, MongoClient, OptionalId } from "mongodb";
import "dotenv/config";
import { createHash } from "crypto";
import { PostFormat, ProfileType } from "../types/MongoDB";
import { Logger } from "../util/Logger";

export class MongoDBClient {
  private client: MongoClient;
  private static default: MongoDBClient;

  static getDefaultInstance() {
    if (!this.default) {
      this.default = new MongoDBClient();
    }
    return this.default;
  }

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI as string);
  }

  async insertToCollection(collectionName: string, document: OptionalId<Document>) {
    try {
      const collection = this.client.db("ytpinboard").collection(collectionName);

      const result = await collection.insertOne(document);
      if (result) {
        return true;
      }
      return false;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return false;
    }
  }

  async searchByKeyword(keyword: string) {
    try {
      const collection = this.client.db("ytpinboard").collection("profiles");
      const profiles = (await collection
        .find({ username: new RegExp(keyword, "i") })
        .toArray()) as ProfileType[];

      return profiles;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return [];
    }
  }

  async fetchProfileContent(username: string): Promise<PostFormat[] | null> {
    try {
      const collection = this.client.db("ytpinboard").collection("profiles");

      const data = await collection.findOne({ username: username });

      if (data === null) {
        return null;
      }

      const parsed = data as ProfileType;
      const content = parsed.posts;

      return content;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return null;
    }
  }

  async findInCollection(collectionName: string, filter: Filter<Document>) {
    try {
      const collection = this.client.db("ytpinboard").collection(collectionName);

      const data = await collection.findOne(filter);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return null;
    }
  }

  async createSessionToken(profile: string): Promise<string | null> {
    try {
      const collection = this.client.db("ytpinboard").collection("auth");

      const token = createHash("sha256").update(
        profile + Math.floor(Math.random() * profile.length) + Date.now().toString(36)
      );
      const tokenDigest = token.digest("hex");

      const result = await collection.updateOne({ username: profile }, { $set: { token: tokenDigest } });
      if (result.modifiedCount > 0) {
        return tokenDigest;
      }
      return null;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return null;
    }
  }

  async getPostByID(username: string, id: number) {
    try {
      const collection = this.client.db("ytpinboard").collection("profiles");

      const data = await collection
        .aggregate([
          { $match: { username: username, "posts.id": id } },
          {
            $project: {
              username: username,
              posts: {
                $filter: {
                  input: "$posts",
                  as: "post",
                  cond: { $eq: ["$$post.id", id] },
                },
              },
            },
          },
        ])
        .toArray();

      if (data.length <= 0) {
        return null;
      }

      const parsed = data[0] as ProfileType;

      return parsed.posts;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return null;
    }
  }

  async addPost(profile: string, date: string, heading: string, url: string) {
    try {
      const collection = this.client.db("ytpinboard").collection("profiles");

      const dateParsed = date.split("-");
      const postId = dateParsed[0] + dateParsed[1] + dateParsed[2];
      const parsedId = parseInt(postId);

      const filter = { username: profile };
      const update = {
        $push: {
          posts: Object({
            id: parsedId,
            date: date,
            heading: heading,
            url: url,
          }),
        },
      };

      const result = await collection.updateOne(filter, update);
      if (result.modifiedCount > 0) {
        return true;
      }
      return false;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return false;
    }
  }
}
