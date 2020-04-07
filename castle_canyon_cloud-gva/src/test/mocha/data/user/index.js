exports.getDevUser = (id) => {
  const expect = T.expect;

  const userPool = Object.assign(
    {},
    require(T.ROOT_DIR + '/internaldb/seeders/20171106214634-three-dev-users').config(),
    require(T.ROOT_DIR + '/internaldb/seeders/20171119221134-add-2nd-dockworker').config()
  );
  const user = userPool[id];
  expect(user.username).to.be.a('function');
  expect(user.password).to.be.a('function');

  return user;
};
