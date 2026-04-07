import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const Register = () => {
  const [form, setForm] = useState({ nombre: '', dni: '', email: '', password: '', movil: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.auth.register({ ...form, contrasena: form.password });
      if (data.usuario) {
        navigate('/');
      } else {
        setError(data.msg || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="nombre" placeholder="Nombre" onChange={handleChange} style={styles.input} required />
        <input name="dni" placeholder="DNI" onChange={handleChange} style={styles.input} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} style={styles.input} required />
        <input name="movil" placeholder="Móvil" onChange={handleChange} style={styles.input} required />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} style={styles.input} required />
        <button type="submit" style={styles.button}>Registrarse</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p onClick={() => navigate('/')} style={styles.link}>¿Ya tienes cuenta? Inicia sesión</p>
    </div>
  );
};

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', fontSize: '16px' },
  button: { padding: '10px', fontSize: '16px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' },
  error: { color: 'red' },
  link: { color: '#007bff', cursor: 'pointer', marginTop: '10px' }
};

export default Register;
