import { Client } from "@elastic/elasticsearch";
import env from "../env.js";

/**
 * Elasticsearch is entirely OPTIONAL here. When ELASTIC_URL is unset (or the
 * cluster is unreachable) the API falls back to MongoDB regex search, so
 * nothing in this file may throw at import time or crash a request path.
 */

let elastic = null;

if (env.ELASTIC_URL) {
    const config = { node: env.ELASTIC_URL, requestTimeout: 3000 };

    if (process.env.ELASTIC_USERNAME && process.env.ELASTIC_PASSWORD) {
        config.auth = {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
        };
    }

    elastic = new Client(config);
}

export const isElasticEnabled = () => Boolean(elastic);

export async function createIndex() {
    if (!elastic) {
        console.log("[elastic] disabled (ELASTIC_URL not set)");
        return false;
    }

    try {
        const exists = await elastic.indices.exists({ index: "videos" });

        if (!exists) {
            await elastic.indices.create({
                index: "videos",
                mappings: {
                    properties: {
                        title: { type: "text" },
                        description: { type: "text" },
                        owner: { type: "keyword" },
                        thumbnail: { type: "keyword", index: false },
                        createdAt: { type: "date" },
                    },
                },
            });
            console.log("[elastic] videos index created");
        }

        return true;
    } catch (err) {
        console.warn(`[elastic] unreachable, disabling: ${err.message}`);
        elastic = null;
        return false;
    }
}

/** Index / update one video document. Failures are logged, never thrown. */
export async function indexVideo(video) {
    if (!elastic) return;

    try {
        await elastic.index({
            index: "videos",
            id: video._id.toString(),
            document: {
                title: video.title,
                description: video.description,
                owner: video.owner?.toString?.() ?? String(video.owner ?? ""),
                thumbnail: video.thumbnail,
                createdAt: video.createdAt,
            },
        });
    } catch (err) {
        console.warn(`[elastic] index failed: ${err.message}`);
    }
}

export async function removeVideoFromIndex(id) {
    if (!elastic) return;

    try {
        await elastic.delete({ index: "videos", id: String(id) });
    } catch (err) {
        if (err?.meta?.statusCode !== 404) {
            console.warn(`[elastic] delete failed: ${err.message}`);
        }
    }
}

export default elastic;
