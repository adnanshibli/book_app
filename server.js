'use strict';

//app dependencies
require('dotenv').config();
const express =require('express');
const superagent = require('superagent');


// app setup :
const PORT = process.env.PORT || 3000;
const app = express();  
app.use(express.static('./public'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));


//routes:
app.get('/',(req,res)=>{

    res.render('./pages/index');
})
app.get('/searches/new',(req,res)=>{

    res.render('./pages/searches/new');
})
app.post('/searches',(req,res)=>{
//intitle
//inauthor
    let query = req.body.query;
    let type = req.body.type;
    let url=`https://www.googleapis.com/books/v1/volumes?q=${query}+${type}`
    superagent.get(url).then(data=>{
        let booksArray = data.body.items.map(book=> new Book(book));
        res.render('./pages/searches/show', {books : booksArray});
    })
    


    // res.render('./pages/searches/show');
})

//constructors:

function Book (obj){
    this.description = obj.volumeInfo.description|| "There is no description for this book";
    this.title = obj.volumeInfo.title || "No title";
    this.author = obj.volumeInfo.authors || [];
    this.url = obj.volumeInfo.imageLinks ? obj.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';

}

//handler functions:
// let errorHandler = 

// }


//handle all routes and errors: 
app.get('*',(req,res)=>{
    res.render('./pages/error')});

app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
