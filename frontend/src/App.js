// src/App.js
import { useState, useEffect } from "react";
import "./App.css";
import API from "./services/api";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "Low",
    status: "Pending",
  });
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // --------------------- AUTH ---------------------
  const handleLogin = async () => {
    if (!auth.username || !auth.password) return alert("Enter login details");
    try {
      const res = await API.post("/login", auth);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setAuth({ username: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid credentials!");
    }
  };

  const handleSignup = async () => {
    if (!auth.username || !auth.password) return alert("Enter signup details");
    try {
      await API.post("/signup", auth);
      await handleLogin(); // login immediately after signup
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed. Username may exist.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
    setEditingId(null);
  };

  // --------------------- FETCH TASKS ---------------------
  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Session expired. Please login again.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // --------------------- TASK CRUD ---------------------
  const saveTask = async () => {
    if (!form.title.trim()) return alert("Title is required!");
    try {
      if (editingId) await API.put(`/tasks/${editingId}`, form);
      else await API.post("/tasks", form);

      setForm({ title: "", description: "", due_date: "", priority: "Low", status: "Pending" });
      setEditingId(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.msg || "Error saving task");
    }
  };

  const editTask = (task) => {
    setEditingId(task.id);
    setForm({ ...task });
  };

  const removeTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.msg || "Error deleting task");
    }
  };

  const toggleStatus = async (task) => {
    try {
      await API.put(`/tasks/${task.id}`, {
        ...task,
        status: task.status === "Pending" ? "Completed" : "Pending",
      });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.msg || "Error updating status");
    }
  };

  const clearCompleted = async () => {
    if (!window.confirm("Delete all completed tasks?")) return;
    try {
      const completed = tasks.filter((t) => t.status === "Completed");
      await Promise.all(
        completed.map(async (t) => {
          try {
            await API.delete(`/tasks/${t.id}`);
          } catch {}
        })
      );
      fetchTasks();
    } catch {
      alert("Error clearing completed tasks");
    }
  };

  const filteredTasks = tasks.filter((t) => filterStatus === "All" || t.status === filterStatus);

  // --------------------- UI ---------------------
  if (!token) {
    return (
      <div className="container">
        <h2>{isLogin ? "Login" : "Signup"}</h2>
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
        <button onClick={isLogin ? handleLogin : handleSignup}>{isLogin ? "Login" : "Signup"}</button>
        <p style={{ cursor: "pointer", color: "blue" }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New user? Signup" : "Already have an account? Login"}
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Task Tracker</h2>
      <button onClick={logout}>Logout</button>

      <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
      <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <button onClick={saveTask}>{editingId ? "Update Task" : "Add Task"}</button>

      <div className="filter">
        <b>Status: </b>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </div>

      <button onClick={clearCompleted} style={{ marginTop: "8px" }}>
        Clear Completed
      </button>

      {loading && <p>Loading...</p>}
      {!loading && filteredTasks.length === 0 && <p>No tasks.</p>}

      {filteredTasks.map((t) => (
        <div key={t.id} className="task-item">
          <div>
            <span className={t.status === "Completed" ? "completed" : ""}>
              <b>{t.title}</b> — {t.description} — {t.due_date}
            </span>
            <span className={`priority-${t.priority}`}>{t.priority}</span>
          </div>
          <div>
            <button onClick={() => toggleStatus(t)}>Toggle</button>
            <button onClick={() => editTask(t)}>Edit</button>
            <button onClick={() => removeTask(t.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
