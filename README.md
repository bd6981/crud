# HTTP APIs and Microservices in Express

## Lesson Objectives

  - Define microservice architecture
  - Build a RESTful HTTP API in Express that serves JSON data from a Mongo DB
  - Use Postman to test our RESTful routes
  - Use CORS with our Express API to permit requests from other domains
  - Use jQuery to consume an Express API

## Framing 
> (10 min, 0:10)

We've just learned about using the handlebars templating engine to handle our views. This is a kind of single-server configuration, where the the server is handling models, views, and controller.


<details>
  <summary>
    What does each element in MVC do?
  </summary>
  <ul>
    <li>
      Models encapsulate information from the database and give us an interface to query the database and change data.
    </li>
    <li> 
      Views are the user-interface: they take data and render it to the page.
    </li>
    <li> 
      Controllers define how routes are handled, and what response the server provides. Controllers also contain <a href="https://en.wikipedia.org/wiki/Business_logic">'business logic'</a> for our applications.
    </li>
  </ul>
</details>

There is an alternative to the single-server architecture, which is the idea of microservices. We're briefly going to explore microservices as a category, but in the context of this lesson, we'll be talking about how to separate our views from the server. Instead, the server will serve *data in the form of JSON* that a client-side jQuery application will 'consume' and generate content from.

> This an increasingly common pattern in modern web development, especially with the rise of 'serverless' services. You may or may not be familiar with the terms Platform as a Service and Service as a Service, but these are examples of such services. See the Additional Reading header at the end of the lesson for readings on this topic.

## Microservices
> (10 min, 0:20)

Take a few minutes [to read the article here on microservices](https://pivotal.io/microservices).

We're not going to build a super complex application with many sets of endpoints today, but rather build a single microservice that implements a RESTful API over HTTP. We'll also have a basic pre-built front-end that we'll add AJAX functionality to, so that it can communicate with our REST API.

## Building an API in Express
> (5 min, 0:25)

For the remainder of class, we'll be building an application called 'book-e' which can save bookmarks for us. We'll clone down the back-end for `book-e` and examine the codebase, which just includes a model to start with. Then, we'll add a controller that serves JSON and then test the backend using a tool called [Postman, which can be downloaded here](https://app.getpostman.com/app/download/osx64).

After we've tested our API, we'll clone down a separate repository

Let's dive in!

### Book-e

#### Set Up Book-e Backend
> (5 min, 0:30)

Clone down the [book-e-backend](https://git.generalassemb.ly/ga-wdi-exercises/book-e-backend) and follow the set-up instructions there. After, you're all set up, head back here.


#### Codebase Review
> (10 min, 0:40)

Spend the next 5 minutes with a partner looking over the codebase. Then, we'll discuss each part of the starting codebase, using the commented annotations as our guide.

#### Walkthrough
> (60min, 1:40)

First, we'll install express.

```sh
 $ npm i express
```

##### Add Test Route

Next, we'll set up a controller that handles our routing.

```sh
 $ mkdir controllers/
 $ touch controllers/bookmarks.js
``` 

> In `controllers/bookmarks.js`...

```js
const express = require('express')
// This will create an instance of an express router
const Router = express.Router()
// Below, we'll use the express route handler methods to define (or set, with **setter methods**)

// Let's export this Router instance now so we don't forget to do it later!
module.exports = Router
```

We'll have to import our router and set up our application to use our controller

> In `index.js`...

```js
const express             = require('express')
const bookmarksController = require('./controllers/bookmarks')

const app = express()
const PORT = 8080

app.use('/api/bookmarks/', bookmarksController)

app.listen(PORT, () => console.log(`Live on port ${PORT}`))
```

Let's define a route and test it...

```js
Router.get('/', (req, res) => {
  res.send('<h1>Sup Multiverse?</h1>')
})
```

Now, let' try an express response method, `.json()` that we haven't seen yet...

```js
Router.get('/', (req, res) => {
  res.json({hello: 'multiverse'})
})
```

##### Reading Data

> The R in CRUD

Our controller is really intended to serve data from database, which means we need to query the database. To this end, we'll import a model that we defined on our configured `mongoose` connection to the mongo database.

```js
const mongoose = require('../db/connection')

// gets the model from our database connection, for querying and changing data  
const Bookmark = mongoose.model('Bookmark')
```

Next, let's define routes for **reading** from the database.

```js
Router.get('/', (req, res) => {
  Bookmark
    .find({})
    .then(bookmarks => res.json(bookmarks))
})

Router.get('/:title', (req, res) => {
  Bookmark
    .findOne({title: req.params.title})
    .then(bookmark => res.json(bookmark))
})
```

Let's test these routes in the browser.

##### Creating Data

> The C in CRUD

We'll need to install `body-parser` to be able to interpret the request body, and we'll add this dependency to `index.js`...


```diff
const express             = require('express')
const bookmarksController = require('./controllers/bookmarks')
+const parser              = require('body-parser')

const app = express()
const PORT = 8080

//Middleware configuration
+app.use(parser.urlencoded({extended: true})) // interprets key value pairs in URLs
+app.use(parser.json()) // interprets a stringified JSON object on the request body

app.use('/api/bookmarks/', bookmarksController)

app.listen(PORT, () => console.log(`Live on port ${PORT}`))
```

Then, in `controllers/bookmarks.js`...

```js
Router.post('/', (req, res) => {
  Bookmark
    .create(req.body)
    .then(bookmarks => res.json(bookmarks))
})
```


##### Updating Data

> The U in CRUD

```js
Router.put("/:title", (req, res) => {
  Bookmark
    .findOneAndUpdate({ title: req.params.title }, req.body)
    .then(bookmark => res.json(bookmark))
})
```

##### Deleting Data

> The D in CRUD

```js
Router.delete("/:title", (req, res) => {
  Bookmark
    .findOneAndRemove({ title: req.params.title })
    .then(bookmark => res.json(bookmark))
})
```

##### Integration with jQuery App

Next, we'll add the `cors` dependency. CORS stands for cross origin resource sharing.
Express is enforcing a CORS policy that prevents resource sharing without proper configuration on the back end.

Origins are separate entities, like `localhost:3000`, `localhost:8080`, `google.com`, `<insert-app-name-here>.herokuapp.com`, and so on. The npm package `cors` is middleware that allows different origins to communicate with the Express app.

```diff
const express             = require('express')
const bookmarksController = require('./controllers/bookmarks')
const parser              = require('body-parser')
+const cors                = require('cors')

const app = express()
const PORT = 8080

+app.use(cors())

app.use(parser.urlencoded({extended: true}))
app.use(parser.json())

app.use('/api/bookmarks/', bookmarksController)

app.listen(PORT, () => console.log(`Live on port ${PORT}`))
```

### Book-e Frontend

Clone down [this repository](https://git.generalassemb.ly/ga-wdi-exercises/book-e-front) and follow the set up instructions there.

## Additional Reading
- [Introduction to Microservices](https://www.nginx.com/blog/introduction-to-microservices/)
- ['Serverless' services](https://stackoverflow.com/questions/16820336/what-is-saas-paas-and-iaas-with-examples)
