let count = 0;
function viewCount (req,res,next){
    count++;
    console.log(count);
    next();
}
module.exports = viewCount;