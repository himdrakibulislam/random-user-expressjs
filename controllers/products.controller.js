module.exports.getAllProducts=(req,res,next)=>{
    // const {ip,query,params,body,headers} = req;
    // console.log(ip,query,params,body,headers);
    // res.download(__dirname+'./products.controller.js');
    // const { limit,page} = req.query;
    const { id} = req.params;
    console.log(id);
    res.send("Products Found !");
    res.status(200).send({
        success:true,
        message:'Success'
    })
    // error
    // res.status(500).send({
    //     success:false,
    //     message:'Internal Server Error'
    // });

}
module.exports.saveAProducts=(req,res)=>{
    res.send("Products has been saved !");
}
module.exports.updateProduct=(req,res)=>{
    res.send("Products has been updated !");
}
module.exports.deleteProduct=(req,res)=>{
    res.send("Products has been deleted !");
}