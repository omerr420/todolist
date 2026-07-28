import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:3001'; // Elvinin verdiyi əsl port ilə əvəz et

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Email və ya şifrə yanlışdır');
        return;
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));

      navigate('/todos');
    } catch  {
      setError('Serverə qoşulmaq mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Daxil ol</h2>
        {error && <p className="error">{error}</p>}
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
          {loading ? 'Göndərilir...' : 'Daxil ol'}
        </button>
        <p>
          Hesabın yoxdur? <Link to="/signup">Qeydiyyatdan keç</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;