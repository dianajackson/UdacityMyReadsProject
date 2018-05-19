import React from 'react'
import * as BooksAPI from './BooksAPI'
import './App.css'
import Bookshelf from './Bookshelf'
import { Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import ContextMenu from './ContextMenu';

class BooksApp extends React.Component {
  	constructor(props) {
		super(props);
      	        
		this.state = {
          	books: {},
          	bookshelves: {
            	currentlyReading: 	{name: "Currently Reading", books: []},
    			wantToRead: 		{name: "Want To Read", books: []},
    			read: 				{name: "Read", books: []},
       			searchResults:		{name: "Search Results", books: []}
            },
          	contextMenus: {},
          	query: ''
    	}
      
      	this.updateBookShelf = this.updateBookShelf.bind(this);
      	//this.updateBookShelfFromSearch = this.updateBookShelfFromSearch.bind(this);
    }

    displaySearchResults = (query) => {
      	const currentBooks = this.state.books;
      	const bookshelves = this.state.bookshelves;
      	const contextMenus = this.state.contextMenus;
      
      	this.setState(() => ({query: query}));
      
      	if (!query) {
          	bookshelves["searchResults"].books = [];
          
          	this.setState((currentState) => ({
            	books: [],
            	bookshelves: bookshelves
          	}));
          
        	return;  
        }
      
      	BooksAPI.search(query).then(
        	(filteredBooks) => {
          		if (filteredBooks.length) {                  
                  	filteredBooks.forEach((book) => {
                      	const bookId = book.id;
                      	//console.log(Object.keys(currentBooks));
                      	//console.log(book.id + (currentBooks.hasOwnProperty(book.id) ? " is in the list" : " is not in the list"));
                      
                    	if (!currentBooks.hasOwnProperty(book.id)) {
                       		currentBooks[bookId] = book;
                          	contextMenus[bookId] = <ContextMenu 
      									key={"contextMenu_" + bookId} 
										bookId={bookId} 
										bookshelfKey="none"
										updateBookShelf={this.updateBookShelf}
								   />;
                        } else {
                        	// Grab the current shelf for existing books
                          	console.log("... ...Grabbing " + currentBooks[bookId].shelf + " for existing book " + book.title);
                          	book.shelf = currentBooks[bookId].shelf;
                        }
                    });
                }
              
              	bookshelves["searchResults"].books = filteredBooks;
              
              	this.setState((currentState) => ({
					books: currentBooks,
              		bookshelves: bookshelves,
              		contextMenus: contextMenus
            	}));
          	}
        )
    }

	updateBookShelf = (bookId, newShelf) => {
      	const books = this.state.books;
      	const contextMenus = this.state.contextMenus;
      	const currentBookshelves = this.state.bookshelves;
      
    	console.log("... ... User clicked " + newShelf); 
      
      	BooksAPI.update({id: bookId}, newShelf).then((bookshelves) => {
        	console.log("... ...DB Updated " + this.props.id + " " + newShelf);
          
          	books[bookId].shelf = newShelf;
          	contextMenus[bookId] = <ContextMenu 
      									key={"contextMenu_" + bookId} 
										bookId={bookId} 
										bookshelfKey={newShelf}
										updateBookShelf={this.updateBookShelf}
								   />;
            
           	Object.keys(bookshelves).forEach((bookshelfKey) => {
            	const books = [];
              	bookshelves[bookshelfKey].forEach((bookId) => {
                	books.push(this.state.books[bookId]);	
                });
              
              	currentBookshelves[bookshelfKey].books = books;
            });

            this.setState((currentState) => ({
				books: books,
              	bookshelves: currentBookshelves,
              	contextMenus: contextMenus
            }));
                          
            console.log(books[bookId].title + " is now on Shelf " + this.state.books[bookId].shelf);
        });                      
    }

	updateBookShelfFromSearch = (bookId, newShelf) => {
      	this.updateBookShelf(bookId, newShelf, true);                   
    }

	componentDidMount() {    
    	console.log("APP mounted");
      
      	const booksList = this.state.books;
      	const bookshelves = this.state.bookshelves;
      	const contextMenus = this.state.contextMenus;
      
		BooksAPI.getAll().then(
      		(books) => { 
              	books.forEach((book) => {
                	booksList[book.id] = book;
                	book.shelf && bookshelves[book.shelf].books.push(book);
      				contextMenus[book.id] = <ContextMenu 
      											key={"contextMenu_" + book.id} 
												bookId={book.id} 
												bookshelfKey={book.shelf || "none"}
												updateBookShelf={this.updateBookShelf}
											/>;
                });
              
              	this.setState(() => ({
                	books: booksList,
                  	bookshelve: bookshelves,
                  	contextMenus: contextMenus
    			}));
			},
		)
    }
    
  	render() {
      	const allBookshelves = this.state.bookshelves;
      	const contextMenus = this.state.contextMenus;
      	const searchResultsBookshelfData = allBookshelves["searchResults"];
      	const searchResultsBookshelf = <Bookshelf name="Search Results" books={searchResultsBookshelfData.books} contextMenus={contextMenus}/>
		const generalBookshelves = [];

		Object.keys(allBookshelves).filter((bookshelfKey) => {return bookshelfKey !== "searchResults"})
			.forEach(bookshelfKey => {
              	const bookshelfData = allBookshelves[bookshelfKey];
            	generalBookshelves.push(<Bookshelf key={bookshelfKey} name={bookshelfData.name} books={bookshelfData.books} contextMenus={contextMenus}/>);
         	});

    	return (
      		<div className="app">
        		<Route exact path='/' render={() => (
                    <div className="list-books">
                    	<div className="list-books-title">
                    		<h1>MyReads</h1>
                    	</div>

                    	<div className="list-books-content">
                    		<div>{generalBookshelves}</div>
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
                				<input type="text" placeholder="Search by title or author" value={this.state.query} onChange={(e) => this.displaySearchResults(e.target.value)}/>
              				</div>
            			</div>

            			<div className="search-books-results">
							{searchResultsBookshelf}
						</div>
          			</div>
        		)} />          
      		</div>
    	)
  	}
}

export default BooksApp
