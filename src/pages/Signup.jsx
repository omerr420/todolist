import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:3001'; // Elvinin verdiyi əsl port ilə əvəz et

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Bütün sahələri doldur');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Qeydiyyat uğursuz oldu');
        return;
      }

      navigate('/login');
    } catch {
      setError('Serverə qoşulmaq mümkün olmadı');
    } finally {
      setLoading(false);
    }
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
        <button type="submit" disabled={loading}>
          {loading ? 'Göndərilir...' : 'Qeydiyyatdan keç'}
        </button>
        <p>
          Artıq hesabın var? <Link to="/login">Daxil ol</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;