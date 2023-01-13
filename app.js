//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolist");

let itemsSchema = mongoose.Schema({
  name: String,
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Start your android projects"
});
const item2 = new Item({
  name: "Do coding regularly"
});
const item3 = new Item({
  name: "Development is important too"
});

const defaultItems = [item1, item2, item3];

let listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find(function (err, itemsResult) {
    if (itemsResult.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log("ERROR!!!!!!!!!!!!!!!!!!!!!!!!");
          console.log(err);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: itemsResult });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customListName", (req, res) => {
  let customListName = req.params.customListName;

  List.findOne({ name: customListName }, (err, result) => {
    if (!err) {
      console.log(result);
      if (result) {
        res.render("list", {listTitle: result.name,newListItems: result.items,});
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      }
    }
  });
});
app.get("/favicon.ico", (req, res) => {
  console.log("Request received");
  res.redirect("/");
});
app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  let listTitle = req.body.list;

  console.log(listTitle);

  let item = new Item({
    name: itemName,
  });

  if (listTitle === "Today") {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listTitle},(err,result)=>{
      result.items.push(item);
      result.save();

      res.redirect("/"+listTitle);
    });
  }
});
app.post("/delete", (req, res) => {

  let listName = req.body.listName;
  let checkedItemId = req.body.checkbox;
  console.log(listName,checkedItemId);
  console.log(listName === "Today");
  console.log(req.body);
  if(listName === "Today"){
    console.log("I am");
    Item.findByIdAndRemove(checkedItemId, function (err) {
      console.log("I am here");
      if (err) console.log("ERROR!!!!");
  
      res.redirect("/");
    });
  }else{
    console.log("I am else");
    List.findOneAndUpdate({name: listName},{$pull: {items: { _id: checkedItemId}}}, (err,foundList)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
