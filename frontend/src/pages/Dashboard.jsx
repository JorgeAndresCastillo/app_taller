import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('coches');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const tabs = ['coches', 'citas', 'trabajos', 'historial', 'anomalias'];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchers = {
        coches: api.coches.list,
        citas: api.citas.list,
        trabajos: api.trabajos.list,
        historial: api.historial.list,
        anomalias: api.anomalias.list
      };
      const result = await fetchers[activeTab]();
      setData(prev => ({ ...prev, [activeTab]: result }));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Taller App</h1>
        <button onClick={logout} style={styles.logoutBtn}>Cerrar Sesión</button>
      </header>

      <nav style={styles.nav}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
        {loading ? <p>Cargando...</p> : (
          Array.isArray(data[activeTab]) && data[activeTab].length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  {Object.keys(data[activeTab][0]).map(key => (
                    <th key={key} style={styles.th}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data[activeTab].map((item, i) => (
                  <tr key={i}>
                    {Object.values(item).map((val, j) => (
                      <td key={j} style={styles.td}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No hay datos</p>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#333', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' },
  nav: { background: '#444', padding: '10px', display: 'flex', gap: '10px' },
  tab: { padding: '10px 20px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', textTransform: 'capitalize' },
  activeTab: { background: '#007bff' },
  main: { padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white' },
  th: { background: '#333', color: 'white', padding: '10px', textAlign: 'left' },
  td: { padding: '10px', borderBottom: '1px solid #ddd' }
};

export default Dashboard;
