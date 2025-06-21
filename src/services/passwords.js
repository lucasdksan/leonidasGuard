const fs = require("fs").promises;
const path = require("path");
const { encrypt, decrypt } = require("./crypto");

const secretsPath = path.join(__dirname, "..", "db", "secrets.enc");

async function initializePasswordFile(masterPassword) {
    try {
        await fs.access(secretsPath);

        const content = await fs.readFile(secretsPath, "utf8");

        if (!content || content.trim() === "") {
            console.warn("Arquivo existe mas está vazio. Inicializando com array criptografado.");
            const emptyEncrypted = encrypt("[]", masterPassword);
            await fs.writeFile(secretsPath, emptyEncrypted, "utf8");
            return;
        }

        try {
            const decrypted = decrypt(content, masterPassword);
            JSON.parse(decrypted);
        } catch (err) {
            console.warn("Arquivo já existe e contém dados criptografados. Ignorando.");
        }

    } catch (err) {
        console.warn("Arquivo de senhas não encontrado. Criando novo.");
        const emptyEncrypted = encrypt("[]", masterPassword);
        await fs.writeFile(secretsPath, emptyEncrypted, "utf8");
    }
}

async function loadPasswords(masterPassword) {
    try {
        const encrypted = await fs.readFile(secretsPath, "utf8");
        const decrypted = decrypt(encrypted, masterPassword);
        return JSON.parse(decrypted);
    } catch (err) {
        if (err.code === "ENOENT") return [];
    }
}

async function savePasswords(passwordList, masterPassword) {
    const json = JSON.stringify(passwordList, null, 2);
    const encrypted = encrypt(json, masterPassword);
    await fs.writeFile(secretsPath, encrypted, "utf8");
}

async function addPassword(app, user, password, masterPassword) {
    const list = await loadPasswords(masterPassword);
    const passwordCrip = encrypt(password, masterPassword);
    list.push({ app, user, password: passwordCrip });
    await savePasswords(list, masterPassword);
}

async function getPasswords(masterPassword) {
    const list = await loadPasswords(masterPassword);
    return list.map((entry) => ({
        app: entry.app,
        user: entry.user,
        password: decrypt(entry.password, masterPassword),
    }));
}

async function deletePassword(key, masterPassword) {
    const list = await loadPasswords(masterPassword);

    try {
        if(!Array.isArray(list)) throw new Error("Lista não identificada");
        if(!list.find((element) => element.app === key)) throw new Error("Lista não identificada");

        const listFiltered = list.filter((element) => element.app !== key);
        await savePasswords(listFiltered, masterPassword);
    } catch (error) {
        console.log("Dado não identificado");
    }
}

module.exports = {
    loadPasswords,
    savePasswords,
    addPassword,
    getPasswords,
    deletePassword,
    initializePasswordFile
};
