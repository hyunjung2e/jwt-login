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
let refreshTokenList = []; // 발급된 리프레시 토큰 저장소 -> 실제 서버에서는 서버 메모리(변수)에 저장

app.use(cookieParser()); // 쿠키 파싱 미들웨어
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // 클라이언트 도메인 허용, 쿠키 허용

// 사용자 정보 데이터베이스
const dbFilePath = path.join(__dirname, "db.json");
const db = JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));

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

    refreshTokenList.push(refreshToken); // 리프레시 토큰을 서버에 저장

    // 리프레시 토큰은 쿠키에 담아 전송
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    // 액세스 토큰은 응답 바디에 담아 전송
    res.json({ accessToken });
  } else {
    res.status(401).json({ message: "사용자 정보가 잘못되었습니다." });
  }
});

// 토큰 검증 엔드포인트
app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // 공백 기준으로 토큰만 발라내기

  if (!token) {
    return res.sendStatus(401); // 인증 실패
  }

  // 토큰 있지만 기한 만료된 경우
  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403); // 토큰 검증 실패
    }

    res.json({
      message: "이 데이터는 토큰 검증을 통과해야 조회 가능한 데이터 입니다.",
      user,
    });
  });
});

// 새로운 액세스 토큰 발급 엔드포인트
app.post("/token", (req, res) => {
  const refreshToken = req.cookies.refreshToken; // HttpOnly 쿠키에서 리프레시 토큰 가져오기

  if (!refreshToken) {
    return res.status(403).json({ message: "리프레시 토큰이 없습니다." });
  }

  if (!refreshTokenList.includes(refreshToken)) {
    return res
      .status(403)
      .json({ message: "리프레시 토큰이 유효하지 않습니다." });
  }

  // 새로운 액세스 토큰 발급
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
  refreshTokenList = refreshTokenList.filter((token) => token !== refreshToken); // 일치하는 토큰은 배열에서 제거

  res.clearCookie("refreshToken");
  res.json({ message: "로그아웃되었습니다." });
});

// 서버 실행
app.listen(port, () => {
  console.log(`http://localhost:${port}에서 서버가 실행되고 있습니다.`);
});
