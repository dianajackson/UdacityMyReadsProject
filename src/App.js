import React from 'react'
import * as BooksAPI from './BooksAPI'
import './App.css'
import Bookshelf from './Bookshelf'
import { Route } from 'react-router-dom'
import { Link } from 'react-router-dom'

class BooksApp extends React.Component {
  	constructor(props) {
		super(props);
      	        
		this.state = {
          	books: {},
          	bookObjects: {},
    		bookshelves: [],
          	bookshelvesById: {},
          	query: ''
    	}
      
      	this.getBookshelf = this.getBookshelf.bind(this);
    }
    
   	addBookshelfToLibrary = (bookshelf) => {
        const bookshelves = this.state.bookshelvesById;

      	if (bookshelves.hasOwnProperty(bookshelf.props.id)) {
      		console.log("..........................this bookshelf already exists");  
          	return false;
        } else {
        	bookshelves[bookshelf.props.id] = bookshelf;
                  
    		this.setState((currentState) => ({
        		bookshelvesById: bookshelves
        	})); 
          
          	return true;
        }
    }

	addBookToLibrary = (book) => {
      	console.log("App | addBookToLibrary: " + book.shelf);
    	const books = this.state.books;
      	const bookObjects = this.state.bookObjects;
         
      	books[book.id] = book.shelf || books[book.id] || "none";
		bookObjects[book.id] = book;
      
        this.setState(() => ({
        	books: books,
          	bookObjects: bookObjects
        }))
    }
                              
    updateLibraryBookShelf = (book) => {
    	const books = this.state.books;
         
      	books[book.id] = book.shelf;
       	console.log("changing library book shelf to: " + book.shelf);

        this.setState(() => ({
        	books: books	  
        }))	              
    }
                              

                              
    getBookshelf = (bookshelfName) => {
    	//console.log("retrieving " + bookshelfName);  
       	return this.state.bookshelvesById[bookshelfName];
    }
    
    getBookShelf = (id) => {
    	return this.state.books[id];  
    }

    displaySearchResults = (query) => {
      	const bookshelf = this.getBookshelf("searchResults");
      	//bookshelf.removeAllBooks();
      
      	BooksAPI.search(query).then(
        	(books) => {
                bookshelf.removeAllBooks();

          		if (books.length) {
                  	console.log(books);
                  	books.forEach((book) => {
                    	bookshelf.addBook(book, true);
                    })
                }
          	}
        )
    }

	componentDidMount() {    
      console.log("APP mounted");
      const bookshelves = {
  			currentlyReading: 	"Currently Reading",
    		wantToRead: 		"Want To Read",
    		read: 				"Read",
       		searchResults:		"Search Results"
  		};
      
		BooksAPI.getAll().then(
      		(books) => { 
          		console.log(books);

              	books.forEach((book) => {
                	this.addBookToLibrary(book)
                });
              
              	this.setState(() => ({
      				bookshelves: Object.keys(bookshelves).map(id => (<Bookshelf key={id} id={id} name={bookshelves[id]} books={books} library={this}/>))
    			}));
			},
		)
    }
    
  	render() {
    	return (
      		<div className="app">
        		<Route exact path='/' render={() => (
                    <div className="list-books">
                    	<div className="list-books-title">
                    		<h1>MyReads</h1>
                    	</div>

                    	<div className="list-books-content">
                    		<div>{this.state.bookshelves.slice(0,3)}</div>
                    	</div>
                    	<div className="open-search">
                    		<Link to='/search'>Add a book</Link>
                        </div>
                   	</div>
            	)} />
          
        		<Route exact path='/search' render={({ history }) => (
                	<div className="search-books">
            			<div className="search-books-bar">
              				<Link to='/' className="close-search" >Close</Link>
              				<div className="search-books-input-wrapper">
                				<input type="text" placeholder="Search by title or author" onChange={(e) => this.displaySearchResults(e.target.value)}/>
              				</div>
            			</div>

            			<div className="search-books-results">{this.state.bookshelves.slice(this.state.bookshelves.length-1)}</div>
          			</div>
        		)} />          
      		</div>
    	)
  	}
}

export default BooksApp
