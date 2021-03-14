const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileUpload');
const fs = require("fs-extra");
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rbbqn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('pic'));
// app.use(express.static('pic2'));
app.use(fileUpload());
const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("customerReview");
  const adminCollection = client.db("creativeAgency").collection("admin");
  const adminAddServiceCollection = client.db("creativeAgency").collection("adminAddService");

  app.post('/order', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const img = req.body.img;
    const status = req.body.status;


    file.mv(`${__dirname}/pic/${file.name}`, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "can not upload" });
      }
      orderCollection.insertOne({ file, name, email, title, description, price, img, status })
        .then(result => {
          console.log(result);
          res.send(result.insertedCount > 0)
        })
      // orderCollection.insertOne({ name, email, img: file.name })
      // .then(result => {
      //   res.send(result.insertedCount > 0)
      // })
      // return res.send({ name: file.name, path: `/${file.name}` });
    });
  })

  app.get('/service', (req, res) => {
    adminAddServiceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
        // console.log(documents);
      })
  })

  app.get('/serviceStatus', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
        console.log(documents);
      })
  })


  app.get('/feedback', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
      .then((result) => {
        res.send(result.insertedCount > 0);
      });

  })
  //   app.post('/isAdminData', (req, res) => {
  //     const email = req.body.email;
  //     orderCollection.find({ email: email })
  //         .toArray((err, orders) => {
  //             res.send(orders.length > 0)

  //         })
  // })

  app.post("/admin", (req, res) => {
    const adminData = req.body;
    adminCollection.insertOne(adminData)
      .then((result) => {
        res.send(result.insertedCount);
      });
  });

  app.get("/isAdminData", (req, res) => {
    const email = req.query.email;
    // console.log(email.email);
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        //  console.log(admin)
        if (admin.length === 0) {
          res.send({ admin: false })
        }
        else {
          res.send({ admin: true })
        }
      })
  });

  app.get('/adminServiceList', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    // const img = req.body.img;
    const img = file.data;
    const encImg = img.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };


    // file.mv(`${__dirname}/pic/${file.name}`, (err) => {
      // if (err) {
      //   console.log(err);
      //   return res.status(500).send({ msg: "can not upload" });
      // }
      adminAddServiceCollection.insertOne({ file, title, description, image })
        .then(result => {
          console.log(result);
          res.send(result.insertedCount > 0)
        })
      // orderCollection.insertOne({ name, email, img: file.name })
      // .then(result => {
      //   res.send(result.insertedCount > 0)
      // })
      // return res.send({ name: file.name, path: `/${file.name}` });
    // });
  })

  app.get('/allData', (req, res) => {
    adminAddServiceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
        // console.log(documents);
      })
  })

  


});

app.listen(process.env.PORT || port);