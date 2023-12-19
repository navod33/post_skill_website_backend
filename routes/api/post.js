const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/user');
const checkObjectId = require('../../middleware/checkObjectId');


// @route    post api/posts
// @desc     posts
// @access   Private
router.post('/', [auth, [
    check('text', 'Text is required').notEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post ({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id,
        });

        const post = await newPost.save();
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
  
});


// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 });
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', [auth, checkObjectId('id')], async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // Check user
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      await post.remove();
  
      res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err.message);
  
      res.status(500).send('Server Error');
    }
  });


// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', [auth, checkObjectId('id')], async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // Check user
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      await post.remove();
  
      res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err.message);
  
      res.status(500).send('Server Error');
    }
  });



    // @route    put api/posts/like/:id
    // @desc     like a post
    // @access   Private
    router.put('like/:id', auth, async (req, res) => {

        try {
        const post = await Post.findById(req.params.id);  

        //check i the post have liked
        if(post.likes.filter(like => like.user.toString() === req.user.id ). lenght > 0){
            return res.json(400).json({msg: "post already liked"})
        }
        post.likes.unshift({ user: req.user.id }) 
        await post.save();
        res.json(post.likes);
    
        } catch (err) {
        console.error(err.message);  
        res.status(500).send('Server Error');
        }
    });




    // @route    put api/posts/unlike/:id
    // @desc     like a post
    // @access   Private
    router.put('like/:id', auth, async (req, res) => {

        try {
        const post = await Post.findById(req.params.id);  

        //check i the post have liked
        if(post.likes.filter(like => like.user.toString() === req.user.id ). lenght === 0){
            return res.json(400).json({msg: "post not already liked"})
        }
        //get the removed index
        const removeIndex = post.likes.map(like => like.user.toString(). indexOf(req.user.id));
        post.likes.splice(removeIndex, 1);
        await post.save();

        res.json(post.likes);
    
        } catch (err) {
        console.error(err.message);  
        res.status(500).send('Server Error');
        }
    });
    
    // @route    post api/posts/comments/:id
    // @desc     comment on post
    // @access   Private
    router.post('/', [auth, [
        check('text', 'Text is required').notEmpty(),
    ]], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        try{
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = new Post ({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });

            post.comments.unshift(newComment);
            await Post.save();

        }catch(err){
            console.error(err.message);
            res.status(500).send('server error');
        }
    
    });


    // @route    DELETE api/posts/:id/:comment_id
    // @desc     Delete a comment
    // @access   Private
    router.delete('/:id/:comment_id', auth, async (req, res) => {
        try {
        const post = await Post.findById(req.params.id);

        //pull out comment 
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //make sure comment exist
        if(!comment){
            res.status(400).send('comment not exist');
        }

        //check user

    
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
    
        // Check user
        if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
        }

        const removeIndex = post.comments
            .map(comment => comment.user.toString()
            .indexOf(req.user.id));

        post.comments.splice(removeIndex, 1);
        await post.save();
        return res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
    });





module.exports = router;