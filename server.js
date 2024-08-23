// server.js
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;
const secretKey = "your_secret_key"; // 비밀 키를 환경 변수로 설정하는 것이 좋습니다.

app.use(cors());
app.use(bodyParser.json());

// JSON Server와 동일한 db.json 파일 사용
const dbFilePath = path.join(__dirname, "db.json");
const db = JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));

// 로그인 엔드포인트
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.login.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ accessToken: token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
