import React, { useState } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  // 로그인 요청
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/login", // 1. 엔드포인트
        // 2. 데이터 객체
        {
          email,
          password,
        },
        // 3. 옵션 객체
        {
          withCredentials: true,
        }
      );
      setAccessToken(response.data.accessToken);
      alert("로그인에 성공하였습니다. 액세스 토큰을 발급받았습니다.");
    } catch (error) {
      alert("로그인에 실패하였습니다.");
    }
  };

  // API 요청 시 액세스 토큰을 사용
  const handleRequest = async () => {
    try {
      await axios.get("http://localhost:5000/protected", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
      window.alert("토큰 검증에 성공하였습니다.");
    } catch (error) {
      // 서버가 응답을 보낸 경우
      if (error.response) {
        // 액세스 토큰이 만료된 경우
        if (error.response.status === 403) {
          window.alert(
            "액세스 토큰이 만료되었습니다. 새로운 토큰을 발급받습니다."
          );
          try {
            const response = await axios.post(
              "http://localhost:5000/token",
              null,
              {
                withCredentials: true,
              }
            );
            setAccessToken(response.data.accessToken); // 새 엑세스 토큰 저장
            alert("새로운 액세스 토큰을 발급받았습니다.");
          } catch (error) {
            alert("리프레시 토큰을 사용한 액세스 토큰 발급에 실패하였습니다.");
          }
        } else {
          alert("요청에 실패하였습니다.");
        }
      } else {
        // 서버가 응답하지 않았거나 네트워크 오류 발생
        alert("요청 중 오류가 발생했습니다. 네트워크 상태를 확인하세요.");
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
          <button onClick={handleRequest}>토큰이 필요한 API 요청</button>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      )}
    </div>
  );
}

export default App;
