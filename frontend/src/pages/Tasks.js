import { useState, useEffect } from "react";
import API from "../services/api";

const Tasks = ({ logout }) => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", due_date: "", priority: "Low", status: "Pending" });
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch {
      alert("Session expired. Please login again.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const saveTask = async () => {
    if (!form.title.trim()) return alert("Title is required!");
    try {
      if (editingId) await API.put(`/tasks/${editingId}`, form);
      else await API.post("/tasks", form);

      setForm({ title: "", description: "", due_date: "", priority: "Low", status: "Pending" });
      setEditingId(null);
      fetchTasks();
    } catch {
      alert("Error saving task");
    }
  };

  const editTask = (task) => { setEditingId(task.id); setForm({ ...task }); };
  const removeTask = async (id) => { if (!window.confirm("Delete this task?")) return; await API.delete(`/tasks/${id}`); fetchTasks(); };
  const toggleStatus = async (task) => { await API.put(`/tasks/${task.id}`, { ...task, status: task.status==="Pending"?"Completed":"Pending" }); fetchTasks(); };
  const clearCompleted = async () => { if (!window.confirm("Delete all completed tasks?")) return; await Promise.all(tasks.filter(t => t.status==="Completed").map(t=>API.delete(`/tasks/${t.id}`))); fetchTasks(); };

  const filteredTasks = tasks.filter(t => filterStatus==="All" || t.status===filterStatus);

  return (
    <div className="container">
      <h2>Task Tracker</h2>
      <button onClick={logout}>Logout</button>

      <input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
      <input placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
      <input type="date" value={form.due_date} onChange={(e)=>setForm({...form,due_date:e.target.value})}/>
      <select value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}>
        <option>Low</option><option>Medium</option><option>High</option>
      </select>
      <button onClick={saveTask}>{editingId?"Update Task":"Add Task"}</button>

      <div className="filter">
        <b>Status: </b>
        <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
          <option>All</option><option>Pending</option><option>Completed</option>
        </select>
      </div>

      <button onClick={clearCompleted} style={{marginTop:"8px"}}>Clear Completed</button>

      {loading && <p>Loading...</p>}
      {!loading && filteredTasks.length===0 && <p>No tasks.</p>}

      {filteredTasks.map(t=>(
        <div key={t.id} className="task-item">
          <div>
            <span className={t.status==="Completed"?"completed":""}>
              <b>{t.title}</b> — {t.description} — {t.due_date}
            </span>
            <span className={`priority-${t.priority}`}>{t.priority}</span>
          </div>
          <div>
            <button onClick={()=>toggleStatus(t)}>Toggle</button>
            <button onClick={()=>editTask(t)}>Edit</button>
            <button onClick={()=>removeTask(t.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tasks;
