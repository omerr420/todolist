import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Bütün sahələri doldur');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = users.find(u => u.email === email);
    if (exists) {
      setError('Bu email artıq qeydiyyatdan keçib');
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    navigate('/todos');
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Qeydiyyat</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Ad"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifrə"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Qeydiyyatdan keç</button>
        <p>
          Artıq hesabın var? <Link to="/login">Daxil ol</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;