// Generates a short, readable random password for provisioning a Poshak
// Leader's login — excludes visually ambiguous characters (0/O, 1/l/I) since
// this gets read off a screen and typed on a phone.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateRandomPassword(length = 8) {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return password;
}

module.exports = generateRandomPassword;
