import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import passport from "passport";
import cors from "cors";

// load env variables
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import "./db-setup";
import "./passport-setup";

import { getSpotifyCallback } from "./controllers/auth";
import { getSync } from "./controllers/sync";
import { spotifyAuth, jwtAuth } from "./passport-setup";

const app = express();

app.set("port", process.env.PORT || 9000);

app.use(cors({ origin: process.env.CLIENT_URI }));
app.use(bodyParser.json());
app.use(compression());
app.use(passport.initialize());

// The request will be redirected to spotify for authentication, so this handler will not be called.
app.get("/auth/spotify", spotifyAuth, () => {});

// Successful authentication, redirect home.
app.get("/auth/spotify/callback", spotifyAuth, getSpotifyCallback);

app.get("/sync", jwtAuth, getSync);

export default app;
