const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const prisma = require("../prisma");

let cache = {};
passport.cache = cache;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    var expirationDate = new Date(payload.exp * 1000);
    if (expirationDate < new Date()) {
      return done(null, false);
    }

    const user = await prisma.users.findFirst({
      where: { id: payload.id },
    });
    if (user) {
      if (payload.app_key) {
        user.app_key = payload.app_key;
      }
      return done(null, user);
    }
    return done(null, false);
  })
);

module.exports = passport;
