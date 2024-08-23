import React, { useState } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      console.log("response 정보: ", response);
      console.log("response.data 정보: ", response.data);
      setToken(response.data.accessToken);
      alert("로그인에 성공하였습니다. 토큰을 발급합니다.");
    } catch (error) {
      alert("로그인에 실패하였습니다.");
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

      {token && (
        <div>
          <h2>토큰:</h2>
          <div>{token}</div>
        </div>
      )}
    </div>
  );
}

export default App;
