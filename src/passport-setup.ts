import { ExtractJwt, Strategy as JwtStrategy, VerifyCallback, StrategyOptions } from "passport-jwt";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import passport from "passport";

import User from "./models/User";
import { plusSeconds } from "./utils/time";

const jwtOpts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY
};

const verifyCallback: VerifyCallback = async (payload, done) => {
  try {
    const user = await User.findOne({ spotifyId: payload.spotifyId });
    done(null, user);
  } catch (error) {
    console.error("verifyCallback", error);
    done(error, null);
  }
};

const jwtStrategy = new JwtStrategy(jwtOpts, verifyCallback);

const spotifyOpts = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
};

const spotifyCallback = async (
  accessToken: string,
  refreshToken: string,
  expires_in: any,
  profile: any,
  done: Function
) => {
  const spotifyTokenExpires = plusSeconds(new Date(), expires_in);

  const query = { spotifyId: profile.id };
  const data = {
    spotifyRefreshToken: refreshToken,
    spotifyToken: accessToken,
    spotifyTokenExpires
  };

  try {
    let user = await User.findOneAndUpdate(query, data).exec();

    if (user === null) {
      user = await User.create({
        ...query,
        ...data
      });
    }

    done(null, user);
  } catch (error) {
    console.error("sporityStrategy", error);
    done(error, null);
  }
};

const spotifyStrategy = new SpotifyStrategy(spotifyOpts, spotifyCallback);

passport.use(jwtStrategy);
passport.use(spotifyStrategy);

export const spotifyAuth = passport.authenticate("spotify", {
  session: false,
  scope: ["user-library-read", "playlist-read-private", "user-modify-playback-state"]
});
export const jwtAuth = passport.authenticate("jwt", { session: false });
