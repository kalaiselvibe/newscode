const express = require('express');
const mysql = require('mysql2/promise');
const multer = require("multer");
const app = express();
const port = 3306;
const cors = require("cors");
const conn = require("./db");
const axios = require('axios');
app.use(cors());

app.use(express.json());
const path = require("path");


app.use('/images', express.static(path.join(__dirname, 'public/images')));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "./public/images")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})
 
const upload = multer({storage})
app.post('/news',upload.single('file'), (req, res) => {
  const sql = "INSERT INTO product (`title`,`catagory`,`body`,`image`) VALUES (?)"; 
  const values = [
  
      req.body.title,
      req.body.catagory,
      req.body.body, 
      req.file.filename
    
  ]
  conn.query(sql, [values], (err, result) => {
      if(err) return res.json({Error: "Error singup query"});
      return res.json({Status: "Success"});
  })
})

// GET request to fetch all news articles
app.get('/news', (req, res) => {
  const sql = 'SELECT * FROM product';

  conn.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Error fetching employees" });

    // Construct image URLs based on your server setup
    const newsWithImageURLs = result.map(news => ({
      ...news,
      image: `https://newsapp-za0p.onrender.com/images/${news.image}`
    }));

    return res.json(newsWithImageURLs);
  });
});
app.put('/news/:id', upload.single('file'), (req, res) => {
  const newsId = req.params.id;
  const { title, catagory, body } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = "UPDATE product SET title=?, catagory=?, body=?, image=? WHERE id=?";
  const values = [title, catagory, body, image, newsId];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating news article:', err);
      return res.status(500).json({ Status: 'Error', message: 'Internal Server Error' });
    }

    // Fetch the updated news article with the new image URL
    const fetchUpdatedNewsSql = "SELECT * FROM product WHERE id=?";
    conn.query(fetchUpdatedNewsSql, [newsId], (fetchErr, fetchResult) => {
      if (fetchErr) {
        console.error('Error fetching updated news article:', fetchErr);
        return res.status(500).json({ Status: 'Error', message: 'Internal Server Error' });
      }

      const updatedNews = fetchResult[0];
      return res.json({
        Status: 'Success',
        message: 'News Get successfully',
        updatedNews: {
          id: updatedNews.id,
          title: updatedNews.title,
          catagory: updatedNews.catagory,
          body: updatedNews.body,
          image: `https://newsapp-za0p.onrender.com/images/${updatedNews.image}`, // Adjust the URL based on your server setup
        },
      });
    });
  });
});
app.delete('/news/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM product WHERE `id`=?";
  
  conn.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    return res.json({ status: "Success", message: "News article deleted successfully" });
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

