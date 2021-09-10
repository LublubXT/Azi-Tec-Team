const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
require('dotenv').config();

const AdmZip = require('adm-zip');

const app = express();

var counter = 0;
var viewsList = [];
var dateList = [];

var today = new Date();

var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();

var date1 = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate() + '_' + today.getTime();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "Our little item.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const Schema = mongoose.Schema;

const url2 = "mongodb://localhost:27017/views";
const url1 = "mongodb+srv://caleb:sermontracker@cluster0.i6h4q.mongodb.net/sermontracker?retryWrites=true&w=majority";

mongoose.connect(url1, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    googleId: String,
    items: Array,
    app: String
});

const ItemSchema = new mongoose.Schema({
    date: String,
    loc: String,
    title: String,
    passage: String,
    file: String
});

const ViewSchema = new mongoose.Schema({
    _id: String,
    number: Number,
    date: String
});

const BlogSchema = new mongoose.Schema({
    title: String,
    date: String,
    main: String
});

const QuestSchema = new mongoose.Schema({
    name: String,
    useremail: String,
    message: String,
    date: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Item = new mongoose.model("Item", ItemSchema);
const Views = new mongoose.model("View", ViewSchema);
const Blog = new mongoose.model("Blog", BlogSchema);
const Quest = new mongoose.model("Quest", QuestSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

function log(text) {
    console.log(text);
}

app.get("/", function(req, res) {
    counter += 1;
    res.render("main/Home");

    alowed = false;

    Views.find({ _id: date }, function(err, view) {

        if (err) {
            console.log(err);

        } else if (view == "") {

            const views = new Views({
                _id: date,
                number: 0,
                date: date
            });
            views.save();

        } else {
            view.forEach(function(v) {

                if (v.date == date) {
                    counter + v.number;
                    Views.updateOne({ date: date }, { number: counter }, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                } else if (v.date != date) {
                    const views = new Views({
                        _id: date,
                        number: 0,
                        date: date
                    });
                    views.save();
                }
                if (v.date != date) {
                    views.save();
                } else if (v.date == date) {
                    counter + v.number;
                    Views.updateOne({ _id: date }, { number: counter }, function(err) {});
                }

            });
        }
    });

    Views.find(function(err, view) {
        if (err) {
            console.log(err);
        } else {

            view.forEach(function(v) {
                viewsList.push(v.number + 1);
                dateList.push(v.date);
            });
        }
    });

});

app.get("/downloadpage", function(req, res) {

    res.render("main/DownloadPage");
});

app.get("/contact", function(req, res) {

    res.render("main/Contact");
});

app.get("/numberline", function(req, res) {

    res.render("main/Number_LineDownload");
});

app.get("/onlineapps", function(req, res) {

    res.render("main/OnlineApps");
});

app.get("/signup", function(req, res) {

    res.render("main/SignIn");
});

app.post("/signup", function(req, res) {
    var username = req.body.username;
    var firstname = req.body.firstName;
    var lastname = req.body.lastName;

    const newClient = new User({
        email: username,
        lname: lastname,
        fname: firstname,
        app: "Azi Tec Team Website"
    });

    newClient.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.get("/thanks", function(req, res) {
    res.render("main/Thanks");
});

app.get("/timeline", function(req, res) {
    res.render("main/Time_LineDownload");
});

app.get("/about", function(req, res) {
    res.render("main/About");
});

app.get("/timelinedownload", function(req, res) {
    res.download(__dirname + 'uploads/Timeline/Time Line 1.0.zip', 'Time Line 1.0.zip');
});

app.get("/numberlinedownload", function(req, res) {
    res.download(__dirname + 'uploads/Numberline/Number_Line_3.0.zip', 'Number_Line_3.0.zip');
});


app.get("/sermontrackerhome", function(req, res) {
    res.render("sermontracker/home");
});

app.get("/sermontrackerlogin", function(req, res) {
    res.render("sermontracker/login");
});

app.get("/sermonsignup", function(req, res) {
    res.render("sermontracker/signup");
});

app.get("/workspace", function(req, res) {
    User.find({ _id: req.user._id }, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else if (foundItems) {
            for (var i = 0; i < foundItems.length; i++) {
                res.render("sermontracker/workspace", { itemList: foundItems[i].items });
            }
        }

    });


});


app.post("/workspace", function(req, res) {
    const date = req.body.input1;
    const location = req.body.input2;
    const title = req.body.input3;
    const passage = req.body.input4;
    const file = req.body.input5;

    const item = new Item({
        date: date,
        loc: location,
        title: title,
        passage: passage,
        file: file
    });

    User.findById(req.user._id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.items.push(item);
                foundUser.save(function() {
                    res.redirect("/workspace");
                });
            }
        }
    });
});

app.get("/workspaceLight", function(req, res) {
    User.find({ _id: req.user._id }, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else if (foundItems) {
            for (var i = 0; i < foundItems.length; i++) {
                res.render("sermontracker/workspaceLight", { itemList: foundItems[i].items });
            }
        }

    });


});

app.post("/delete", function(req, res) {

    const delBut = req.body.deleteItem;


    User.find({ _id: req.user._id }, function(err, foundItemList) {
        if (err) {
            console.log(err);
        } else {
            if (foundItemList) {
                for (var i = 0; i < foundItemList.length; i++) {
                    var itemList = foundItemList[i].items;
                    itemList.forEach(function(item) {
                        if (item._id == delBut) {
                            //foundItemList[i].items.splice(i, 1);
                            User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { 'items': { _id: item._id } } }, function(err, model) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    if (model) {
                                        console.log(model);
                                    }
                                }
                            });
                            res.redirect("/workspace");

                        }
                    });
                }
            }
        }
    });

});

app.post("/delete1", function(req, res) {

    const delBut = req.body.deleteItem;


    User.find({ _id: req.user._id }, function(err, foundItemList) {
        if (err) {
            console.log(err);
        } else {
            if (foundItemList) {
                for (var i = 0; i < foundItemList.length; i++) {
                    var itemList = foundItemList[i].items;
                    itemList.forEach(function(item) {
                        if (item._id == delBut) {
                            //foundItemList[i].items.splice(i, 1);
                            User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { 'items': { _id: item._id } } }, function(err, model) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    if (model) {}
                                }
                            });
                            res.redirect("/workspaceLight");

                        }
                    });
                }
            }
        }
    });

})


app.post("/workspaceLight", function(req, res) {
    const date = req.body.input1;
    const location = req.body.input2;
    const title = req.body.input3;
    const passage = req.body.input4;
    const file = req.body.input5;

    const item = new Item({
        date: date,
        loc: location,
        title: title,
        passage: passage,
        file: file
    });

    User.findById(req.user._id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.items.push(item);
                foundUser.save(function() {
                    res.redirect("/workspaceLight");
                });
            }
        }
    });
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/sermontrackerhome");
});
app.post("/logout", function(req, res) {
    req.logout();
    res.redirect("/sermontrackerhome");
});

app.post("/sermonsignup", function(req, res) {

    User.register({ username: req.body.username, fname: req.body.firstName, lname: req.body.lastName, app: "Sermon Tracker" }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/sermonsignup");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/workspace");
            });
        }
    });

});

app.get("/secrets", function(req, res) {
    res.render("main/secretlogin");
});

app.get("/secretsworkspaceblog", function(req, res) {
    User.find({ _id: req.user._id }, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else if (foundItems) {
            Blog.find({}, function(err, foundItems) {
                res.render("main/secretsworkspaceblog", { post: foundItems });
            });
        }

    });
});

app.get("/secretsworkspacequestions", function(req, res) {
    User.find({ _id: req.user._id }, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else if (foundItems) {
            Quest.find({}, function(err, foundItems) {
                res.render("main/secretsworkspacequestions", { questions: foundItems });
            });
        }

    });

});

app.get("/secretsworkspaceclients", function(req, res) {
    User.find({ _id: req.user._id }, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else if (foundItems) {
            User.find({}, function(err, foundItems) {
                res.render("main/secretsworkspaceclients", { clients: foundItems });
            });
        }

    });
});

app.post("/deleteclient", function(req, res) {
    const checkedItem = req.body.deleteclient;

    if (checkedItem === "6090f79df8ffc1215322a17d") {
        console.log("You cannot delete this one!")
    } else if (checkedItem !== "6090f79df8ffc1215322a17d") {
        User.findByIdAndRemove(checkedItem, function(err) {
            console.log("Deleted User");
        });
    }

    res.redirect("/secretsworkspaceclients");
});

app.get("/secretsworkspace", function(req, res) {
    User.find({ _id: req.user._id }, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else if (foundItems) {
            Views.find({}, function(err, foundItems) {
                res.render("main/secretsworkspace", { views: viewsList, dates: dateList, dates1: date1, newListItems: foundItems });
            });
        }

    });
});

app.get("/blog", function(req, res) {
    Blog.find({}, function(err, foundItems) {
        res.render("main/blog", { post: foundItems });
    });

});

app.post("/sendmess", function(req, res) {

    var n = req.body.name;
    var e = req.body.email;
    var m = req.body.message;
    var d = Date();

    log(n);
    log(e);
    log(m);

    const message = new Quest({
        name: n,
        useremail: e,
        message: m,
        date: d
    });

    message.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});


app.post("/secretsworkspaceblog", function(req, res) {
    const blogPost = new Blog({
        title: req.body.title,
        date: date,
        main: req.body.main
    });

    blogPost.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/secretsworkspaceblog");
        }
    });
});

app.post("/deletepost", function(req, res) {
    const checkedItem = req.body.deletepost;

    Blog.findByIdAndRemove(checkedItem, function(err) {
        console.log("Deleted item");
    });

    res.redirect("/secretsworkspaceblog");
});

app.post("/deletequestion", function(req, res) {
    const checkedItem = req.body.deletequestion;

    Quest.findByIdAndRemove(checkedItem, function(err) {
        console.log("Deleted Question");
    });

    res.redirect("/secretsworkspacequestions");
});

app.post("/login", function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/workspace");
            });
        }
    });

});

// Un comment this to fix the secrets login

// app.post("/secrets", function (req, res) {

//     User.register({ username: req.body.username, app: "Secrets" }, req.body.password, function (err, user) {
//         if (err) {
//             console.log(err);
//             res.redirect("signup");
//         } else {
//             passport.authenticate("local")(req, res, function () {
//                 res.redirect("/secretsworkspace");
//             });
//         }
//     });

// });

app.post("/secrets", function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secretsworkspace");
            });
        }
    });

});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server started on port 3000");
});