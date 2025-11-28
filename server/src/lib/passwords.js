const crypto = require('crypto');

function hash(password) {
  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
  });
}

function verify(password, stored) {
  try {
    const [algo, saltHex, keyHex] = String(stored).split(':');
    if (algo !== 'scrypt') return Promise.resolve(false);
    const salt = Buffer.from(saltHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');
    return new Promise((resolve) => {
      crypto.scrypt(password, salt, key.length, (err, derivedKey) => {
        if (err) return resolve(false);
        resolve(crypto.timingSafeEqual(key, derivedKey));
      });
    });
  } catch (_) {
    return Promise.resolve(false);
  }
}

module.exports = { hash, verify };
