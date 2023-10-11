//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Thuan:Test123@cluster0.nyhlvru.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp/todolistDB");

const itemsSchema = new mongoose.Schema ({
  name: String
})

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
})

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your to do list!"
})

const item2 = new Item({
  name: "Hit the + button to aff a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItem = [item1, item2, item3];

async function insertManyItem(){
  try {
    await Item.insertMany(defaultItem);
    console.log("Insert many items successfully");
  } catch (err) {
    console.log(err);
  }
}

//insertManyItem();

async function findItem(){
  try {
    const foundItems = await Item.find({});
    console.log("Find item successfully, result as below: ");
    foundItems.forEach(item => {
      console.log(item.name);
    });
    //console.log(foundItems);
  } catch (err) {
    console.log(err);
  }
}

//findItem();

app.get("/", async function(req, res) {
  try {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      insertManyItem();
      res.redirect("/");
    } else { //phai dung if_else vi chua insert kip no da render roi
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      console.log("Find item successfully from app.get, result as below: ");
      foundItems.forEach(item => {
        console.log(item.name);
      });
      console.log("-----------");
    }  
  } catch (err) {
    console.log(err);
  }
});


// Cài Trusty Lodash để luôn viết hoa chữ đầu và viết thường chữ còn lại 
// => npm i lodash
app.get("/:customListName", async (req, res) => {
  try {
    const customListName = _.capitalize(req.params.customListName);
    console.log("Custom list name: " + customListName);
    // Tim document co ten bang voi customListName
    const foundList = await List.findOne({name: customListName});
    if (foundList) {
      console.log("Exist");
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
    } else {
      const list = new List({
        name: customListName,
        items: defaultItem
        });
        list.save();
        console.log("List name doesn't exist, so create new document");
        res.redirect(`/${customListName}`);
    }
    } catch (err) {
      console.log(err);
    }
    // // We can use list.save() to save the document
    // list.save();
});

app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today"){
    // Mongoose shortcut to insert ONE document into a collection
    newItem.save();
    res.redirect("/");
  } else {
    try {
      const foundList = await List.findOne({name: listName});
      // We can update just by save() method.
      console.log("Update from list item: " + foundList.name);
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    } catch (err) {
      console.log(err);
    }    
  }
});

app.post("/delete", async (req, res) => {
  const checkID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    try {
      const deleteItem = await Item.findByIdAndRemove(checkID);
      console.log(`Remove item successfully`);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkID}}});
      res.redirect("/" + listName);
    } catch (err) {
      console.log(err);
    }
  }
  
})


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
