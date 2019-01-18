const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

//global object for storing urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//global object for storing users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "71182": {
    id: "71182",
    email: "me@example.com",
    password: "cat"
  }
}

//GET route to show 'Hello!' when going to https://localhost:8080
app.get("/", (req, res) => {
  res.send("Hello!");
});

//GET route; 'https://localhost:8080/register' page. Uses 'urls_register.ejs' file.
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//POST route; when on 'https://localhost:8080/register', uses 'urls_register.ejs' file where the user enters email and password.
//cookie is created on the ID
app.post("/register", (req, res) => {
  let email = req.body.email;
  console.log(email); //debug statement to see email from POST parameters
  let password = req.body.password;
  console.log(password);  // debug statement to see password from POST parameters
  if (!email || !password) {
    res.status(400);
    res.redirect('/register');
  } else {
    for (let userId in users) {
      console.log('The user is: ', users[userId].email);
      if (email === users[userId].email){
        console.log('This email already exists: ', users[userId].email);
        res.status(400);
        res.redirect('/login');
        return;
      }
    }
    let id = generateRandomString();
    res.cookie('user_id', id);
    users[id] = {
      id,
      email,
      password
    };
    console.log(users); // debug statement to see the new key:value pair added to urlDatabase
    res.redirect('http://localhost:8080/urls'); //after succesful registration, redirected to 'http://localhost:8080/urls' page.
  }
});

//GET route; shows a new login page rendered from 'urls_login.ejs' file.
app.get("/login", (req, res) => {
  res.render("urls_login");
});
//POST route; when on 'http://localhost:8080/login' page, and enter email and password.
app.post("/login", (req, res) => {
  //console.log('What is showing here?', req);
  let email = req.body.email;
  console.log(email); //debug statement to see email from POST parameters
  let password = req.body.password;
  console.log(password);  // debug statement to see password from POST parameters
  if (!email || !password) {
    res.status(400);
    res.redirect('/login');
  } else {
    for (let userId in users) {
      if (email === users[userId].email){
        console.log('This user already exists: ', users[userId].email);
      }
      if (password === users[userId].password){
          let id = users[userId].id;
          res.cookie('user_id', id);
          res.redirect(`http://localhost:8080/`);
          return
      } else if (password !== users[userId].password){
            res.status(403);
            res.redirect('http://localhost:8080/login')
            return
        }

     else {
        res.status(403);
        res.redirect('http://localhost:8080/register')
        }
    }
  }
  // let userKey = req.cookies["user_id"]
  // let templateVars = {username: users[userKey].email};
});

//POST route; when logging out, should clear cookies and not remember the user's email. After logout, redirects to 'http://localhost:8080/urls' page.
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');

  res.redirect(`http://localhost:8080/login`);
});

//GET route; user id stored as a cookie and displayed as email at the top of 'https://localhost:8080/urls' page. Uses 'urls_index.ejs' file.
app.get("/urls", (req, res) => {
  console.log('This is my cookie: ', req.cookies);
  let userKey = req.cookies["user_id"] // username: req.cookies["username"]
  let templateVars = {
    urls: urlDatabase,
    user_id: users[userKey].email
  };
  res.render("urls_index", templateVars);
});

//GET route;
app.get("/urls/new", (req, res) => {
  let userKey = req.cookies["user_id"]
  let templateVars = {user_id: users[userKey].email};
  res.render("urls_new", templateVars);
});

//POST route;
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  console.log(longURL); //debug statement to see longURL from POST parameters
  let shortURL = generateRandomString();
  console.log(shortURL);  // debug statement to see random-generated shortURL string
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase); // debug statement to see the new key:value pair added to urlDatabase
  let userKey = req.cookies["user_id"]
  let templateVars = {user_id: users[userKey].email};

  res.redirect(`http://localhost:8080/urls/${shortURL}`, templateVars); // Respond with redirect
});

//GET route;
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//GET route;
app.get("/urls/:id", (req, res) => {
  let userKey = req.cookies["user_id"]
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user_id: users[userKey].email
  };
  res.render("urls_show", templateVars);
});

// POST route;
app.post("/urls/:id", (req, res) => {
  let urlToEdit = req.params.id
  urlDatabase[urlToEdit] = req.body.urlEdit;
  let templateVars = {user_id: users[userKey].email};

  res.redirect("/urls", templateVars);
});

//POST route;
app.post("/urls/:id/delete", (req, res) => {
  let urlToDelete = req.params.id
  let templateVars = {user_id: users[userKey].email};

  delete urlDatabase[urlToDelete];

  res.redirect('/urls', templateVars);
})

//GET route;
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET route;
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let random_string = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++){
    random_string += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return random_string;
}
