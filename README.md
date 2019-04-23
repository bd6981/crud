[![General Assembly Logo](https://camo.githubusercontent.com/1a91b05b8f4d44b5bbfb83abac2b0996d8e26c92/687474703a2f2f692e696d6775722e636f6d2f6b6538555354712e706e67)](https://generalassemb.ly/education/web-development-immersive)

# JSON APIs in Express & Postman

## Prerequisites

- Express Routes
- Mongoose.js
- Data modeling / ERDs

## Lesson Objectives

- Build an HTTP API in Express that serves JSON data from a Mongo DB
- Use Postman to test our routes
- Use CORS with our Express API to permit requests from other domains

# TODO

build order:

- index js to setup server, first route
- cors
- Seed the db

- we do: build bookmark model

- we do: build one bookmark controller route (GET)
- we do: bookmark controller POST/create
  - bodyparser
- update route
- delete route

afternoon:

- you do: build user model
  - we do: add refs to user and bookmark
- you do: build users GET, POST/create
- we do: build users UPDATE
- you do: users DELETE
- we do: create w/relation

## Framing (5 min, 0:05)

Instead of directly rendering a view (as HTML), the server will serve **data in
the form of JSON** that a client-side JS application will 'consume' and generate
content from.

> This an increasingly common pattern in modern web development, especially with
> the rise of 'serverless' services. You may or may not be familiar with the
> terms Platform as a Service and Service as a Service, but these are examples
> of 'serverless' services. See the additional reading
> [here](http://insightaas.com/serverless-computing-no-servers-really/).

We're not going to build a super complex application with many sets of endpoints
today, but rather build a single service that implements an API over HTTP.

## Building an API in Express (5 min, 0:10)

For the remainder of class, we'll be building an application called 'book-e'
which can save bookmarks for us. We'll clone down the back-end for `book-e` and
examine the a finished version of the codebase, which includes two models to
start with. Then, we'll add a controller that serves JSON and then test the
backend using a tool called Postman.

## Book-e

### Set Up Book-e Backend (5 min, 0:15)

Clone down the
[book-e-json](https://git.generalassemb.ly/dc-wdi-node-express/book-e-json) API
**FOLLOW THE SET-UP INSTRUCTIONS**.

Download [Postman here](https://app.getpostman.com/app/download/osx64) if you
don't have it already. You'll need to create an account (free!) to use it.

### Codebase Review (15 min, 0:30)

Pick a partner! Get up and move your seats! Don't just pick someone next to you.

Then, spend the next 10 minutes looking over the codebase together. There are
lots of comments explaining stuff.

Afterwards, we'll discuss each part of the starting codebase, using the
commented annotations as our guide.

Here are some things to think about while browing the codebase:

- Look at the requires at the top of each file. How do they relate to each
  other?
- How do we connect to mongoDB?
- Where are our models stored? What are the properties of each model?
- What is the router doing?
- Where are we using the models?

If you don't know what's going on in some area of the codebase, write down a
question and we'll discuss it together.

Make sure you switch back to the `master` branch before starting to code
anything.

## Setup express

Before we can do anything, we need to actually make express work and listen for
requests.

In your `index.js` file add this below the requires:

```js
// instantiate express
const app = express()
```

This is great! Now our server should run with `nodemon`. But it doesn't do
anything yet.

Let's tell express to listen for requests on a couple routes. Add the following
code:

```js
// at the top
const bookmarksController = require("./controllers/bookmarks")
const userController = require("./controllers/users")

// ... below express()

app.use("/api/bookmarks/", bookmarksController)
app.use("/api/users/", userController)
```

Great!

> What do we have to do to get these routes to actually run? Make a request to
> them!

Looking at the two paths we just defined, and the only route in the
`bookmarksController`, what's the url that we have to make a request to, to
trigger that method to run?

<details>
<summary>
	Answer
</summary>

`http://localhost:8080/api/bookmarks`

</details>

### Build our models

Currently we have two files where models should be. Lets build them out before
we attempt to use them.

Here's a fully fledged example for the Bookmark model, let's just talk through
this.

```js
// require the mongoose package from the connection pool
const mongoose = require("../connection")

// make a new schema with 3 properties, and assign it to a variable
const BookmarkSchema = new mongoose.Schema({
  title: String,
  url: String,
  favorited: [
    // ref will point to the User schema, once we make it
    {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId
    }
  ]
})

// instantiate the model, calling it "Bookmark" and with the schema we just made
let bookmark = mongoose.model("Bookmark", BookmarkSchema)

// export the newly created model
module.exports = bookmark
```

Following this same pattern, try to build out the User model. It should have 3
properties:

- email: String
- name: String
- favorites: ref to the Bookmark model

Check out the
[mongoose schematypes](https://mongoosejs.com/docs/schematypes.html) for all the
various types that aren't strings.

### Making our first route

We have a bookmarks route, lets make it do something. Right now that method is
empty.

> In `controllers/bookmarks.js`...

```js
router.get("/", (req, res) => {
  res.send("<h1>Sup Multiverse?</h1>")
})
```

As expected, when you go to `http://localhost:8080/apis/bookmarks`, you see an
`h1` element that contains 'Sup Multiverse?'.

Now, let's send a json response instead of plain html.

```js
router.get("/", (req, res) => {
  res.json({ hello: "multiverse" })
})
```

<details>
  <summary>What do you see in the browser?</summary>
  The browser renders a JSON object - the contents of which are the object we just defined.
</details>

This is the basis for how we will send data from the database to the front end.

### Reading Data

> The R in CRUD

Our controller is really intended to serve data from database, which means we
need to query the database. To this end, we will use the model which defined
using mongoose.

Next, let's fill out the routes for **reading** from the database.

```js
//...
// import the bookmark model
const Bookmark = require("../db/models/Bookmark")

router.get("/", (req, res) => {
  // use the bookmark model to find all bookmarks
  Bookmark.find({}).then(bookmarks => res.json(bookmarks))
})

//...
```

### We do: Get bookmark by title (20 min)

Using the same bookmark controller and model, we'll add a route for title.

First let's add the route and console log:

```js
router.get("/:title", (req, res) => {
  console.log("it works")
  res.send("here is the title")
})
```

What's up with this `:title` syntax though? This is how we tell express to
expect a `variable` to be passed in. In this case it's called a `param` and
express will interpret it and give it to us in the request object, in another
object called `params`.

```js
router.get("/:title", (req, res) => {
  console.log(req.params)
  res.send("here is the title: " + req.params.title)
})
```

So if we visit `localhost:8080/api/bookmarks/reddit` then `req.params.title`
will be equal to `reddit`.

This isn't that useful right now though. We can use the param to look up a
bookmark by title.

```js
router.get("/:title", (req, res) => {
  // use the model to look up a bookmark by title
  Bookmark.find({ title: req.params.title }).then(bookmarks =>
    res.json(bookmarks)
  )
})
```

### Testing routes

Now let's test these routes in the browser!

> Note: In URLs, spaces are represented with `%20`.

Make sure `nodemon` is running and you don't have any errors, and open two
routes in your browser:

- `localhost:8080/api/bookmarks/`
- `localhost:8080/api/bookmarks/reddit`

The first should show you every bookmark in the database (if you seeded it
correctly). The second should show you just one bookmark.

## Break (10 min)

### Creating Data

> The C in CRUD

There are a bunch of different methods we can use to retrieve data, but there's
really only one used to create new data: `.create()`

If you look at the `seed.js` file, you can see the model in action.

Let's set up a route in our bookmarks controller to listen for POST requests.
This is the convention we usually use to create data.

```js
router.post("/", (req, res) => {
  let newBookmark = req.body
  // option 1
  // console log the request body
  console.log(newBookmark)
  // and send the request back just as we received it
  res.json(newBookmark)
})
```

Unfortunately, this won't work without some additional setup.

Express needs to be told how to handle certain types of requests - in this case,
a POST request that also contains some JSON (since that's what we'll be
sending).

We'll use an npm package called `body-parser` to be able to interpret the
request body. This will automatically parse the json and put it into the
`request` object for us.

Let's require and configure it in `index.js`...

```diff
const express             = require('express')
+const parser              = require('body-parser')

const app = express()

const bookmarksController = require('./controllers/bookmarks')

// interprets key value pairs in URLs
+app.use(parser.urlencoded({extended: true}))

// converts a json string to the an object and attaches it to req.body
+app.use(parser.json())


app.use('/api/bookmarks/', bookmarksController)

app.listen(8080, () => console.log(`They see me rollin...on port 8080...`))
```

Once we have the route defined and bodyParser enabled, we can test send some
POST requests using postman.

Postman is a great tool that I hope you use all the time.

### Testing with Postman

1. Launch Postman.
2. Enter the URL into the bar at the top of the screen.
3. Click on headers and add the following...
   > ![Postman POST header config](./images/postRequestHeader.png)
4. Then, click on the body tab, select the `raw` radio button, and enter
   something like this...
   > ![Postman POST body config](./images/postRequestBody.png)
5. Hit send! Scroll down and you'll the response in the panel below.

> Note: These headers are always required when dealing with JSON. Depending on
> the client that we use (fetch, axios, etc), they can detect the type of data
> we're working with and set the headers for us automatically. Postman makes us
> do it manually.

What is the response that we get back from our API?

Check your console (wherever nodemon is running) and you'll hopefully see some
output. Postman will also show the response from the server.

// finish create

Now, instead of just console logging this, use the model to actually create a
record based on the data sent in the POST request.

```js
router.post("/", (req, res) => {
  let newBookmark = req.body

  Bookmark.create(req.body).then(bookmark => res.json(bookmark))
})
```

### You do: Updating Data (15 min)

> The U in CRUD

Updating is a bit more tricky than just retrieving or creating data - it's
basically doing both.

Combining the `params` and the `req.body` that we've used in the GET and POST
methods, try the following:

- create a new PUT route at `/api/bookmarks/:title`
- use the parameter to search for a record (see below)
- use req.body to pass in the data to the model

You'll use the model method `findOneAndUpdate()` which takes two arguments:

- the query to find a record to be updated (same as `find({})` uses)
- the new data to update the old record (an object)

What HTTP verbs should you use for each? What routes should they go on?

Test your code using Postman. Make sure you set the method to PUT on the dropdown. 

> 5 min review

### You do: Delete a record

Deleting follows a similar pattern, this time we just need to delete based on one value. We'll use title again.

- create a new DELETE route at `/api/bookmarks/:title`
- use req.params to search for a record to delete
- use `findOneAndDelete()` to delete a record by its title

> 5 min review



### Integration with a frontend

Next, we'll add the `cors` dependency. CORS stands for cross origin resource
sharing. Express is enforcing a CORS policy that prevents resource sharing
without proper configuration on the back end.

You can think of origins as website domains, like `localhost:3000`,
`localhost:8080`, `google.com`, `fuzzy-panda-cat.herokuapp.com`, and so on.

The npm package `cors` is middleware that tells express to accept requests from
different origins.

> [Here's a good article](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
> on MDN about what CORS is.

```diff
const express             = require('express')
const bookmarksController = require('./controllers/bookmarks')
const parser              = require('body-parser')
+const cors               = require('cors')

const app = express()

+app.use(cors())

app.use(parser.urlencoded({extended: true}))
app.use(parser.json())

app.use('/api/bookmarks/', bookmarksController)

app.listen(8080, () => console.log('They see me rollin...on port 8080...'))
```

### Break (10 min / 1:25)

## Additional Resources

- 

## [License](LICENSE)

1. All content is licensed under a CC­BY­NC­SA 4.0 license.
1. All software code is licensed under GNU GPLv3. For commercial use or
   alternative licensing, please contact legal@ga.co.
