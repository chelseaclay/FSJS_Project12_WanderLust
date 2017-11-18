function loggedOut (req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/account');
  } else {
    next();
  }
}

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    // var err = new Error('You must be logged in to view this page.');
    // err.status = 401;
    // return next(err);
    res.redirect('/register');
  }
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
