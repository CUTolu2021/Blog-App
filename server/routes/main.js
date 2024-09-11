const express = require('express');
const router = express.Router();
const Post =  require('../models/Post');


// Routes

//Home GET    
router.get('', async (req,res) => {
    try{
        const locals = {
            title: "Yield Blog",
            description:"Simple blog created with NodeJS, Express and MongoDB."
        }

        let perPage = 5;
        let page = req.query.page || 1;
        const data = await Post.aggregate([{ $sort: { createdAt: -1}}])
        .skip(perPage*page-perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments()
        const nextPage = parseInt(page)+1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        
        res.render('index', {
            locals,
            data,
            current: page, 
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
    })
}
        catch(error){
        console.log(error)
    }
});

/*function insertPostData(){
    Post.insertMany([
    {
        title: "Building a Blog",
        body: "This is the body"
    },
    {
        title: "Building a Dog",
        body: "This is the body for the dog blog"
    },
    {
        title: "Destroying a Blog",
        body: "This is my  body"
    },
    {
        title: "Building a cat",
        body: "This is the body for the cat blog"
    },
])
}
insertPostData();*/

//  GET/Post :id  
router.get('/post/:id', async (req,res) => {
    try{
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    const locals = {
        title: data.title,
        description:"Simple blog created with NodeJS, Express and MongoDB.", 
        
    }

    res.render('post',{
        locals,
        data,
        currentRoute: `/post/${slug}`
    });
} catch (error) {
    console.log(error);
}
});

//  Post/Post :search  
router.post('/search', async (req,res) => {
   
    
    try {
        const locals = {
            title: "Search",
            description:"Simple blog created with NodeJS, Express and MongoDB."
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
        
        const data = await Post.find({
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChar, 'i')}},
                {body: {$regex: new RegExp(searchNoSpecialChar, 'i')}}
            ]
        });
        res.render('search', 
            {locals,data});
    } catch (error){
        console.log(error);
    }
});


router.get('/about', (req,res) => {
    res.render('about',{
        currentRoute: '/about'
    });
});

router.get('/contact', (req,res) => {
    res.render('contact',{
        currentRoute: '/contact'
    });
});

module.exports = router;

