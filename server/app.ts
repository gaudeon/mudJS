/// <reference path="_all.d.ts" />
"use strict";

import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";
import * as mongoose from "mongoose";
import * as session from "express-session";
import * as connectMongo from "connect-mongo";

import * as indexRoute from "./routes/index";
import * as userRoute from "./routes/user";

// connect to database
mongoose.connect("mongodb://localhost/mudjs"); // TODO: This should be setup to be persistent and pull db from config

// Use bluebird promises for mongoose
mongoose.Promise = require("bluebird");

/**
 * The server.
 *
 * @class Server
 */
class Server {

  public app: express.Application;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //configure routes
    this.routes();
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   * @return void
   */
  private config() {
    //mount json form parser
    this.app.use(bodyParser.json());

    //mount query string parser
    this.app.use(bodyParser.urlencoded({ extended: true }));

    //add static paths
    this.app.use("/public", express.static(path.join(__dirname, "../client/public")));
    this.app.use("/public/bower_components", express.static(path.join(__dirname, "../bower_components")));

    // catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      var error = new Error("Not Found");
      err.status = 404;
      next(err);
    });

    // setup sessioning -- TODO: need to clean all of this up more later because i'm not sure all of this belows in this function
    const mongoStore: connectMongo.MongoStoreFactory = connectMongo(session);

    let sessionOptions = {
        secret: "populate me using an external config file",
        cookie: {
            secure: false
        },
        store: new mongoStore({ mongooseConnection: mongoose.connection })
    };

    if (this.app.get("env") === "production") {
        this.app.set("trust proxy", 1); // trust first proxy
        sessionOptions.cookie.secure = true; // serve secure cookies
    }

    this.app.use(session(sessionOptions));
  }

  /**
   * Configure routes
   *
   * @class Server
   * @method routes
   * @return void
   */
  private routes() {
    //get router
    let router: express.Router;
    router = express.Router();

    //create routes
    var index: indexRoute.Index = new indexRoute.Index();
    var user: userRoute.User = new userRoute.User();

    //home page
    router.get("/", index.index.bind(index.index));

    //user functions
    router.get("/user/isAuthenticated", user.isAuthenticated.bind(user.isAuthenticated));
    router.post("/user/login", user.login.bind(user.login));

    //use router middleware
    this.app.use(router);
  }
}

var server = Server.bootstrap();
export = server.app;
