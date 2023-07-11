const express=require("express");
const app=express();
const port=4001;
require("dotenv").config();
const books=require("./book");
const { query } = require('./bookdata');
app.get("/book", async (req, res) => {
    try {
      const allbooks = await query("SELECT * FROM book_application");
  
      res.status(200).json(allbooks.rows);
    } catch (err) {
      console.error(err);
    }
  });
  
  app.get("/book/:id",async(req,res)=>{
    const bookid = parseInt(req.params.id, 10);
    try{
        
        const filterbook=await query("SELECT * FROM book_application WHERE id=$1",[bookid]);
        if (filterbook.rows.length > 0) {
            res.status(200).json(filterbook.rows[0]);
          } else {
            res.status(404).send({ message: "Job not found" });
          }
    }
    catch(err){
        console.log(err);
    }
  })


app.use((req,res,next)=>{
    res.on('finish',()=>{
        console.log(`Request: ${req.method} ${req.originalUrl} ${res.statusCode}`);
})
next();    
})
app.use(express.json())
app.post("/book", async (req, res) => {
    const { title,author,genre,quantit} = req.body;
  
    try {
      const newbook = await query(
        "INSERT INTO book_application ( title,author,genre,quantit) VALUES ($1,$2,$3,$4) RETURNING *",
        [title,author,genre,quantit]
      );
  
      res.status(201).json(newbook.rows[0]);
    } catch (err) {
      console.error(err);
    }
  });
  app.patch("/book/:id",async(req,res)=>{
    const bookId=parseInt(req.params.id,10);
    const filedname=[
        "title",
        "author",
        "genre",
        "quantit",
        "bookId",
    ].filter((name)=>req.body[name]);
    let updatedValues = filedname.map(name => req.body[name]);
    const setValuesSQL = filedname.map((name, i) => {
      return `${name} = $${i + 1}`
    }).join(',');
    try {
        const updatedbook = await query(
          `UPDATE book_application SET ${setValuesSQL} WHERE id = $${filedname.length+1} RETURNING *`,
          [...updatedValues, bookId]
        );
    
        if (updatedbook.rows.length > 0) {
          res.status(200).json(updatedbook.rows[0]);
        } else {
          res.status(404).send({ message: "Job not found" });
        }
      } catch (err) {
        res.status(500).send({ message: err.message });
        console.error(err);
      }
  });
  app.delete("/book/:id",async(req,res)=>{
    const bookId= parseInt(req.params.id,10);

    try {
        const deletebook=await query(`DELETE FROM book_application WHERE id=$1`,[bookId])
        
    if (deletebook.rowCount > 0) {
        res.status(200).send({ message: "Job deleted successfully" });
      } else {
        res.status(404).send({ message: "Job not found" });
      }
    } catch (error) {
        console.error(error)
    }

  })


app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})




