// src/App.js
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 리로드 방지

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      console.log("response.data 정보: ", response.data);
      setToken(response.data.accessToken);
      alert("Login successful! Token received.");
    } catch (error) {
      alert("Login failed!");
    }
  };

  return (
    <div className="App">
      <h1>Login</h1>
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
          <h2>Your Token:</h2>
          <div>{token}</div>
        </div>
      )}
    </div>
  );
}

export default App;
