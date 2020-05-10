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

## Framing

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

## Building an API in Express

For this class, we'll be building an application called 'book-e' which can save
bookmarks for us. We'll clone down the back-end for `book-e` and examine the a
finished version of the codebase, which includes two related models. Then we'll
build it out piece by piece, for the rest of the day.

The goal is to use the finished codebase as our guideline, so if we ever get
lost or stuck, we have something to reference.

## Book-e

### Set Up Book-e Backend

Clone down the
[book-e-json](https://git.generalassemb.ly/seir-323/book-e-json) API
and **FOLLOW THE SET-UP INSTRUCTIONS** in that readme.

Download [Postman here](https://www.postman.com/downloads/) if you
don't have it already. You'll need to create an account (free!) to use it.

### Codebase Review (10 min)

Pick a partner! Then, spend the next 10 minutes looking over the codebase together. There are
lots of comments explaining stuff. Make sure you're on the `solution` branch.

Afterwards, we'll discuss each part of the starting codebase, using the
commented annotations as our guide.

Here are some things to think about while browing the codebase:

- Look at the requires at the top of each file. How do they relate to each
  other?
- How do we connect to mongoDB?
- Where are we defining the models? Where are they being used?
- What is the router doing? Where are the routes defined?

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
const app = express();
```

This is great! Now our server should run with `nodemon`. But it doesn't do
anything yet.

Let's tell express to listen for requests on a couple routes. Add the following
code:

```js
// at the top
const bookmarksController = require("./controllers/bookmarks");
const usersController = require("./controllers/users");

// ... below express()

app.use("/api/bookmarks/", bookmarksController);
app.use("/api/users/", usersController);
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

Here's an example for the Bookmark model, let's just talk through this.

```js
// require the mongoose package from the connection pool
const mongoose = require("../connection");

// make a new schema with 3 properties, and assign it to a variable
const BookmarkSchema = new mongoose.Schema({
  title: String,
  url: String
});

// instantiate the model, calling it "Bookmark" and with the schema we just made
const Bookmark = mongoose.model("Bookmark", BookmarkSchema);

// export the newly created model
module.exports = Bookmark;
```

Following this same pattern, try to build out the User model. It should have 2
properties. We'll add the relation between them later:

- email: String
- name: String

Check out the
[mongoose schematypes](https://mongoosejs.com/docs/schematypes.html) for all the
various types that aren't strings.

### Making our first route

We have a bookmarks route, lets make it do something. Right now that method is
empty.

> In `controllers/bookmarks.js`...

```js
router.get("/", (req, res) => {
  res.send("<h1>Sup Multiverse?</h1>");
});
```

As expected, when you go to `http://localhost:8080/apis/bookmarks`, you see an
`h1` element that contains 'Sup Multiverse?'.

Now, let's send a json response instead of plain html.

```js
router.get("/", (req, res) => {
  res.json({ hello: "multiverse" });
});
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
const Bookmark = require("../db/models/Bookmark");

router.get("/", (req, res) => {
  // use the bookmark model to find all bookmarks
  Bookmark.find({}).then(bookmarks => res.json(bookmarks));
});

//...
```

### We do: Get bookmark by title (20 min)

Using the same bookmark controller and model, we'll add a route for title.

First let's add the route and console log:

```js
router.get("/:title", (req, res) => {
  console.log("it works");
  res.send("here is the title");
});
```

What's up with this `:title` syntax though? This is how we tell express to
expect a **variable** to be passed in. In this case it's called a `param` and
express will interpret it and give it to us in the request object, in another
object called `params`.

```js
router.get("/:title", (req, res) => {
  console.log(req.params);
  res.send("here is the title: " + req.params.title);
});
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
  );
});
```

### GET requests with Postman

Launch Postman. Make sure you're logged in (create an account if you don't have
one).

Ensure `mongod` and `nodemon` are running with no errors.

- Enter `localhost:8080/api/bookmarks/` in the address bar
- Ensure the dropdown says `GET`
- Click `Send`

You should see the response below, containing all the bookmarks!

Also test the route `localhost:8080/api/bookmarks/reddit`. You should see a
single bookmark as the response.

Now let's test these routes in the browser!

> Note: In URLs, spaces are represented with `%20`.

Make sure `nodemon` is running and you don't have any errors, and open the same
two urls.

If we're just testing GET routes, we can use either Postman or the browser. But
for anything more, we need to use postman, because its easier to send data.

## Break (10 min)

### Creating Data + Body Parser

> The C in CRUD

There are a bunch of different methods we can use to retrieve data, but there's
really only one used to create new data: `.create()`

If you look at the `seed.js` file, you can see the model in action.

Let's set up a route in our bookmarks controller to listen for POST requests.
This is the convention we usually use to create data.

```js
router.post("/", (req, res) => {
  let newBookmark = req.body;
  // option 1
  // console log the request body
  console.log(newBookmark);
  // and send the request back just as we received it
  res.json(newBookmark);
});
```

Unfortunately, this won't work without some additional setup.

Express needs to be told how to handle certain types of requests - in this case,
a POST request that also contains some JSON (since that's what we'll be
sending).

We'll add the `express.json` middleware to be able to interpret the
request body. This will automatically parse the json and put it into the
`request` object for us.

Let's require and configure it in `index.js`...

```diff
const express             = require('express')

const app = express()

const bookmarksController = require('./controllers/bookmarks')

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())

// this parses requests that may use a different content type
app.use(express.urlencoded({ extended: true }));


app.use('/api/bookmarks/', bookmarksController)

app.listen(8080, () => console.log(`They see me rollin...on port 8080...`))
```

Once we have the route defined and JSON parsing enabled, we can send some POST
requests using postman.

Postman is a great tool that I hope you use all the time.

### Sending Data with Postman

1. Launch Postman.
2. Enter `localhost:8080/api/bookmarks` into the bar at the top of the screen.
3. Click on headers and add the following
	- Select `POST` as the request type
	- Under headers tab, specify the `Content-Type` as `application/json`. This allows the 
	client tells the server what type of data is actually sent.
   > ![Postman POST header config](./images/postRequestHeader.png)
4. Then, click on the body tab, select the `raw` radio button, and enter
   the new bookmark we'd like to create in the database.
   > ![Postman POST body config](./images/postRequestBody.png)
5. Hit send! Scroll down and you'll the response in the panel below.

> Note: These headers are always required when dealing with JSON. Depending on
> the client that we use (fetch, axios, etc), they can detect the type of data
> we're working with and set the headers for us automatically. Postman makes us
> do it manually.

What is the response that we get back?

Check your console (wherever nodemon is running) and you'll hopefully see some
output. Postman will also show the response from the server.

Now, instead of just console logging this, use the model to actually create a
record based on the data sent in the POST request.

```js
router.post("/", (req, res) => {
  let newBookmark = req.body;

  Bookmark.create(req.body).then(bookmark => res.json(bookmark));
});
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

You'll use the model method `findOneAndUpdate()` which takes three arguments:

- the query to find a record to be updated (same as `find({})` uses)
- the new data to update the old record (an object)
- an additional option so Mongoose returns the updated document (the default is
  the original document). You can read more about the possible options
  [here](https://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate), and
  this does not have to be anything more `{ new: true }` as the third argument

What HTTP verbs should you use for each? What routes should they go on?

Test your code using Postman. Make sure you set the method to PUT on the
dropdown.

> 5 min review

### You do: Delete a record

Deleting follows a similar pattern, this time we just need to delete based on
one value. We'll use title again.

- create a new DELETE route at `/api/bookmarks/:title`
- use req.params to search for a record to delete
- use `findOneAndDelete()` to delete a record by its title

> 5 min review

## Second half

### CRUD with two related models

So far we've built out CRUD on one model. But in a lot of cases, we have more
than one, and they relate to each other. We want to be able to query them both
as they relate.

We'll start by adding relations to both our user and bookmark models.

```js
const UserSchema = mongoose.Schema({
  email: String,
  name: String,
  favorites: [
    {
      ref: "Bookmark",
      type: mongoose.Schema.Types.ObjectId
    }
  ]
});
```

```js
const BookmarkSchema = new mongoose.Schema({
  title: String,
  url: String,
  favorited: [
    {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId
    }
  ]
});
```

The key is the name of the property. In this case, they point to each other. The
value is an array of references, with a type called `ObjectId` - these are a
`Type` that is specific to mongoose. They may look like strings, but they are
their own ObjectId type, which is why we define them this way.

So if we query a user that has several `favorites`, it will look like an array
of IDs. Those IDs belong to specific bookmarks. Vice versa for querying
bookmarks, we'll see IDs that belong to users.

We don't have to do it this way - we could have a one-way relation. But for this
example, we go both directions.

> How is this different from just embedding one schema inside another?

### You do: GET Users

Using what we covered earlier, build out the route to GET all users.

- use `find()`
- send a json response
- test your work using Postman

> 5 min review

### You do: GET one user by email address

Add a new route that gets a single user by email address.

- use the route params, calling it `:email`
- use `findOne()` instead of `find()`
- send a json response
- test your work using Postman

### We do: Create a user

Now that we can query users, lets make a route to create a new user. For now, we
won't add any relations - just creating a single user without favorites.

This pattern should look familiar. We take the parsed object from the request
body and pass it directly into `create()`

```js
router.post("/", (req, res) => {
  let newUser = req.body;
  User.create(newUser).then(created => {
    res.json(created);
  });
});
```

This is fine and all, now we can create new users. But what if we want to create
new users that also have favorite bookmarks, all in one step?

### We do: Create a user with favorited bookmarks

First let's add a new route.

```js
router.post("/new", (req, res) => {});
```

Since we're touching both models, we need to make sure we have both `User` and
`Bookmark` required at the top.

```js
const User = require("../db/models/User");
const Bookmark = require("../db/models/Bookmark");
```

In our controller method we need to use both at the same time. We can do this by
nesting our creates inside of the `.then()` promises.

Also, because anything we pass in the request body gets parsed into a single
object and stored in `req.body`, we need to make sure we pass all the
information we need in a single object.

Here's an example of what that might look like:

```json
{
  "user": {
    "name": "test relation",
    "email": "test@email.com"
  },
  "bookmark": {
    "title": "test",
    "url": "http://test.com"
  }
}
```

So we can access the `user` object above in `req.body.user` and the `bookmark`
object in `req.body.bookmark`. Perfect!

Add the create methods, one inside of the other. We have to do this because
create is asynchronous, and we want to guarantee that they run in this specific
order.

```js
router.post("/new", (req, res) => {
  User.create(req.body.user).then(newUser => {
    Bookmark.create(req.body.bookmark).then(newBookmark => {});
  });
});
```

Then inside of the `then()` for bookmark's create, we'll link the two records
using their ids. We can push the ids directly into the arrays using `.push()`

```js
router.post("/new", (req, res) => {
  User.create(req.body.user).then(newUser => {
    Bookmark.create(req.body.bookmark).then(newBookmark => {
      newUser.favorites.push(newBookmark._id);
      newBookmark.favorited.push(newUser._id);

      newUser.save();
      newBookmark.save();

      res.json(newUser);
    });
  });
});
```

What's happening here?

- We're creating a user using the model method `.create()`
- Then we're creating a bookmark using the same method
- newUser, newBookmark are the newly created user objects
- We push the respective id of the newly created documents into each others
  associated arrays
- If we don't run `save()` the push will never be persisted and the relation
  will be empty
- Finally, we send back the entire document as json

There's a lot going on here! But it's really just us combining the two previous
ideas.

### You do: Favorite a bookmark

See if you can add a route that adds a bookmark to a user's favorites.

This is going to be very similar to the previous exercise!

- You'll need two params, one for the user and one for the bookmark. I prefer
  ID, but you can use any way to query them
- use `findOneAndUpdate()` for the user
- push each id into each others favorite properties
- save both
- send a json response of the user object
- test with postman!

<details>
<summary>Solution</summary>

```js
router.put("/:id/:bookmarkId", (req, res) => {
  let userID = req.params.id;
  let bookmarkID = req.params.bookmarkId;

  // find the bookmark by its id
  Bookmark.findById(bookmarkID).then(mark => {
    // find the user by its id
    // could also swap this out with email
    User.findOneAndUpdate({ _id: userID }).then(user => {
      // push each id into the others array
      user.favorites.push(mark._id);
      mark.favorited.push(user._id);
      // save both
      user.save();
      mark.save();

      // send json response
      res.json(user);
    });
  });
});
```

</details>

## Finishing

The UPDATE and DELETE methods follow the same pattern for User as they do for
Bookmark, which we did earlier. See if you can look at the solution code for
Bookmark and implement them in the User controller.

### Bonus: Redirects

Since all of our routes are defined on `/api/something`, we sometimes want a
more user-friendly way to point people in the right direction. Enter the
redirect.

We'll define a route for the base url (`/`), and have it redirect the user to
`/api/bookmarks`.

In your index.js file, above the definitions for the API routes:

```js
app.get("/", (req, res) => {
  res.redirect("/api/bookmarks");
});
```

What we're really doing here is sending back a response that is a redirect,
rather than HTML or JSON. The browser knows how to handle this, so once it
receives the redirect response it automatically follows it to the new path. This
new path is treated as a new request, so the browser then performs a GET request
to the bookmarks url.

### CORS

Sometimes we need we'll need to add the `cors` dependency. CORS stands for cross
origin resource sharing. Express is enforcing a CORS policy that cross-origin
requests without proper configuration on the back end.

You can think of origins as website domains, like `localhost:3000`,
`localhost:8080`, `google.com`, `fuzzy-panda-cat.herokuapp.com`, and so on.

Because our server runs on `localhost:8080`, any requests that come from
somewhere that is NOT `localhost:8080` will be blocked, by default. So if we had
a website that made `fetch()` requests to `localhost:8080`, they would be
blocked unless we configure cors in express.

The npm package `cors` is middleware that tells express to accept requests from
different origins. By default it just enables ALL origins.

> [Here's a good article](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
> on MDN about what CORS is.

```diff
const express             = require('express')
const bookmarksController = require('./controllers/bookmarks')
+const cors               = require('cors')

const app = express()

+app.use(cors())

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests that may use a different content type
app.use(express.urlencoded({ extended: true }));

app.use('/api/bookmarks/', bookmarksController)

app.listen(8080, () => console.log('They see me rollin...on port 8080...'))
```

</details>

## Additional Resources

- Express docs http://expressjs.com/en/4x/api.html
- mongoose.js docs https://mongoosejs.com/docs/guide.html

## [License](LICENSE)

1. All content is licensed under a CC­BY­NC­SA 4.0 license.
1. All software code is licensed under GNU GPLv3. For commercial use or
   alternative licensing, please contact legal@ga.co.
