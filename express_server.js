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

  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "71182"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: ""
  }

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
    res.send('Email or Password is blank');
  } else {
    let emailExists = false;

    for (let userId in users) {
      if (email === users[userId].email){
        console.log('This email already exists: ', users[userId].email);
        emailExists = true;

      }

    }
    if (emailExists) {
      res.status(400);
      res.send('This email already exists:');
    } else {
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
  }

});

//GET route; shows a new login page rendered from 'urls_login.ejs' file.
app.get("/login", (req, res) => {
  res.render("urls_login");
});
//POST route; when on 'http://localhost:8080/login' page, and enter email and password.
app.post("/login", (req, res) => {
  let email = req.body.email;
  console.log(email); //debug statement to see email from POST parameters
  let password = req.body.password;
  console.log(password);  // debug statement to see password from POST parameters
  if (!email || !password) {
    res.status(400);
    res.send('Email or Password is blank');
  } else {
    let successfulLogin = false;

    for (let userId in users) {
      if ((email === users[userId].email) && (password === users[userId].password)){
        console.log('User logged in with: ', users[userId].email, users[userId].password);
        successfulLogin = true;
        res.cookie('user_id', users[userId].id);
        res.redirect('http://localhost:8080/urls'); //if entered existing email & password, redirected to 'http://localhost:8080/urls' page.
      }
    }
    if (!successfulLogin) {
      res.status(400);
      res.send('Email or Password is incorrect');
    }
  }

});

//POST route; when logging out, should clear cookies and not remember the user's email. After logout, redirects to 'http://localhost:8080/urls' page.
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');

  res.redirect(`http://localhost:8080/login`);
});

//GET route; user id stored as a cookie and displayed as email at the top of 'https://localhost:8080/urls' page. Uses 'urls_index.ejs' file.
app.get("/urls", (req, res) => {
  console.log('This is my cookie: ', req.cookies);
  console.log('URL DATABASE: ', urlDatabase);
  let userKey = req.cookies["user_id"] // username: req.cookies["username"]
  let userUrls = specificUserUrls(userKey);
  console.log('UserURLS: ', userUrls);
  let templateVars = {
    urls: userUrls,
    user_id: users[userKey].email
  };
  res.render("urls_index", templateVars);
});

//GET route;
app.get("/urls/new", (req, res) => {
  let userKey = req.cookies["user_id"]
  console.log(userKey);
  if (userKey){
    let templateVars = {
    urls: urlDatabase,
    user_id: users[userKey].email
  };
  res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }

});

//POST route;
app.post("/urls", (req, res) => {
  let userKey = req.cookies["user_id"]
  let templateVars = {user_id: users[userKey].email};
  let longURL = req.body.longURL;
  console.log(longURL); //debug statement to see longURL from POST parameters
  let shortURL = generateRandomString();
  console.log(shortURL);  // debug statement to see random-generated shortURL string
  let userID = userKey;
  urlDatabase[shortURL] = {shortURL, longURL, userID};
  console.log(urlDatabase); // debug statement to see the new key:value pair added to urlDatabase

  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

//GET route;
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//GET route;
app.get("/urls/:id", (req, res) => {
  let userKey = req.cookies["user_id"]
  let userUrls = specificUserUrls(userKey);
  let templateVars = {
    shortURL: req.params.id,
    urls: userUrls,
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
  let userKey = req.cookies["user_id"]
  let userUrls = specificUserUrls(userKey);
  if (userUrls)
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

function specificUserUrls(user_id) {
  let userUrls = {};
  for (let key in urlDatabase) {
    let user = urlDatabase[key].userID;
    if (user_id === user) {
      userUrls[urlDatabase[key].shortURL] = urlDatabase[key].longURL;
    }
  }
  return userUrls;
}

function generateRandomString() {
  let random_string = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++){
    random_string += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return random_string;
}
