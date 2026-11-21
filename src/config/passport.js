const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// ─── Google OAuth ─────────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find by providerId first
          let user = await User.findOne({ provider: 'google', providerId: profile.id });

          if (!user) {
            // Check if email already registered (local account)
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link Google to existing account
              user.provider = 'google';
              user.providerId = profile.id;
              user.avatar = user.avatar || profile.photos[0]?.value;
              await user.save();
            } else {
              // Create new user
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                provider: 'google',
                providerId: profile.id,
                avatar: profile.photos[0]?.value,
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ provider: 'github', providerId: String(profile.id) });

          if (!user) {
            const email =
              profile.emails?.[0]?.value || `github_${profile.id}@devtask.local`;
            user = await User.findOne({ email });

            if (user) {
              user.provider = 'github';
              user.providerId = String(profile.id);
              user.avatar = user.avatar || profile.photos[0]?.value;
              await user.save();
            } else {
              user = await User.create({
                name: profile.displayName || profile.username,
                email,
                provider: 'github',
                providerId: String(profile.id),
                avatar: profile.photos[0]?.value,
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-passwordHash');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
