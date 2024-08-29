const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const port = 5000;

// JWT를 생성 하는 데 필요한 서버가 갖고 있는 비밀키로, 실제 어플리케이션에서는 환경변수로 설정
const accessTokenSecret = "access_token_secret";
const refreshTokenSecret = "refresh_token_secret";
let refreshTokens = []; // 발급된 리프레시 토큰 저장소

app.use(bodyParser.json()); // 요청받는 형식이 JSON 일 때 자동 파싱해 req.body로 접근하게 해줌
app.use(cookieParser());
app.use(cors()); // 테스트를 위해 모든 출처에서 요청 허용

// 사용자 정보 데이터베이스
const dbFilePath = path.join(__dirname, "db.json");
const db = JSON.parse(fs.readFileSync(dbFilePath, "utf-8")); // JSON 데이터를 JavaScript 객체로 변환

// 로그인 엔드포인트
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.login.find(
    (user) => user.email === email && user.password === password
  );

  // 액세스 토큰과 리프레시 토큰 생성
  if (user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      accessTokenSecret,
      { expiresIn: "1m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      refreshTokenSecret,
      { expiresIn: "7d" }
    );

    refreshTokens.push(refreshToken); // 리프레시 토큰을 서버에 저장

    // 액세스 토큰은 응답 바디에 담아 전송
    res.json({ accessToken });

    // 리프레시 토큰은 쿠키에 저장
    res.cookie("refreshToken", refreshToken, {
      httpOnly: false,
      secure: false,
      domain: "localhost", // 필요에 따라 설정
    });

    // HttpOnly 쿠키로 리프레시 토큰 전송
    // res.cookie("리프레시 토큰", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    // });
  } else {
    res.status(401).json({ message: "사용자 정보가 잘못되었습니다." });
  }
});

// 보호된 라우트
app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // 인증 실패
  }

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403); // 토큰 검증 실패
    }

    res.json({ message: "이 데이터는 보호된 데이터입니다.", user });
  });
});

// 새로운 액세스 토큰 발급 엔드포인트
app.post("/token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res
      .status(403)
      .json({ message: "리프레시 토큰이 유효하지 않습니다." });
  }

  jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "리프레시 토큰 검증에 실패했습니다." });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      accessTokenSecret,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
});

// 로그아웃 엔드포인트
app.post("/logout", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.clearCookie("refreshToken");
  res.json({ message: "로그아웃되었습니다." });
});

// 서버 실행
app.listen(port, () => {
  console.log(`http://localhost:${port}에서 서버가 실행되고 있습니다.`);
});
