import express from "express";

const app = express();
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("<h1>hello World!</h1>");
})

app.get("/about", (req, res) => {
    res.send("<h1>about Page!</h1>");
})

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});