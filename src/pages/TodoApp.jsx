import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TodoApp() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem(`todos_${currentUser?.email}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`todos_${currentUser.email}`, JSON.stringify(todos));
    }
  }, [todos, currentUser]);

  const addTodo = () => {
    if (input.trim() === '') return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    if (editText.trim() === '') return;
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const activeCount = todos.filter(todo => !todo.completed).length;

  if (!currentUser) return null;

  return (
    <div className="app">
      <div className="header">
        <h1>Todo List</h1>
        <div className="user-info">
          <span>Salam, {currentUser.name}</span>
          <button className="logout-btn" onClick={handleLogout}>Çıxış</button>
        </div>
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Yeni tapşırıq əlavə et..."
        />
        <button onClick={addTodo}>Əlavə et</button>
      </div>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            {editingId === todo.id ? (
              <input
                type="text"
                className="edit-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                onBlur={() => saveEdit(todo.id)}
                autoFocus
              />
            ) : (
              <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            )}

            <div className="actions">
              {editingId !== todo.id && (
                <button className="edit-btn" onClick={() => startEditing(todo)}>
                  Düzəlt
                </button>
              )}
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p className="empty">Hələ tapşırıq yoxdur</p>}

      {todos.length > 0 && (
        <p className="count">{activeCount} tapşırıq qalıb</p>
      )}
    </div>
  );
}

export default TodoApp;