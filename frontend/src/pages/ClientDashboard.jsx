import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

function CarModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function SimpleCar() {
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.9]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[0.6, 0.15, 0.52]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.6, 0.15, 0.52]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.6, 0.15, -0.52]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.6, 0.15, -0.52]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.9, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.8]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
    </group>
  );
}

function Car3DViewer({ color = "#e74c3c" }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.2, 0.95, 0.3]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.3]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.5, 0.15, 0.52]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.5, 0.15, 0.52]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.5, 0.15, -0.52]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.5, 0.15, -0.52]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-0.9, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.5, 0.18, 0.7]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.9, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.5, 0.18, 0.7]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.2, 0.05, 1.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

const COLORS = {
  rojo: "#e74c3c",
  azul: "#3498db",
  verde: "#27ae60",
  negro: "#2c3e50",
  blanco: "#ecf0f1",
  gris: "#7f8c8d",
  amarillo: "#f1c40f",
  naranja: "#e67e22"
};

const ClientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [coches, setCoches] = useState([]);
  const [selectedCoche, setSelectedCoche] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cochesRes, citasRes] = await Promise.all([
        api.coches.list(),
        api.citas.list()
      ]);
      setCoches(Array.isArray(cochesRes) ? cochesRes : []);
      setCitas(Array.isArray(citasRes) ? citasRes : []);
      if (cochesRes.length > 0 && !selectedCoche) {
        setSelectedCoche(cochesRes[0]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadHistorial = async (cocheId) => {
    try {
      const res = await api.historial.list();
      const filtered = Array.isArray(res) ? res.filter(h => h.coche_id === cocheId) : [];
      setHistorial(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCoche) {
      loadHistorial(selectedCoche.id);
    }
  }, [selectedCoche]);

  const handleAddCoche = async () => {
    try {
      await api.coches.create(formData);
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (err) {
      alert('Error al agregar coche');
    }
  };

  if (loading) return <div style={styles.loading}>Cargando...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Mi Garage</h1>
        <div style={styles.userInfo}>
          <span>Bienvenido, {user?.email}</span>
          <button onClick={logout} style={styles.logoutBtn}>Cerrar Sesión</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <div style={styles.leftPanel}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Mis Coches</h2>
              <button onClick={() => { setShowModal(true); setFormData({}); }} style={styles.addBtn}>
                + Agregar Coche
              </button>
              
              <div style={styles.carList}>
                {coches.length === 0 ? (
                  <p style={styles.emptyText}>No tienes coches registrados</p>
                ) : (
                  coches.map(coche => (
                    <div
                      key={coche.id}
                      style={{
                        ...styles.carCard,
                        ...(selectedCoche?.id === coche.id ? styles.carCardSelected : {})
                      }}
                      onClick={() => setSelectedCoche(coche)}
                    >
                      <div style={styles.carIcon}>🚗</div>
                      <div style={styles.carInfo}>
                        <div style={styles.carMatricula}>{coche.matricula}</div>
                        <div style={styles.carDetails}>{coche.marca} {coche.modelo}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Próximas Citas</h2>
              {citas.filter(c => c.estado === 'pendiente' || c.estado === 'asignada').length === 0 ? (
                <p style={styles.emptyText}>No hay citas pendientes</p>
              ) : (
                citas.filter(c => c.estado === 'pendiente' || c.estado === 'asignada').map(cita => (
                  <div key={cita.id} style={styles.citaCard}>
                    <div style={styles.citaFecha}>{cita.fecha}</div>
                    <div style={styles.citaHora}>{cita.hora}</div>
                    <div style={styles.citaEstado}>{cita.estado}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.rightPanel}>
            {selectedCoche ? (
              <>
                <div style={styles.viewer3d}>
                  <Canvas shadows camera={{ position: [4, 2, 4], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
                    <Car3DViewer color={COLORS.rojo} />
                    <OrbitControls autoRotate autoRotateSpeed={0.5} />
                    <gridHelper args={[10, 10]} />
                  </Canvas>
                  <div style={styles.viewerHint}>Arrastra para rotar • Rueda para zoom</div>
                </div>

                <div style={styles.cocheDetails}>
                  <h2 style={styles.cocheTitle}>{selectedCoche.marca} {selectedCoche.modelo}</h2>
                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Matrícula</span>
                      <span style={styles.detailValue}>{selectedCoche.matricula}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Año</span>
                      <span style={styles.detailValue}>{selectedCoche.anio || 'N/A'}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Kilometraje</span>
                      <span style={styles.detailValue}>{selectedCoche.kilometraje || 'N/A'} km</span>
                    </div>
                  </div>
                </div>

                <div style={styles.section}>
                  <h2 style={styles.sectionTitle}>Historial del Vehículo</h2>
                  {historial.length === 0 ? (
                    <p style={styles.emptyText}>Sin historial registrado</p>
                  ) : (
                    <div style={styles.historialList}>
                      {historial.map(h => (
                        <div key={h.id} style={styles.historialItem}>
                          <div style={styles.historialFecha}>{h.creado_en?.split('T')[0]}</div>
                          <div style={styles.historialTipo}>{h.tipo}</div>
                          <div style={styles.historialDesc}>{h.descripcion}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={styles.noSelection}>
                <div style={styles.noSelectionIcon}>🚗</div>
                <p>Selecciona un coche para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Agregar Coche</h3>
            <input
              type="text"
              placeholder="Matrícula"
              value={formData.matricula || ''}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Marca"
              value={formData.marca || ''}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Modelo"
              value={formData.modelo || ''}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Año"
              value={formData.anio || ''}
              onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Kilometraje"
              value={formData.kilometraje || ''}
              onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
              style={styles.input}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleAddCoche} style={styles.saveBtn}>Guardar</button>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#1a1a2e' },
  loading: { color: 'white', textAlign: 'center', padding: '50px' },
  header: { background: '#16213e', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { display: 'flex', gap: '15px', alignItems: 'center' },
  logoutBtn: { padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' },
  main: { padding: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px', minHeight: 'calc(100vh - 100px)' },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { background: '#16213e', borderRadius: '15px', padding: '20px' },
  sectionTitle: { color: 'white', marginBottom: '15px', fontSize: '18px' },
  addBtn: { width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '8px', marginBottom: '15px' },
  carList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  carCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#1a1a2e', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s' },
  carCardSelected: { background: '#0f3460', border: '2px solid #e94560' },
  carIcon: { fontSize: '30px' },
  carInfo: { flex: 1 },
  carMatricula: { color: 'white', fontWeight: 'bold', fontSize: '16px' },
  carDetails: { color: '#888', fontSize: '14px' },
  citaCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#1a1a2e', borderRadius: '8px', marginBottom: '10px' },
  citaFecha: { color: '#e94560', fontWeight: 'bold' },
  citaHora: { color: 'white' },
  citaEstado: { color: '#27ae60', fontSize: '12px' },
  viewer3d: { background: '#16213e', borderRadius: '15px', height: '400px', position: 'relative' },
  viewerHint: { position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', color: '#888', fontSize: '12px' },
  cocheDetails: { background: '#16213e', borderRadius: '15px', padding: '20px' },
  cocheTitle: { color: 'white', marginBottom: '15px', fontSize: '24px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '5px' },
  detailLabel: { color: '#888', fontSize: '12px' },
  detailValue: { color: 'white', fontSize: '16px', fontWeight: 'bold' },
  historialList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  historialItem: { display: 'flex', gap: '15px', padding: '12px', background: '#1a1a2e', borderRadius: '8px' },
  historialFecha: { color: '#e94560', fontSize: '12px', minWidth: '80px' },
  historialTipo: { color: '#27ae60', fontSize: '12px', minWidth: '80px' },
  historialDesc: { color: 'white', fontSize: '14px' },
  noSelection: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' },
  noSelectionIcon: { fontSize: '80px', marginBottom: '20px' },
  emptyText: { color: '#888', textAlign: 'center', padding: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: '#16213e', padding: '30px', borderRadius: '15px', width: '400px' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', background: '#1a1a2e', border: '1px solid #333', color: 'white', borderRadius: '8px', boxSizing: 'border-box' },
  saveBtn: { padding: '12px 24px', background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '8px' },
  cancelBtn: { padding: '12px 24px', background: '#666', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '8px' }
};

export default ClientDashboard;
