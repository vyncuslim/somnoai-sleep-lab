import { Router, Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import * as db from "../db";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sign } from "jose";
import { ENV } from "../_core/env";

const router = Router();

interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

/**
 * Google OAuth 登录处理
 */
router.post("/api/auth/google-signin", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    // 解码 JWT token（不验证签名，因为这是从 Google 直接获取的）
    let decoded: any;
    try {
      decoded = jwtDecode<GoogleTokenPayload>(token);
    } catch (error) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // 验证 token 是否过期
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(400).json({ error: "Token expired" });
    }

    // 验证 aud（audience）
    const expectedAudience = process.env.GOOGLE_CLIENT_ID;
    if (decoded.aud !== expectedAudience) {
      return res.status(400).json({ error: "Invalid audience" });
    }

    // 创建或更新用户
    const googleId = decoded.sub;
    const email = decoded.email;
    const name = decoded.name;

    await db.upsertUser({
      openId: googleId,
      email: email,
      name: name,
      loginMethod: "google",
      lastSignedIn: new Date(),
    });

    // 获取用户信息
    const user = await db.getUserByOpenId(googleId);
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    // 创建会话 JWT
    const secret = new TextEncoder().encode(ENV.jwtSecret);
    const sessionToken = await sign(
      {
        userId: user.id,
        openId: user.openId,
        email: user.email,
        name: user.name,
      },
      secret,
      {
        algorithm: "HS256",
        expiresIn: "7d",
      }
    );

    // 设置 cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        openId: user.openId,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

export default router;
