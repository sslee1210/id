// 환경 변수
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const sha = require("sha256");

// controllers
const sessionController = require("./controllers/sessionController");
const postControllers = require("./controllers/postControllers");

app.use(
  session({
    secret: process.env.SESSION_NO,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const URL = process.env.MONGODB_URL;

let mydb;
mongoose
  .connect(URL, { dbName: "db1" })
  .then(() => {
    console.log("MongoDB에 연결");
    mydb = mongoose.connection.db;
  })
  .catch((err) => {
    console.log("MongoDB 연결 실패: ", err);
  });

// build
app.use(express.static(path.join(__dirname, "build")));

// 회원가입
app.post("/signup", async (req, res) => {
  console.log(req.body.userId);
  console.log(req.body.userPw);
  console.log(req.body.userGroup);
  console.log(req.body.userEmail);

  try {
    await mydb.collection("account").insertOne({
      userId: req.body.userId,
      userPw: sha(req.body.userPw),
      userGroup: req.body.userGroup,
      userEmail: req.body.userEmail,
    });

    console.log("회원가입 성공");
    res.json({ message: "회원가입 성공" });
  } catch (err) {
    console.log("회원가입 에러: ", err);
    res.status(500).send({ error: err });
  }
});

// 로그인
app.get("/login", sessionController.checkUserSession);
app.get("/", sessionController.checkUserSession);

app.post("/login", async (req, res) => {
  sessionController.loginUser(req, res, mydb);
});

// 로그아웃
app.get("/logout", sessionController.logoutUser);

// 게시판
// posts
app.get("/posts", postControllers.getPosts);
app.get("/posts/total", postControllers.getPostTotal);

// 게시글 작성
app.post("/posts/write", postControllers.getPostWrite);

// 게시글 읽기
app.get("/posts/read/:id", postControllers.getPostRead);

// 게시글 삭제
app.post("/posts/delete/:id", postControllers.getPostDelete);

// 게시글 수정
app.post("/posts/update", postControllers.getPostUpdate);

app.listen(PORT, () => {
  console.log("8080번 포트에서 실행 중");
});
