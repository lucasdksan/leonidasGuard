const { envProps } = require("../config/env");
const crypto = require("crypto");
const { leonidas_algorithm } = envProps();

function encrypt(text, password) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, "salt", 32);
    const cipher = crypto.createCipheriv(leonidas_algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(encryptedData, password) {
    const [ivHex, encryptedHex] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const key = crypto.scryptSync(password, "salt", 32);
    const decipher = crypto.createDecipheriv(leonidas_algorithm, key, iv);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

module.exports = { encrypt, decrypt };