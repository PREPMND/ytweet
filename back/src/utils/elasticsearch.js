import { Client } from "@elastic/elasticsearch";

const elastic = new Client({
    node: process.env.ELASTIC_URL,
});

export async function createIndex() {
    const exists = await elastic.indices.exists({
        index: "videos",
    });

    if (!exists) {
        await elastic.indices.create({
            index: "videos",
        });

        console.log("Videos index created");
    } else {
        console.log("Videos index already exists");
    }
}

export default elastic;