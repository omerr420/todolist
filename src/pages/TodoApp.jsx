import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001'; // Elvinin verdiyi əsl port ilə əvəz et

function getDeadlineStatus(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const due = new Date(deadline);
  const diffHours = (due - now) / (1000 * 60 * 60);

  if (diffHours < 0) return 'overdue';
  if (diffHours <= 24) return 'due-soon';
  return 'on-time';
}

const statusIcon = {
  overdue: '🔴',
  'due-soon': '🟡',
  'on-time': '🟢',
};

function TodoApp() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [toast, setToast] = useState(null); 
  const [filter, setFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('none'); 

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/todos`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok || !data.success) {
        showToast(data.error?.message || 'Tapşırıqları yükləmək mümkün olmadı');
        return;
      }
      setTodos(data.data);
    } catch {
      showToast('Serverə qoşulmaq mümkün olmadı. Backend işləyirmi?');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (input.trim() === '') return;

    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: input,
          deadline: deadline ? new Date(deadline).toISOString() : null,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error?.message || 'Tapşırıq əlavə edilmədi');
        return;
      }

      setTodos([...todos, data.data]);
      setInput('');
      setDeadline('');
      showToast('Tapşırıq əlavə olundu', 'success');
    } catch {
      showToast('Serverə qoşulmaq mümkün olmadı');
    }
  };

  const toggleTodo = async (id, current) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isCompleted: !current }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error?.message || 'Tapşırıq yenilənmədi');
        return;
      }
      setTodos(todos.map(t => (t.id === id ? data.data : t)));
    } catch {
      showToast('Serverə qoşulmaq mümkün olmadı');
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDeadline(todo.deadline ? todo.deadline.slice(0, 16) : '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDeadline('');
  };

  const saveEdit = async (id) => {
    if (editTitle.trim() === '') return;

    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          title: editTitle,
          deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error?.message || 'Tapşırıq yenilənmədi');
        return;
      }

      setTodos(todos.map(t => (t.id === id ? data.data : t)));
      showToast('Tapşırıq yeniləndi', 'success');
      cancelEditing();
    } catch {
      showToast('Serverə qoşulmaq mümkün olmadı');
    }
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') cancelEditing();
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error?.message || 'Tapşırıq silinmədi');
        return;
      }
      setTodos(todos.filter(t => t.id !== id));
      showToast('Tapşırıq silindi', 'success');
    } catch {
      showToast('Serverə qoşulmaq mümkün olmadı');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let visibleTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.isCompleted;
    if (filter === 'completed') return todo.isCompleted;
    if (filter === 'overdue') return getDeadlineStatus(todo.deadline) === 'overdue';
    return true;
  });

  if (sortBy === 'deadline') {
    visibleTodos = [...visibleTodos].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }

  const activeCount = todos.filter(todo => !todo.isCompleted).length;

  if (!token) return null;

  return (
    <div className="app">
      <div className="header">
        <h1>Todo List</h1>
        <div className="user-info">
          <span>Salam, {currentUser?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>Çıxış</button>
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Yeni tapşırıq əlavə et..."
        />
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="deadline-input"
        />
        <button onClick={addTodo}>Əlavə et</button>
      </div>

      <div className="filters">
        {['all', 'active', 'completed', 'overdue'].map(f => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Hamısı' : f === 'active' ? 'Aktiv' : f === 'completed' ? 'Tamamlanmış' : 'Gecikmiş'}
          </button>
        ))}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="none">Sıralama yoxdur</option>
          <option value="deadline">Deadline-a görə sırala</option>
        </select>
      </div>

      {loading ? (
        <p className="empty">Yüklənir...</p>
      ) : (
        <>
          <ul className="todo-list">
            {visibleTodos.map(todo => {
              const status = getDeadlineStatus(todo.deadline);
              return (
                <li key={todo.id} className={todo.isCompleted ? 'completed' : ''}>
                  {editingId === todo.id ? (
                    <div className="edit-row">
                      <input
                        type="text"
                        className="edit-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                        autoFocus
                      />
                      <input
                        type="datetime-local"
                        className="deadline-input"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                      />
                    </div>
                  ) : (
                    <span onClick={() => toggleTodo(todo.id, todo.isCompleted)}>
                      {status && <span className="status-icon">{statusIcon[status]}</span>}
                      {todo.title}
                      {todo.deadline && (
                        <span className="deadline-label">
                          {new Date(todo.deadline).toLocaleString('az-AZ')}
                        </span>
                      )}
                    </span>
                  )}

                  <div className="actions">
                    {editingId === todo.id ? (
                      <>
                        <button className="edit-btn" onClick={() => saveEdit(todo.id)}>
                          Saxla
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>
                          Ləğv et
                        </button>
                      </>
                    ) : (
                      <button className="edit-btn" onClick={() => startEditing(todo)}>
                        Düzəlt
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                      Sil
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {visibleTodos.length === 0 && <p className="empty">Tapşırıq tapılmadı</p>}

          {todos.length > 0 && (
            <p className="count">{activeCount} tapşırıq qalıb</p>
          )}
        </>
      )}
    </div>
  );
}

export default TodoApp;