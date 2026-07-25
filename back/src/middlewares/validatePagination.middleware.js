import { apiError } from "../utils/apiError.js";
export const validatePagination=async(req,res)=>{
    try {
        const page=Number(req.query.page)||1;
        if(page<1 || isNaN(Number(page))){
            throw new apiError(401,"Page parameters are wrong.");
        }
        const limit=Number(req.query.limit) || 6;
        if(limit>10 || limit<1 || isNaN(Number(limit))){
            throw new apiError(401,"Limit should'nt exceed 10 and should be a number");
        }
        req.validatedQuery={
            ...req.validatedQuery,
            page,
            limit
        }
        next(req,res,next);
    } catch (error) {
        next(new apiError(`${error.status}`,`The request responded with ${error.message}`));
    }
}