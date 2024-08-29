import React, { useState } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  // 리프레시 토큰이 클라이언트 쿠키에 저장됐는 지 확인을 위한 임시 콘솔 처리
  const allCookies = document.cookie;
  console.log("All Cookies:", allCookies);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // 예를 들어 "refreshToken"이라는 이름의 쿠키를 읽어옵니다.
  const refreshToken = getCookie("refreshToken");
  console.log("Refresh Token:", refreshToken);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      console.log("응답:", response);
      setAccessToken(response.data.accessToken);
      alert("로그인에 성공하였습니다. 액세스 토큰을 발급받았습니다.");
    } catch (error) {
      alert("로그인에 실패하였습니다.");
    }
  };

  // 보호된 데이터 요청
  const handleRequest = async () => {
    try {
      // API 요청 시 액세스 토큰 사용
      const response = await axios.get("http://localhost:5000/protected", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("보호된 데이터:", response.data);
    } catch (error) {
      if (error.response.status === 401) {
        // 액세스 토큰이 만료된 경우 리프레시 토큰을 사용해 새로운 액세스 토큰 요청
        try {
          const response = await axios.post("http://localhost:5000/token");
          setAccessToken(response.data.accessToken);
          alert("새로운 액세스 토큰을 발급받았습니다.");
        } catch (error) {
          alert("리프레시 토큰을 사용한 액세스 토큰 발급에 실패하였습니다.");
        }
      } else {
        alert("요청에 실패하였습니다.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      setAccessToken(null);
      alert("로그아웃되었습니다.");
    } catch (error) {
      alert("로그아웃에 실패하였습니다.");
    }
  };

  return (
    <div className="App">
      <h1>로그인</h1>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      {accessToken && (
        <div>
          <h2>발급된 액세스 토큰:</h2>
          <div>{accessToken}</div>
          <button onClick={handleRequest}>보호된 데이터 요청</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
