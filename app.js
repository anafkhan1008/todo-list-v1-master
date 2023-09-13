const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()
const PORT = process.env.PORT || 3000
const _ = require("lodash")

const app = express();

mongoose.connect('mongodb+srv://Admin:admin-123@cluster0.tlr2qhb.mongodb.net/TodoListDB')
  .then()
{
  console.log("connected to DB")
}


const itemsSchema = mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema);
const newItem1 = new Item({
  name: "do some work"
})
const newItem2 = new Item({
  name: "second task"
})

const newItem3 = new Item({
  name: "this is the third task"
})

const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

const defaultItems = [newItem1, newItem2, newItem3]


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length == 0) {
        Item.insertMany(defaultItems);
        res.redirect("/")
      }
      console.log(foundItems)
      res.render("list", {
        listTitle: "Today",
        listItems: foundItems
      });
    })
});

app.get("/:customListName", async function (req, res) {
  const newListname = _.capitalize(req.params.customListName);
  await List.findOne({ name: newListname })
    .then(function (findItem) {
      if (!findItem) {
        const list = new List({
          name: newListname,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + newListname)
      }
      else {

        res.render("list", {
          listTitle: findItem.name,
          listItems: findItem.items
        })
      }
    })





})



app.post("/", function (req, res) {
  const itemName = req.body.newTodo;
  const listName = req.body.listName;
  const newItem = new Item({
    name: itemName
  })

  if (listName === "Today") {
    newItem.save()
    res.redirect("/")
  }
  else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.items.push(newItem)
        foundList.save()
        res.redirect("/" + listName)
      })
  }

});

app.post("/delete", async (req, res) => {
  const itemid = req.body.item_id;
  const listName = req.body.listName;
  if (listName === "Today") {
    await Item.deleteOne({ _id: itemid })
    res.redirect("/")
  }
  else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemid } } }
    )
      .then(function (foundlist) {
        res.redirect("/" + listName)
      })
  }

})

app.listen(PORT, function () {
  console.log("Server running on port 3000.");
});