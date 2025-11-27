import { useState } from "react";
import API from "../services/api";

const Login = ({ setToken }) => {
  const [auth, setAuth] = useState({ username: "", password: "" });

  const loginUser = async () => {
    if (!auth.username || !auth.password) return alert("Enter login details");
    try {
      const res = await API.post("/login", auth);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={auth.username}
        onChange={(e) => setAuth({ ...auth, username: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        value={auth.password}
        onChange={(e) => setAuth({ ...auth, password: e.target.value })}
      />
      <button onClick={loginUser}>Login</button>
    </div>
  );
};

export default Login;
