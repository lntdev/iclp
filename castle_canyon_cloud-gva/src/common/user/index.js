'use strict';

const crypto = require('crypto');

/**
 * Generate a password hash from the raw version.
 *
 * NOTE:
 *
 * This function does not make any attempt to provide the level of security
 * appropriate for a system that natively stores user credentials.
 *
 * For the December demo, the system only needs to support basic username/password logins
 * from two clients.
 *
 * Post December, the system will likely migrate to a managed system like Azure Active
 * Directory and store no user credentials natively whatosever.
 *
 * @param {string} raw The password known to the user account owner.
 * @return {string} Hash of the raw password.
 */
exports.genPasswordSync = (raw) => {
  return crypto.pbkdf2Sync(raw, 'castle-canyon-password-salt-aQAw0XASX0WpU', 100000, 64, 'sha256').toString('base64');
};

/**
 * Generate an API token.
 *
 * NOTE:
 *
 * This function does not make any attempt to provide the level of security
 * appropriate for a system that natively stores user credentials.
 *
 * For the December demo, the system only needs to support basic username/password logins
 * from two clients.
 *
 * Post December, the system will likely migrate to a managed system like Azure Active
 * Directory and store no user credentials natively whatosever.
 *
 * @return {string} Random token.
 */
exports.genTokenSync = () => {
  return crypto.randomBytes(64).toString('base64');
};
