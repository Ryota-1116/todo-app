"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

export default function Home() {
  const { data: session } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");

  useEffect(() => {
    if(session) fetchTodos();
  }, [session]);

  async function fetchTodos() {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
  }

  async function addTodo() {
    if (!input.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: input}),
    });
    setInput("");
    fetchTodos();
  }

  async function deleteTodo(id: string) {
  await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });
  fetchTodos();
}

async function toggleTodo(id: string, done: boolean) {
  await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ done: !done }),
  });
  fetchTodos();
}

async function updateTodo(id: string) {
  if (!editInput.trim()) return;
  await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title: editInput }),
  });
  setEditingId(null);
  fetchTodos();
}

if (!session) {
  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>My Todos</h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "32px" }}>ログインして始めましょう</p>
        <button
          onClick={() => signIn("github")}
          style={{ backgroundColor: "white", color: "#0f172a", padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", margin: "0 auto" }}
        >
          GitHubでログイン
        </button>
      </div>
    </div>
  );
}

return (
  <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
    <div style={{ width: "100%", maxWidth: "480px" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>My Todos</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#94a3b8", fontSize: "14px" }}>{session.user?.name}</span>
          <button onClick={() => signOut()} style={{ fontSize: "13px", color: "#94a3b8", border: "1px solid #475569", padding: "4px 12px", borderRadius: "999px", background: "none", cursor: "pointer" }}>
            ログアウト
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="新しいTodoを追加..."
          style={{ flex: 1, backgroundColor: "#1e293b", color: "white", border: "1px solid #334155", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", outline: "none" }}
        />
        <button onClick={addTodo} style={{ backgroundColor: "#3b82f6", color: "white", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", border: "none", cursor: "pointer" }}>
          追加
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#1e293b", padding: "12px 16px", borderRadius: "8px", border: "1px solid #334155" }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id, todo.done)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            {editingId === todo.id ? (
              <>
                <input
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updateTodo(todo.id)}
                  style={{ flex: 1, backgroundColor: "#0f172a", color: "white", border: "1px solid #475569", borderRadius: "6px", padding: "4px 10px", fontSize: "14px", outline: "none" }}
                />
                <button onClick={() => updateTodo(todo.id)} style={{ fontSize: "12px", backgroundColor: "#3b82f6", color: "white", padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer" }}>保存</button>
                <button onClick={() => setEditingId(null)} style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>キャンセル</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: "14px", color: todo.done ? "#475569" : "white", textDecoration: todo.done ? "line-through" : "none" }}>
                  {todo.title}
                </span>
                <button onClick={() => { setEditingId(todo.id); setEditInput(todo.title); }} style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>編集</button>
                <button onClick={() => deleteTodo(todo.id)} style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>削除</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "16px", textAlign: "right" }}>
        {todos.filter(t => !t.done).length} 件残り
      </p>
    </div>
  </div>
);
}