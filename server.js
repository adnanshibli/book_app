'use strict';

//app dependencies
require('dotenv').config();
const express =require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');


// app setup :
const PORT = process.env.PORT || 3000;
const app = express();  
app.use(cors());
app.use(express.static('./public'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
const client = new pg.Client(process.env.DATABASE_URL);

//routes:
app.get('/',getAllbooks);
app.post('/postBookData', storeBook);
app.get ('/details/:id',displayDetails);
app.get('/searches/new',displayForm);
app.post('/searches',getBooksFromAPI);
app.put('/updateBook/:id', updateBookHandler);
app.delete('/deleteBook/:id',deleteBookHandler)

//constructors:

function Book (obj){
    this.isbn = obj.volumeInfo.industryIdentifiers? obj.volumeInfo.industryIdentifiers[0].type : "There is no ISBN for this book";
    this.title = obj.volumeInfo.title || "No title";
    this.author = obj.volumeInfo.authors? obj.volumeInfo.authors[0]: "UNknown";
    this.url = obj.volumeInfo.imageLinks ? obj.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = obj.volumeInfo.description || "No description" ;
}

//handler functions:
 function getAllbooks(req,res){
    let SQL = `SELECT * FROM books`;
    client.query(SQL).then(data=>{
        
        res.render('./pages/index', {books : data.rows});
    }
  )
}
function displayForm(req,res){

    res.render('./pages/searches/new');
}
function getBooksFromAPI(req,res){

    let query = req.body.query;
    let type = req.body.type;
    let url=`https://www.googleapis.com/books/v1/volumes?q=${query}+${type}`
    superagent.get(url).then(data=>{
        let booksArray = data.body.items.map(book=> new Book(book));
        res.render('./pages/searches/show', {books : booksArray});
    })
    .catch(e=>{errorHandler('Error while getting the data from API..'+e,req,res)});
}
function storeBook(req,res) {  
    let {url,title,author,isbn,description}=req.body;
    let SQL = `INSERT INTO books (author,title,isbn,image_url,description) VALUES($1,$2,$3,$4,$5) RETURNING *`;
    let safeValues = [author,title,isbn,url,description];
    client.query(SQL,safeValues).then(data=>{
        let id = data.rows[0].id;
        res.redirect(`/details/${id}`);

    })
    .catch(e=>{errorHandler('Error while getting the data which inserted to The Data Base '+e ,req,res)});
    
}

function displayDetails(req,res) {  

    let id = req.params.id;
    let SQL =`SELECT * FROM books WHERE id=$1`;
    let values =[id];
    client.query(SQL,values).then(data => {
        res.render('./pages/books/detail', {book: data.rows[0]});
    })
    .catch(e=>{errorHandler('Error while getting the data from DB'+e,req,res)});

   
}


function updateBookHandler(req,res){
   
    let {image_url,title,author,isbn,description}= req.body;
    let id = req.params.id;
    let SQL = `UPDATE books SET image_url=$1,title=$2,author=$3,isbn=$4,description=$5 WHERE id=$6`
    let safeVales=[image_url,title,author,isbn,description,id];
    client.query(SQL,safeVales).then(()=>{
        res.redirect(`/details/${id}`);
    })
    .catch(error=>{ errorHandler(error,req,res)});
    
}

function deleteBookHandler(req,res){
    let id = req.params.id;
    let SQL =`DELETE FROM books WHERE id = $1`;
    let value = [id];
    client.query(SQL,value).then(data=>{
        
        res.redirect('/')
    }
    )
    .catch(e=>{errorHandler(e,req,res)});
}

function errorHandler(error,req,res){
    res.status(500).send('something went wrong! \n',error);

}


//handle all routes and errors: 
app.get('*',(req,res)=>{
    res.render('./pages/error')});

app.use(errorHandler);


// connect db and run the server     
client.connect().then(()=>{

    app.listen(PORT,()=>{
        console.log(`listening on port ${PORT}`);
    });
    
})
