const fs = require('fs');
const randomUser = fs.readFileSync('randomUser.json');
const request = require('request');
const getAllrandomUser = JSON.parse(randomUser);
//get a random user from json file
module.exports.getRandom=(req,res,next)=>{
    // randomize the array using shuffle algorithom
        for (var i = getAllrandomUser.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = getAllrandomUser[i];
            getAllrandomUser[i] = getAllrandomUser[j];
            getAllrandomUser[j] = temp;
        }
       const randomOne =  getAllrandomUser.slice(0,1);
    res.send(randomOne);
}
// get all random user from json file 
module.exports.getAll=(req,res,next)=>{
    res.send(getAllrandomUser);
}
// save a data 
module.exports.postData=async(req,res,next)=>{
   
    // request('https://randomuser.me/api/', function (error, response, body) {
    // const userData = JSON.parse(body);
    // let id = getAllrandomUser.length +1;
    // getAllrandomUser.forEach(user => {
    //     if(user.id == id ){
    //         id+=1;
    //     }else if(user.id == id){
    //         id+=1;
    //     }
    // });
    // const gender = userData.results[0].gender;
    // const name = userData.results[0].name.first;
    // const contact = userData.results[0].phone;
    // const address = `${userData.results[0].location.country},${userData.results[0].location.city},${userData.results[0].location.state}`;
    // const photoUrl = userData.results[0].picture.large;
    // const user ={
    //     id,
    //     gender,
    //     name,
    //     contact,
    //     address,
    //     photoUrl
    // }
    const request = req.body;
    if(request.id == '' || request.name == '' || request.gender == '' || request.contact == '' || request.address == '' || request.photoUrl == ''){
        res.send("Please Enter User Information");
    }else{
        const find = getAllrandomUser.find(user => user.id == request.id);
        if(find){
            res.send("Enter unique Data");
        }else{
            const user ={
                id:parseInt(req.body.id),
                name:req.body.name,
                gender:req.body.gender,
                contact:req.body.contact,
                address:req.body.address,
                photoUrl:req.body.photoUrl
            }
            
            const fileData = JSON.parse(fs.readFileSync('randomUser.json'))
            fileData.push(user);
            fs.writeFileSync('randomUser.json', JSON.stringify(fileData, null, 2));
            res.send("Random user Added");
        }
      
    }

    // });
}
//update a random user 
module.exports.updatePost=(req,res,next)=>{
    const id = req.params.id;
    const request = req.body;
    const getUserById = getAllrandomUser.find(user => user.id ==id);
    if(getUserById){
       
        if(request.body == {}){
            res.send("Enter Some Information")
        }else{
          
          
                const user ={
                    id:parseInt(request.id),
                    gender: request.gender,
                    name : request.name,
                    contact: request.contact,
                    address : request.address,
                    photoUrl : request.photoUrl,
                }
                const filteringUser = getAllrandomUser.filter(getUser => getUser.id != id);
                filteringUser.push(user);
                fs.writeFileSync('randomUser.json', JSON.stringify(filteringUser, null, 2));
                res.send(`updated id ${id}`); 
            }
        
    }else{
        res.send("User Does Not Exist");
    }
   
}
// update some user 
module.exports.updateSomeUser=(req,res,next)=>{
    const id1 = parseInt(req.body.id1);
    const id2= parseInt(req.body.id2);
    const id3 = parseInt(req.body.id3);

    const contact1 = req.body.contact1;
    const contact2 = req.body.contact2;
    const contact3 = req.body.contact3;
    const user1 = getAllrandomUser.find(u1 => u1.id == id1);
    user1['contact'] = contact1;
    const user2 = getAllrandomUser.find(u2 => u2.id == id2);
    user2['contact'] = contact2;
    const user3 = getAllrandomUser.find(u3 => u3.id == id3);
    user3['contact'] = contact3;
    fs.writeFileSync('randomUser.json', JSON.stringify(getAllrandomUser, null, 2));
   
    res.send("User Ids has benn updated");
}
//delete post 
module.exports.deletePost=(req,res,next)=>{
    //generate a random 1 digit number between 1-max length of json file data 
    // const deletingId = Math.floor(Math.random() * getAllrandomUser.length) + 1;
    const id = req.params.id;
    const findingId = getAllrandomUser.find(u => u.id == id);
    if(findingId){
        const remainingRandomUser = getAllrandomUser.filter(remainUser => remainUser.id != id);
        fs.writeFileSync('randomUser.json', JSON.stringify(remainingRandomUser, null, 2));
        res.send(`Deleted id ${id}`);
    }else{
        res.send("User Not Found");
    }

}