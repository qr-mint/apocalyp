const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

let cache = {};
passport.cache = cache;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, (payload, done) => {
    var expirationDate = new Date(payload.exp * 1000);
    if (expirationDate < new Date()) {
      return done(null, false);
    }
    if (payload.telegram_id) {
      console.log(payload);
      return done(null, { telegram_id: payload.telegram_id, user_id: payload.user_id });
    }
    return done(null, false);
  })
);

module.exports = passport;
