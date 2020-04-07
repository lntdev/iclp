'use strict';
const Logging = require('cccommon/logging').logger('common.security.security');
Logging.enable();
const crypto = require('crypto');
const fs = require('fs');
const ec_pem = require('ec-pem');
const Commonconfig  = require('cccommon/config');

const basePath = Commonconfig.security.basePath();

// Get Key files contents
const gvaPrivKey = fs.readFileSync(basePath + '/GvaPrivKey.pem', 'utf-8')
const gvaPubKey = fs.readFileSync(basePath + '/GvaPubKey.pem', 'utf-8')
const gvaEcdhPublicKey = fs.readFileSync(basePath + '/gva_ecdh_public_key.pem', 'utf-8')
const gvaEcdhEncryptionKey = fs.readFileSync(basePath + '/gva_gw_16byte_ek.base64', 'utf-8')
const gvaEcdsaPublicKeyCert = fs.readFileSync(basePath + '/gva_ecdsa_public_key.crt', 'utf-8')
const gwSingedPublicKeyCertificate = fs.readFileSync(basePath + '/signedGW.crt', 'utf-8')

// CIPHER ARGUMENTS
const CIPHER_ALGORITHM = "aes-128-cbc";
const CIPHER_IV = new Buffer("00000000000000000000000000000000", "hex");
const CIPHER_KEY = new Buffer(gvaEcdhEncryptionKey, "base64");
const ENCODING = "base64";
const HASH_SHA_256_ALGORITHM = "sha256";
const SIGN_SHA_256_ALGORITHM = HASH_SHA_256_ALGORITHM;
const PUBLIC_KEY_PEM_HEADER = "3059301306072a8648ce3d020106082a8648ce3d030107034200";

// ECDH Keys
const curve = 'prime256v1'
const ecdhPrivateKey = 'iAAOc8cMBqUo6JiHq1h3TeNI+VSivfCdEyjTwB8sXfg=';
const ecdhPublicKey = 'BDB3O3kjxvI07M/L1PWiMgGPNyohcZMxiOlbCzKezkggWhc4jyACLW7ivVRJi0zeaQobjXU0brb6cGxw80mFwow=';


exports.getGvaEcdhPublicKey = () => {
   let gvaEcdh = crypto.createECDH(curve);
   gvaEcdh.setPrivateKey(ecdhPrivateKey, 'base64');
   gvaEcdh.setPublicKey(ecdhPublicKey, 'base64');
   gvaEcdh = ec_pem(gvaEcdh, curve);
   return gvaEcdh.encodePublicKey();
}


exports.getSignedGwPublicKeyCertificate = () => {
  return gwSingedPublicKeyCertificate;
}


function initEcdh() {
   let gvaEcdh = crypto.createECDH(curve);
   gvaEcdh.setPrivateKey(ecdhPrivateKey, 'base64');
   gvaEcdh.setPublicKey(ecdhPublicKey, 'base64');
   gvaEcdh = ec_pem(gvaEcdh, curve);
   return gvaEcdh;
}


exports.validateChallengeResponse = (sessionNonce, deviceUuid, deviceEcdhPublicKeyPem, challengeResponse) => {
    Logging.msg('sessionNonce: ' + sessionNonce + '\ndeviceEcdhPublicKeyPem: ' + deviceEcdhPublicKeyPem + '\nchallengeResponse: ' + challengeResponse);
    
    let gvaEcdh = initEcdh();
    
    let deviceEcdhPublicKey = getPublicKeyFromPemFile(deviceEcdhPublicKeyPem);
    
    const GvaGwCommonSecret = gvaEcdh.computeSecret(deviceEcdhPublicKey, 'base64', 'base64');
    Logging.msg("Common Secreate : "+GvaGwCommonSecret)
    
    let ak = getAk(GvaGwCommonSecret);
    
    let computedChallengeResponse = computeChallengeResponse(Buffer(sessionNonce, 'hex'), Buffer(deviceUuid, 'hex'), new Buffer.from(ak, 'base64'));

    Logging.msg("Computed Challenge Response (HEX)     : " + computedChallengeResponse.toString('hex'));
    Logging.msg("Computed Challenge Response (Base64)  : " + computedChallengeResponse.toString('base64'));
    Logging.msg("Expetced Challenge Response (HEX)     : " + challengeResponse);

    Logging.msg("challengeResponse: " + challengeResponse + "\ncomputedChallengeResponse: " + computedChallengeResponse.toString('hex'));
    if (computedChallengeResponse.toString('hex') == challengeResponse)
      return true;
    else
      return false;
}



function computeChallengeResponse(nonce, deviceUuid, ak) {
    let data = Buffer.concat([nonce, deviceUuid]);
    Logging.msg("Compute challenge Response Data : "+data.toString("hex"));

    let tempHmac=computeHmacWithAk(data, ak);
    Logging.msg("Compute challenge Response Temp HMAC : "+tempHmac.toString("hex"));
    let hmac = Buffer.from(tempHmac, "base64");
    Logging.msg("computeChallengeResponse Full Hmac: " + hmac.toString('hex'));
    let challengeResponse = hmac.slice(0,8);
    return challengeResponse.toString('hex').toUpperCase();
}

function computeHmacWithAk(data, ak){
    Logging.msg('Key in computeHmac: ' + ak.toString('base64'));
    const hmac = crypto.createHmac('sha256', ak);
    hmac.update(data);
    let computedHmacBase64 = hmac.digest('base64');
    return computedHmacBase64;
}

function computeHmac(data) {
    const hmac = crypto.createHmac('sha256', new Buffer("0000000000000000000000000000000000000000000000000000000000000000", "hex"));
    hmac.update(data);
    let computedHmacBase64 = hmac.digest('base64');
    //console.log('hmac: ' + computedHmacBase64);
    return computedHmacBase64;
}

exports.encryptAes128UsingEcdhPubliKey = (ecdhPublicKeyPem, data) => {
  let gvaEcdh = initEcdh();
  let ecdhPublicKey = getPublicKeyFromPemFile(ecdhPublicKeyPem);
  const GvaGwCommonSecret = gvaEcdh.computeSecret(new Buffer(ecdhPublicKey, 'base64'), 'base64', 'base64');
  let ek = getEk(GvaGwCommonSecret);
  let encryptedData = encrypt(CIPHER_ALGORITHM, new Buffer(ek,'base64'), CIPHER_IV, data, ENCODING);
  return encryptedData;
}

function getEk(secretKey) {
  let cipher = Buffer.from('\x01' + 'CastleCanyonKDF' + '\x00' + 'WSN-GWAssociation-cipher');
  let key = Buffer.from(secretKey, 'base64');
  let cipherKeyArray = [cipher, key];
  let cipherKeyString = Buffer.concat(cipherKeyArray);
  let ekFullHmac = computeHmac(cipherKeyString);
  console.log('EK full Hmac: ' + ekFullHmac);
  let ekFullHmacBase64 = new Buffer(ekFullHmac, 'base64');
  console.log('EK full Hmac in base64: ' + ekFullHmacBase64.toString('base64'));
  let ekFullHmacHex = ekFullHmacBase64.toString('hex');
  console.log('EK full Hmac in Hex: ' + ekFullHmacHex);
  let ekFinal = new Buffer(ekFullHmacHex.slice(0,32), 'hex');
  console.log('EK Final in base64: ' + ekFinal.toString('base64') + ', length: ' +  ekFinal.length + 'Bytes');
  return(ekFinal.toString('base64'));
}


function getAk(secretKey){
  let cipher = Buffer.from('\x02' + 'CastleCanyonKDF' + '\x00' + 'WSN-GWAssociation-hmac');
  let key = Buffer.from(secretKey, 'base64');
  let cipherKeyArray = [cipher, key];
  let cipherKeyString = Buffer.concat(cipherKeyArray);
  
  let akFullHmac = computeHmac(cipherKeyString);
  let akFullHmacBase64 = new Buffer(akFullHmac, 'base64');
  console.log('\nAK Final in base64: ' + akFullHmacBase64.toString('base64') + ', length: ' +  akFullHmacBase64.length + 'Bytes');
  return(akFullHmacBase64.toString('base64'));
}


function getPublicKeyFromPemFile(pemFile) {
    // Strip marks out, convert base64 to hex
    console.log("PEM: " + pemFile);
    let result = Buffer.from(pemFile.toString().replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', ''), "base64").toString('hex');

    // Remove the pem header hex and convert to base64
    result = Buffer.from(result.replace(PUBLIC_KEY_PEM_HEADER, ""), 'hex').toString('base64');
    return result;
}

function getPEMPublicKeyFromCryptoECDH(gvaEcdh) {
    // Get the public key from key  pair and append header to it
    let publicKey = PUBLIC_KEY_PEM_HEADER + gvaEcdh.getPublicKey().toString('hex');

    // Convert hex to base64
    publicKey = Buffer.from(publicKey, 'hex').toString('base64');
    return publicKey;
}

/**
 * Method to hash Payload / text, for the given Algorthem and encoding format
 * 
 * @param {any} algorithm "sha256"
 * @param {any} payload  "payload | text"
 * @param {any} encoding "binary" | "base64" | "hex"
 * @returns hashed data
 */
function hashPayload(algorithm, payload, encoding) {
    // Generate the hash
    let hashResult = crypto.createHash(algorithm)
        .update(payload) // Hash the payload
        .digest(encoding); // Encode the hash

    // Return Hash result
    return hashResult
}

exports.encryptAes128 = (payload) => {
    return encrypt(CIPHER_ALGORITHM, CIPHER_KEY, CIPHER_IV, payload, ENCODING);
}

/**
 * Method encrypts given Payload with given algorithm, key, iv and encoding format.
 * 
 * @param {any} algorithm "aes-128-cbc"
 * @param {any} key "Secrete key in "binary" | "base64" | "hex" format"
 * @param {any} iv "16 Bytes in HEX format "00000000000000000000000000000000""
 * @param {any} payload "Payload | text to be encrypted"
 * @param {any} encoding "binary" | "base64" | "hex"
 * @returns "encrypted data"
 */
function encrypt(algorithm, key, iv, payload, encoding) {
    // Get createCipheriv object
    let cipherIv = crypto.createCipheriv(algorithm, key, iv);

    // Set encoding format, default "base64"
    encoding = encoding || "base64";

    // Encrypt the given payload
    let encryptedPayload = cipherIv.update(payload, "utf8", encoding);

    // Concatenate the buffers  
    encryptedPayload += cipherIv.final(encoding);

    // Return encrypted payload result.
    return encryptedPayload;
}


/**
 * Method Decrypts given encrypted Payload with given algorithm, key, iv and encoding format.
 * 
 * @param {any} algorithm "aes-128-cbc"
 * @param {any} key "Secrete key in "binary" | "base64" | "hex" format" 
 * @param {any} iv "16 Bytes in HEX format "00000000000000000000000000000000""
 * @param {any} encryptedPayload "Payload | text to be decrypted"
 * @param {any} encoding "binary" | "base64" | "hex"
 * @returns "decrypted data"
 */
exports.decrypt = (algorithm, key, iv, encryptedPayload, encoding) => {
    // Get createDecipheriv object
    let decipherIv = crypto.createDecipheriv(algorithm, key, iv);

    // Set encoding format, default "base64"
    encoding = encoding || "base64";

    // Decrypt the given encrypted payload
    let decryptedPayload = decipherIv.update(encryptedPayload, encoding);

    // Concatenate the buffers  
    decryptedPayload += decipherIv.final();

    // Return decrypted payload result.
    return decryptedPayload;
}


/**
 * Method to Sign given Payload with sha256 with ECDSA
 * 
 * @param {any} payload "Data which needs to be signed"
 * @returns Signed payload struct
 */
exports.signEs256 = (payload) => {

    // Header to hold contents
    var header = {};
    header.signingAlgorithm = "ECDSA";
    header.hashMethod = "sha256";
    header.signatureEncoding = "base64";
    header.signedBy = "GVA";

    // Get createSign object 
    const signer = crypto.createSign(header.hashMethod);
    signer.update(payload); // Add the given payload
    signer.end();

    // Sign with given Private Key
    const signature = signer.sign(gvaPrivKey)

    // Get the signature in base64 encoding
    header.signature = signature.toString(header.signatureEncoding)

    // Return the header content / struct
    return header;
}


/**
 * Method to verify SHA256 with ECDSA signature.
 * 
 * @param {any} payload "Data which needs to be verified"
 * @param {any} signature "signature data, which needs to be verified in Base64 encoding."
 * @returns "true on Match, else false"
 */
exports.verifyES256 = (payload, signature) => {
    // Set default sign result to false
    let verificationStatus = false;

    // Get createVerify object 
    const verifier = crypto.createVerify(SIGN_SHA_256_ALGORITHM);
    verifier.update(payload); // Add the given payload
    verifier.end();

    // Verify signature with given Publick Key
    verificationStatus = verifier.verify(gvaPubKey, new Buffer(signature, ENCODING));

    // Return sign verifier result
    return verificationStatus;
}

exports.getGvaEcdsaPublicKeyCert = () => {
    return gvaEcdsaPublicKeyCert;
}

exports.getGvaEcdsaPubKey = () => {
    return gvaPubKey;
}

function main() {

    // Set payload content
    const payload = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    // Sign payload
    let signHeader = exports.signEs256(payload);
    console.log("\nSignature of " + payload + " = " + signHeader.signature + "\n");

    // Verify payload
    let verificationStatus = exports.verifyES256(payload, signHeader.signature);
    console.log("Verification Status : " + verificationStatus + "\n");

    // Encode payload
    //let encryptedPayload = encrypt(CIPHER_ALGORITHM, CIPHER_KEY, CIPHER_IV, payload, ENCODING);
    let encryptedPayload = exports.encryptAes128(payload);
    console.log("Encryption of " + payload + " = " + encryptedPayload + "\n");

    // Decode payload
    let decryptedPayload = exports.decrypt(CIPHER_ALGORITHM, CIPHER_KEY, CIPHER_IV, encryptedPayload, ENCODING);
    console.log("Decryption of " + encryptedPayload + " = " + decryptedPayload + "\n");
}

//main();
