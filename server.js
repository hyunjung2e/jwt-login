const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 5000;
const secretKey = "secret_key"; // 실제 어플리케이션에서는 환경변수로 설정

app.use(cors()); // 테스트를 위해 모든 출처에서 요청 허용
app.use(bodyParser.json()); // 요청받는 형식이 JSON 일 때 자동 파싱해 req.body로 접근하게 해줌

// 사용자 정보 데이터베이스
const dbFilePath = path.join(__dirname, "db.json");
const db = JSON.parse(fs.readFileSync(dbFilePath, "utf-8")); // JSON 데이터를 JavaScript 객체로 변환

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
    res.status(401).json({ message: "사용자 정보가 잘못되었습니다." });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
