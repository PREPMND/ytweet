import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { Client } from "@elastic/elasticsearch";
import { MongoConnection } from "../src/db/index.js";
import { Video } from "../src/models/video.models.js";

const elastic = new Client({
    node: process.env.ELASTIC_URL,
});

await MongoConnection();

const videos = await Video.find();

console.log("Videos found:", videos.length);

for (const video of videos) {
    console.log("Indexing:", video.title);

    const res = await elastic.index({
        index: "videos",
        id: video._id.toString(),
        document: {
            title: video.title,
            description: video.description,
            owner: video.owner.toString(),
            thumbnail: video.thumbnail,
            createdAt: video.createdAt,
        },
    });

    console.log("Indexed:", res.result);
}

await elastic.indices.refresh({ index: "videos" });

const count = await elastic.count({
    index: "videos",
});

console.log("Elastic count:", count.count);