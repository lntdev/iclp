exports.handler = async (req, res, user) => {
  // Send just enough for debugging & logged-in status/identity in UIs.
  res.status(200).send({
    username: user.email
  });
};

