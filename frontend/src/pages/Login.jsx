import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.auth.login({ email, contraseña: password });
      if (data.token) {
        login({ id: data.id, email: data.email, rol: data.rol }, data.token);
        navigate('/dashboard');
      } else {
        setError(data.msg || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Entrar</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p onClick={() => navigate('/register')} style={styles.link}>¿No tienes cuenta? Regístrate</p>
    </div>
  );
};

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', fontSize: '16px' },
  button: { padding: '10px', fontSize: '16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' },
  error: { color: 'red' },
  link: { color: '#007bff', cursor: 'pointer', marginTop: '10px' }
};

export default Login;
