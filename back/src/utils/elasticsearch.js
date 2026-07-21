import { Client } from "@elastic/elasticsearch";

let elastic = null;

if (process.env.ELASTIC_URL) {
    const config = {
        node: process.env.ELASTIC_URL,
    };

    if (
        process.env.ELASTIC_USERNAME &&
        process.env.ELASTIC_PASSWORD
    ) {
        config.auth = {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
        };
    }

    elastic = new Client(config);
}

export async function createIndex() {
    if (!elastic) {
        console.log("Elasticsearch disabled");
        return;
    }

    const exists = await elastic.indices.exists({
        index: "videos",
    });

    if (!exists) {
        await elastic.indices.create({
            index: "videos",
        });

        console.log("Videos index created");
    }
}

export default elastic;