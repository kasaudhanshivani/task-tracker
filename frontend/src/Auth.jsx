import { useState } from "react";
import axios from "axios";

export default function Auth({ setAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await axios.post("http://127.0.0.1:5000/login", { username, password });
    localStorage.setItem("token", res.data.token);
    setAuth(true);
  };

  const register = async () => {
    await axios.post("http://127.0.0.1:5000/register", { username, password });
    alert("User Registered");
  };

  return (
    <div>
      <h2>Authentication</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)}/>
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

      <button onClick={login}>Login</button>
      <button onClick={register}>Register</button>
    </div>
  );
}
