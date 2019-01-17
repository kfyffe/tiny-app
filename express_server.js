const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {

  res.render("urls_register");
});

app.post("/register", (req, res) => {
  console.log(req);
  let email = req.body.email;
  console.log(email); //debug statement to see email from POST parameters
  let password = req.body.password;
  console.log(password);  // debug statement to see password from POST parameters
  let userRandomID = generateRandomString();
  res.cookie('user_id', userRandomID);
  users[userRandomID] = {userRandomID, email, password};
  console.log(users); // debug statement to see the new key:value pair added to urlDatabase


  res.redirect('http://localhost:8080/urls');
});


app.post("/login", (req, res) => {
  console.log(req);
  let usernameLogin = req.body.username;
  console.log('Login username: ' + usernameLogin);
  res.cookie('username', usernameLogin);

  res.redirect(`http://localhost:8080/urls`);
});

app.post("/logout", (req, res) => {
  console.log(req);
  res.clearCookie('username');

  res.redirect(`http://localhost:8080/urls`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  console.log(longURL); //debug statement to see longURL from POST parameters
  let shortURL = generateRandomString();
  console.log(shortURL);  // debug statement to see random-generated shortURL string
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase); // debug statement to see the new key:value pair added to urlDatabase
  let templateVars = {username: req.cookies["username"]};

  res.redirect(`http://localhost:8080/urls/${shortURL}`, templateVars); // Respond with redirect
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let urlToEdit = req.params.id
  urlDatabase[urlToEdit] = req.body.urlEdit;
  let templateVars = {username: req.cookies["username"]};

  res.redirect("/urls", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  let urlToDelete = req.params.id
  let templateVars = {username: req.cookies["username"]};

  delete urlDatabase[urlToDelete];

  res.redirect('/urls', templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

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
