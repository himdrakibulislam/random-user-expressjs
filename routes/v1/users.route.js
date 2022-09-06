const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/users.controller');
router
    .route("/random")
    .get(usersController.getRandom);
router.route("/all")
    .get(usersController.getAll);
router.route("/save")
    .post(usersController.postData);
router.route("/update/:id")
    .patch(usersController.updatePost)
router.route("/bulk-update")
    .patch(usersController.updateSomeUser)
router.route("/delete/:id")
    .delete(usersController.deletePost);

    
module.exports = router;