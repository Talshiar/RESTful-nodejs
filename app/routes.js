var User = require('../app/models/user');
var Book = require('../app/models/book');
var fs = require('fs');

module.exports = function(app, passport) {

    // middleware for logging
    // app.use(function(req, res, next) {
    //     console.log(req);
    //     console.log(res);
    //     next();
    // });

    // HOME PAGE
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // LOGIN
    app.get('/login', function(req, res) {
        writeToLog(req, "/login");
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('login', {
        successRedirect : '/api',
        failureRedirect: '/login',
        failureFlash : true
    }));

    // SIGNUP
    app.get('/signup', function(req, res) {
        writeToLog(req, "/signup");
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('signup', {
        successRedirect : '/api',
        failureRedirect: '/signup',
        failureFlash : true
    }));

    // API ROOT SECTION
    app.get('/api', isLoggedIn, function(req, res) {
        writeToLog(req, "/api");
        res.render('api.ejs', {
            user : req.user
        });
    });

    // LOGOUT
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // get all users
    app.get('/api/users', isLoggedIn, function(req, res) {
        writeToLog(req, "/api/users");
        User.find(function(err, users) {
            if (err)
                res.send(err);
            res.json(users);
        });
    });

    // create new user
    app.post('/api/users', isLoggedIn, function(req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'User created.' });
        });
    });

    // get user by id
    app.get('/api/users/:user_id', isLoggedIn, function(req, res) {
        writeToLog(req, "/api/users/" + req.params.user_id);
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    });

    // update a single user
    app.put('/api/users/:user_id', isLoggedIn, function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            user.username = req.body.username;

            user.save(function(err) {
                if (err)
                    res.send(err);
                res.json( { message: 'User updated.' });
            });
        });
    });

    // delete a single user
    app.delete('/api/users/:user_id', isLoggedIn, function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err)
            res.json({ message: 'Successfully deleted.' });
        });
    });

    // get all books
    app.get('/api/books', isLoggedIn, function(req, res) {
        writeToLog(req, "/api/books");
        Book.find(function(err, books) {
            if (err)
                res.send(err);
            res.json(books);
        });
    });

    // create new book
    app.post('/api/books', isLoggedIn, function(req, res) {
        var book = new Book();
        book.name = req.body.name;
        book.author = req.body.author;

        book.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Book created.' });
        });
    });

    // get book by id
    app.get('/api/books/:book_id', isLoggedIn, function(req, res) {
        writeToLog(req, "/api/books/" + req.params.book_id);
        Book.findById(req.params.book_id, function(err, book) {
            if (err)
                res.send(err);
            res.json(book);
        });
    });

    // update a single book
    app.put('/api/books/:book_id', isLoggedIn, function(req, res) {
        Book.findById(req.params.book_id, function(err, book) {
            if (err)
                res.send(err);
            book.name = req.body.name;
            book.author = req.body.author;

            book.save(function(err) {
                if (err)
                    res.send(err);
                res.json( { message: 'Book updated.' });
            });
        });
    });

    // delete a single book
    app.delete('/api/books/:book_id', isLoggedIn, function(req, res) {
        Book.remove({
            _id: req.params.book_id
        }, function(err, book) {
            if (err)
                res.send(err)
            res.json({ message: 'Successfully deleted.' });
        });
    });

    // get a single user's books
    app.get('/api/users/:user_id/books', isLoggedIn, function(req, res) {
        writeToLog(req, "/api/users/" + req.params.user_id + "/books");
        var userbooks = [];
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            user.books.forEach(function(el) {
                Book.findById(el).exec(function(err, book) {
                    userbooks.push(book.toObject());
                    if (userbooks.length == user.books.length)
                        res.json(userbooks);
                });
            }, this);
        });
    });

    // add a book to a user
    app.put('/api/users/:user_id/books', isLoggedIn, function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            user.books.push(req.body.book_id);

            user.save(function(err) {
                if (err)
                    res.send(err);
                res.json( { message: 'User updated.' });
            });
        });
    });

    // remove a book from a user
    app.delete('/api/users/:user_id/books/:book_id', isLoggedIn, function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            user.books.pull(req.params.book_id);

            user.save(function(err) {
                if (err)
                    res.send(err);
                res.json( { message: 'Book removed from user.' });
            });
        });
    });
};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

function writeToLog(req, path){
    var browser = detectBrowser(req);
    fs.appendFile("\log.txt", path + ' ' + browser + '\r\n', function(err) {
        if (err)
            return console.log(err);
        console.log("request logged.");
    });
}

function detectBrowser(req){
    var browser = "";
    ua = req.headers['user-agent'];
    if( /firefox/i.test(ua) )
        browser = 'firefox';
    else if( /chrome/i.test(ua) )
        browser = 'chrome';
    else if( /safari/i.test(ua) )
        browser = 'safari';
    else if( /msie/i.test(ua) )
        browser = 'msie';
    else
        browser = 'unknown';
    return browser;
}

