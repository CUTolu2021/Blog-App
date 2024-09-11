const express = require('express');
const router = express.Router();
const Post =  require('../models/Post');
const User =  require('../models/User');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');


const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


//ADMIN CHECK LOGIN
const authMiddleWare = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({message:"unauthorized"});
    }

    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({message: 'Unauthorized'});
    }
}






//Admin Login page GET
router.get('/admin', async (req, res)=>{
    try{
        const locals = {
            title:"Admin",
            description:"Control of the simple blog"
        }

        res.render('admin/index', {locals, layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});

//Admin Check Login POST
router.post('/admin', async (req, res)=>{
    try{
        const {username, password} = req.body;

        const user = await User.findOne({username});
        if(!user) {
            return res.status(401).json({message:'invalid credentials'});

        }
        const ispasswordValid = await bcrypt.compare(password, user.password);
        
        if(!ispasswordValid){
            return res.status(401).json({message:'Invalid credentials'});
        }
        const token = jwt.sign({userId: user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard');

        /*console.log(req.body);
        Just so you know another way to check for login 
        if(req.body.username === 'admin' && req.body.username === 'password'){
            res.send('You are logged in.') or res.redirect('/admin');

        } else {
            res.send('Wrong username or password');
        }
        */ 
    } catch (error) {
        console.log(error);
    }
});

/* POST Admin - Check Login and dashboard*/ 
router.get('/dashboard', authMiddleWare, async (req, res) => {
    
    try{ 
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blog'
        }

        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            data,
            layout: adminLayout
        });
     } catch (error) {
        console.log(error);
     }
});

//Get/ 
//Admin Create a new post
router.get('/add-post', authMiddleWare, async (req, res) => {
    
    try{ 
        const locals = {
            title: 'Add Post',
            description: 'Simple Blog'
        }

        const data = await Post.find();
        res.render('admin/add-post',{
            locals,
            layout: adminLayout
            
        });
     } catch (error) {
        console.log(error);
     }
});

//POST/ 
//Admin Create a new post
router.post('/add-post', authMiddleWare, async (req, res) => {
    
    try{
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error){
            console.log(error);
        }    
     } catch (error) {
        console.log(error);
     }
});

//GET/ 
//Admin Edit a  post
router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
    
    try{ 
        const locals = {
            title: 'Edit Post',
            description: 'Edit the Blogs'
        }

        const data = await Post.findOne({ _id: req.params.id });
        res.render('admin/edit-post',{
            locals,
            data,
            layout: adminLayout
            
        });
     } catch (error) {
        console.log(error);
     }
});
//PUT/ 
//Admin Edit a  post
router.put('/edit-post/:id', authMiddleWare, async (req, res) => {
    
    try{ 
        await Post.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect('/edit-post/${req.params.id}');

     } catch (error) {
        console.log(error);
     }
});

//  Delete
//Admin delete post
router.delete('/delete-post/:id', authMiddleWare, async (req,res) => {
    try{
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

//Admin Register POST
/*router.post('/register', async (req, res)=>{
    try{
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try{
            const user = await User.create({username, password:hashedPassword});
            res.status(201).json({ message: 'User Created', user});
        }
        catch (error) {
        if(error.code === 11000){
            res.status(409).json({ message: 'User already in use'});
        }
        res.status(500).json({message: 'Internal server error.'});       console.log(error);
    }
    }catch(error){
        console.log(error);
    }
});*/

//Get Admin Logout

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({message: 'Logout Successful.'});
    res.redirect('/');
})


module.exports = router;