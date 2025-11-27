import { useState } from "react";
import API from "../services/api";

const Signup = ({ setToken }) => {
  const [auth, setAuth] = useState({ username: "", password: "" });

  const signupUser = async () => {
    if (!auth.username || !auth.password) return alert("Enter signup details");
    try {
      await API.post("/signup", auth);
      const res = await API.post("/login", auth);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch {
      alert("Signup failed. Username may exist.");
    }
  };

  return (
    <div className="container">
      <h2>Signup</h2>
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
      <button onClick={signupUser}>Signup</button>
    </div>
  );
};

export default Signup;
