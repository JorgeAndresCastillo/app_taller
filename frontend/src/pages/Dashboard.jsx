import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const isAdmin = user?.rol === 'admin';
  const isMecanico = user?.rol === 'mecanico';

  const tabs = isAdmin 
    ? ['dashboard', 'usuarios', 'coches', 'citas', 'trabajos', 'inventario', 'facturas', 'historial', 'anomalias']
    : isMecanico
    ? ['dashboard', 'usuarios', 'coches', 'citas', 'trabajos', 'inventario', 'historial', 'anomalias']
    : ['dashboard', 'coches', 'citas', 'trabajos', 'historial', 'anomalias'];

  useEffect(() => {
    if (activeTab !== 'dashboard') loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchers = {
        usuarios: api.usuarios.list,
        coches: api.coches.list,
        citas: api.citas.list,
        trabajos: api.trabajos.list,
        inventario: api.inventario.list,
        facturas: api.facturas.list,
        historial: api.historial.list,
        anomalias: api.anomalias.list
      };
      if (fetchers[activeTab]) {
        const result = await fetchers[activeTab]();
        if (Array.isArray(result)) {
          setData(prev => ({ ...prev, [activeTab]: result }));
        } else if (result.msg) {
          setData(prev => ({ ...prev, [activeTab]: [] }));
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id, tipo) => {
    if (!confirm('¿Eliminar ' + tipo + ' con ID ' + id + '?')) return;
    try {
      if (tipo === 'usuarios') await api.usuarios.delete(id);
      else if (tipo === 'coches') await api.coches.delete(id);
      else if (tipo === 'inventario') await api.inventario.delete(id);
      else if (tipo === 'trabajos') await api.trabajos.delete(id);
      setData(prev => ({ ...prev, [tipo]: prev[tipo]?.filter(item => 
        tipo === 'coches' ? item.matricula !== id : item.id !== id
      )}));
    } catch (err) {
      alert('Error al eliminar');
      console.error(err);
    }
  };

  const handleEdit = (item, tab) => {
    setEditingItem(item);
    const initialData = { ...item };
    if (tab === 'trabajos' && item.matricula) {
      initialData.matricula = item.matricula;
    }
    setFormData(initialData);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      if (activeTab === 'usuarios') await api.usuarios.update(editingItem.id, formData);
      else if (activeTab === 'coches') await api.coches.update(editingItem.id, formData);
      else if (activeTab === 'trabajos') await api.trabajos.update(editingItem.id, formData);
      else if (activeTab === 'inventario') await api.inventario.update(editingItem.id, formData);
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      loadData();
    } catch (err) {
      alert('Error al actualizar');
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      if (activeTab === 'usuarios') await api.usuarios.create(formData);
      else if (activeTab === 'coches') await api.coches.create(formData);
      else if (activeTab === 'citas') await api.citas.create(formData);
      else if (activeTab === 'trabajos') await api.trabajos.create(formData);
      else if (activeTab === 'inventario') await api.inventario.create(formData);
      else if (activeTab === 'anomalias') await api.anomalias.create(formData);
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (err) {
      alert('Error al guardar');
      console.error(err);
    }
  };

  const getColumns = (tab) => {
    const columnsMap = {
      usuarios: ['id', 'nombre', 'dni', 'email', 'movil', 'rol'],
      coches: ['matricula', 'marca', 'modelo', 'anio', 'kilometraje', 'cliente_nombre'],
      citas: ['id', 'fecha', 'hora', 'estado', 'descripcion', 'matricula', 'cliente_nombre'],
      trabajos: ['id', 'descripcion', 'precio', 'estado', 'matricula', 'mecanico_nombre'],
      inventario: ['id', 'nombre', 'categoria', 'stock', 'precio_venta'],
      facturas: ['id', 'fecha', 'total', 'estado'],
      historial: ['id', 'tipo', 'descripcion', 'fecha', 'precio'],
      anomalias: ['id', 'descripcion', 'estado', 'prioridad', 'matricula']
    };
    return columnsMap[tab] || [];
  };

  const renderDashboard = () => (
    <div style={styles.statsGrid}>
      <div style={styles.statCard}>
        <h3>Coches</h3>
        <p style={styles.statNumber}>{data.coches?.length || 0}</p>
      </div>
      <div style={styles.statCard}>
        <h3>Citas</h3>
        <p style={styles.statNumber}>{data.citas?.length || 0}</p>
      </div>
      <div style={styles.statCard}>
        <h3>Trabajos</h3>
        <p style={styles.statNumber}>{data.trabajos?.length || 0}</p>
      </div>
      {(isAdmin || isMecanico) && (
        <>
          <div style={styles.statCard}>
            <h3>Usuarios</h3>
            <p style={styles.statNumber}>{data.usuarios?.length || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Inventario</h3>
            <p style={styles.statNumber}>{data.inventario?.length || 0}</p>
          </div>
        </>
      )}
      {isAdmin && (
        <div style={styles.statCard}>
          <h3>Facturas</h3>
          <p style={styles.statNumber}>{data.facturas?.length || 0}</p>
        </div>
      )}
    </div>
  );

  const getFormFields = () => {
    const fields = {
      usuarios: ['nombre', 'dni', 'email', 'contrasena', 'movil', 'rol'],
      coches: ['matricula', 'marca', 'modelo', 'anio', 'kilometraje'],
      citas: ['matricula', 'fecha', 'hora', 'descripcion'],
      trabajos: ['matricula', 'descripcion', 'precio', 'estado'],
      inventario: ['nombre', 'descripcion', 'categoria', 'stock', 'precio_compra', 'precio_venta'],
      anomalias: ['matricula', 'descripcion', 'prioridad']
    };
    return fields[activeTab] || [];
  };

  const getDeleteId = (item, tab) => {
    if (tab === 'coches') return item.matricula;
    return item.id;
  };

  const renderTable = (tab) => {
    const columns = getColumns(tab);
    const items = data[tab] || [];
    const canDelete = (isAdmin || isMecanico) && ['usuarios', 'coches', 'citas', 'trabajos', 'inventario', 'anomalias'].includes(tab);
    const canCreate = (isAdmin || isMecanico || tab === 'coches' || tab === 'citas') && getFormFields().length > 0;
    const canEdit = (isAdmin || isMecanico) && ['usuarios', 'coches', 'trabajos', 'inventario'].includes(tab);
    
    return (
      <>
        {canCreate && (
          <button onClick={() => { setShowModal(true); setEditingItem(null); setFormData({}); }} style={styles.addBtn}>
            + Agregar {tab}
          </button>
        )}
        {items.length === 0 ? (
          <p style={{marginTop: '20px'}}>No hay datos</p>
        ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map(col => <th key={col} style={styles.th}>{col}</th>)}
              {(canEdit || canDelete) && <th style={styles.th}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                {columns.map(col => <td key={col} style={styles.td}>{String(item[col] || '')}</td>)}
                {(canEdit || canDelete) && (
                  <td style={styles.td}>
                    {canEdit && (
                      <button onClick={() => handleEdit(item, tab)} style={styles.editBtn}>Editar</button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(getDeleteId(item, tab), tab)} style={styles.deleteBtn}>X</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </>
    );
  };

  const renderModal = () => (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>{editingItem ? 'Editar' : 'Agregar'} {activeTab}</h3>
        {getFormFields().map(field => {
          if (field === 'rol') {
            return (
              <select
                key={field}
                value={formData[field] || 'cliente'}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                style={styles.input}
              >
                <option value="cliente">Cliente</option>
                <option value="mecanico">Mecanico</option>
              </select>
            );
          }
          if (field === 'estado') {
            return (
              <select
                key={field}
                value={formData[field] || 'pendiente'}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                style={styles.input}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
              </select>
            );
          }
          return (
            <input
              key={field}
              type={field === 'contrasena' ? 'password' : 'text'}
              placeholder={field === 'contrasena' ? 'contraseña' : field}
              value={formData[field] || ''}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              style={styles.input}
            />
          );
        })}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={editingItem ? handleUpdate : handleCreate} style={styles.saveBtn}>
            {editingItem ? 'Actualizar' : 'Guardar'}
          </button>
          <button onClick={() => { setShowModal(false); setEditingItem(null); setFormData({}); }} style={styles.cancelBtn}>Cancelar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Taller App</h1>
        <span style={{marginRight: '15px'}}>Rol: {user?.rol || 'cliente'}</span>
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
        <h2>{activeTab === 'dashboard' ? 'Panel' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
        {loading ? <p>Cargando...</p> : (
          activeTab === 'dashboard' ? renderDashboard() : renderTable(activeTab)
        )}
      </main>

      {showModal && renderModal()}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#333', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' },
  nav: { background: '#444', padding: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' },
  tab: { padding: '10px 15px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', textTransform: 'capitalize' },
  activeTab: { background: '#007bff', borderRadius: '5px' },
  main: { padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', marginTop: '15px' },
  th: { background: '#333', color: 'white', padding: '10px', textAlign: 'left' },
  td: { padding: '10px', borderBottom: '1px solid #ddd' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  statNumber: { fontSize: '36px', fontWeight: 'bold', color: '#007bff', margin: '10px 0 0 0' },
  addBtn: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' },
  editBtn: { padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: 'white', padding: '20px', borderRadius: '10px', width: '400px' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' },
  saveBtn: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' },
  cancelBtn: { padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }
};

export default Dashboard;
