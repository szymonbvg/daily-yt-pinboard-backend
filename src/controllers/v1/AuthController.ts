import { Request, Response } from "express";
import { MongoDBClient } from "../../clients/MongoDBClient";
import { AuthType } from "../../types/MongoDB";
import bcrypt from "bcrypt";
import { Messages } from "../../enums/Messages";
import axios from "axios";

type AuthBody = {
  username?: string;
  pass?: string;
  token?: string;
  captchaToken?: string;
};

export class AuthController {
  async handleLogin(req: Request, res: Response) {
    const body = req.body as AuthBody;

    if (body.token) {
      const data = await MongoDBClient.getDefaultInstance().findInCollection("auth", {
        token: body.token,
      });
      if (!data) {
        res.send({ status: false });
        return;
      }

      const parsed = data as AuthType;

      res.send({ status: true, username: parsed.username });
    } else if (body.username && body.pass) {
      const data = await MongoDBClient.getDefaultInstance().findInCollection("auth", {
        username: body.username,
      });

      if (!data) {
        res.send({ status: false, message: Messages.LOGIN_ERROR });
        return;
      }

      const parsed = data as AuthType;
      const success = await bcrypt.compare(body.pass, parsed.pass);

      if (!success) {
        res.send({ status: false, message: Messages.LOGIN_ERROR });
        return;
      }

      const newToken = await MongoDBClient.getDefaultInstance().createSessionToken(body.username);
      res.send({ status: true, token: newToken });
    }
  }

  async handleRegistration(req: Request, res: Response) {
    const body = req.body as AuthBody;

    if (body.username && body.pass && body.captchaToken) {
      if (!process.env.RECAPTCHA_SECRET_KEY) {
        res.send({ status: false, message: Messages.CAPTCHA_ERROR });
        return;
      }
      const captchaRes = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        { secret: process.env.RECAPTCHA_SECRET_KEY, response: body.captchaToken },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      if (!captchaRes.data.success) {
        res.send({ status: false, message: Messages.CAPTCHA_ERROR });
        return;
      }

      const usernameRegExp = new RegExp(/^(?=.*[a-zA-Z])(?!\.)(?!.*\.$)[a-zA-Z0-9@$&._]*$/);
      if (!usernameRegExp.test(body.username)) {
        res.send({
          status: false,
          message: Messages.INVALID_USERNAME,
        });
        return;
      }

      if (body.username.length > 24) {
        res.send({ status: false, message: Messages.USERNAME_TOO_LONG });
        return;
      }
      if (body.username.length < 3) {
        res.send({ status: false, message: Messages.USERNAME_TOO_SHORT });
        return;
      }
      if (body.pass.length < 8) {
        res.send({ status: false, message: Messages.PASSWD_TOO_SHORT });
        return;
      }

      const exists = await MongoDBClient.getDefaultInstance().findInCollection("auth", {
        username: body.username,
      });

      if (exists) {
        res.send({ status: false, message: Messages.ALREADY_EXISTS });
        return;
      }

      const hash = await bcrypt.hash(body.pass, 10);
      const registered = await MongoDBClient.getDefaultInstance().insertToCollection("auth", {
        username: body.username,
        pass: hash,
      });
      if (!registered) {
        res.send({ status: false, message: Messages.ERROR });
        return;
      }

      const token = await MongoDBClient.getDefaultInstance().createSessionToken(body.username);

      const created = await MongoDBClient.getDefaultInstance().insertToCollection("profiles", {
        username: body.username,
        posts: [],
      });

      res.send({
        status: created,
        token: token,
        message: !created ? Messages.ERROR : null,
      });
    }
  }
}
