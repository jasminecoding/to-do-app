let express = require("express");
let mongodb = require("mongodb");
let sanitizeHTML = require("sanitize-html");

let app = express();
let db;

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.use(express.static("public"));

let connectionString =
  "mongodb+srv://todoAppUser:Se@ttle1@cluster0.iod2u.mongodb.net/ToDoApp?retryWrites=true&w=majority";
mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    db = client.db();
    app.listen(port);
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", 'Basic realm="Simple To-Do App"');
  console.log(req.headers.authorization);
  if (req.headers.authorization == "Basic Y3RvamFzbWluZTpqYXNtaW5laXNjdG8=") {
    next();
  } else {
    res.status(401).send("Authentication Required.");
  }
}

app.use(passwordProtected);

app.get("/", function (req, res) {
  db.collection("items")
    .find()
    .toArray(function (err, items) {
      res.send(`<!DOCTYPE html>
    <html>
    <head>
    <link rel="shortcut icon" type="image/ico" href="img/favicon.ico" />
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>To-Do App</title> 
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
    
        <h1 class="display-4 text-center py-1">To-Do App</h1>
        <p><a href='/buy.html'>Fruit buy</a></p>
        <div class="jumbotron p-3 shadow-sm">
          <form id ="create-form" action="/create-item" method="POST" >
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">
         
        </ul>
        
      </div>

      <script> 
      let items = ${JSON.stringify(items)}
      </script>

    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script> var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = 'https://www.any.do/favicon.ico';
     </script>
    <script src="/browser.js"> </script>
    </body>
    </html>`);
    });
});

app.post("/create-item", function (req, res) {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").insertOne({ text: safeText }, function (err, info) {
    res.json(info.ops[0]);
  });
});

app.post("/update-item", function (req, res) {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").findOneAndUpdate(
    { _id: new mongodb.ObjectId(req.body.id) },
    { $set: { text: safeText } },
    function () {
      res.send("Success"); // this is the line for the AJAX call
    }
  );
});

app.post("/delete-item", function (req, res) {
  db.collection("items").deleteOne(
    { _id: new mongodb.ObjectId(req.body.id) },
    function () {
      res.send("success");
    }
  );
});
