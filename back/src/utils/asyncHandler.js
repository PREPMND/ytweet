//HIgher Order function which returns A FUNCTION Or takes it as a PARAMETER.
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
            .catch(next);
    };
};
export {asyncHandler}