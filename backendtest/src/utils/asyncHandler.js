//HIgher Order function which returns A FUNCTION Or takes it as a PARAMETER.
const asyncHandler=(requestHandler)=>{
    //returns a function
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next).catch((err)=>{next(err)}))
    }
}
export {asyncHandler}