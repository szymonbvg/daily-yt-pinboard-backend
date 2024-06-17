import { ObjectId } from "mongodb";

export type AuthType = {
  _id: ObjectId;
  username: string;
  pass: string;
  token: string;
};

export type PostFormat = {
  id: number;
  date: string;
  heading: string;
  url: string;
};

export type ProfileType = {
  _id: ObjectId;
  username: string;
  posts: PostFormat[];
};
