var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');

//Middleware to Protect the content if needed
function isAuthenticated(req, res, next) {

    if (req.method === 'GET') {
        //continue to the next midddleware or request handler
        return next();
    }

    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('#/login')
};

router.use('/posts', isAuthenticated);


//Route to create a new Post
router.route('/posts')
    .post(function(req, res) {
        var post = new Post();
        post.text = req.body.text;
        post.created_by = req.body.created_by;
        post.location = req.body.location;
        post.save(function(err, post) {
            if (err) {
                return res.send(500, err);
            }

            return res.json(post);

        });
    })
    //Route to show the Posts
    .get(function(req, res) {

        Post.find(function(err, data) {

            if (err) {
                return res.send(500, err);
            }
            return res.send(data);
        });
    });
//Route to show the posts by ID (not in use yet)
router.route('/posts/:id')
    .get(function(req, res) {
        Post.findById(req.params.id, function(err, post) {
            if (err) {
                res.send(err);
            }
            res.json(post);
        })
    })
    //Route to update the posts by ID (not in use yet)
    .put(function(req, res) {

        Post.findById(req.params.id, function(err, post) {

            if (err) {
                res.send(err);
            }

            post.text = req.body.text;
            post.created_by = req.body.created_by;

            post.save(function(err, post) {
                if (err) {
                    res.send(err);
                }

                res.json(post);
            })
        })
    })
    //Route to delete the posts by ID (not in use yet)
    .delete(function(req, res) {
        Post.remove({ _id: req.params.id }, function(err) {
            if (err) {
                res.send(err);
            }

            res.json('deleted:' + req.params.id);

        })

    });


module.exports = router;