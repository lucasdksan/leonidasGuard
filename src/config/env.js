require("dotenv").config();
const { z } = require("zod");

const schema = z.object({
    leonidas_algorithm: z.string(),
    leonidas_master: z.string(),
});

function envProps() {
    const keys = schema.parse({
        leonidas_algorithm: process.env.LEONIDAS_ALGORITHM,
        leonidas_master: process.env.LEONIDAS_MASTER,
    });

    return keys;
}

module.exports = {
    envProps,
}