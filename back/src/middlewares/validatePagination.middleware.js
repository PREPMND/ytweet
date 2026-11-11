import { apiError } from "../utils/apiError.js";

const SORTS = new Set(["latest", "oldest", "mostViewed"]);

/**
 * Normalises ?page / ?limit / ?sort into `req.validatedQuery`.
 *
 * The old version did `next(new apiError(\`${error.status}\`, ...))`, which
 * produced a *string* status code (and "undefined" at that), so the error
 * handler fell through to 500. Status codes must stay numbers.
 */
export const validatePagination = ({ maxLimit = 24, defaultLimit = 6 } = {}) => {
    return (req, res, next) => {
        const rawPage = req.query.page ?? 1;
        const rawLimit = req.query.limit ?? defaultLimit;

        const page = Number(rawPage);
        const limit = Number(rawLimit);

        if (!Number.isInteger(page) || page < 1) {
            return next(new apiError(400, "`page` must be an integer >= 1"));
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
            return next(new apiError(400, `\`limit\` must be an integer between 1 and ${maxLimit}`));
        }

        const sort = req.query.sort ?? "latest";

        if (!SORTS.has(sort)) {
            return next(
                new apiError(400, `\`sort\` must be one of: ${[...SORTS].join(", ")}`)
            );
        }

        req.validatedQuery = {
            page,
            limit,
            skip: (page - 1) * limit,
            sort,
            search: typeof req.query.search === "string" ? req.query.search : "",
        };

        next();
    };
};

export const SORT_MAP = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    mostViewed: { views: -1, createdAt: -1 },
};
