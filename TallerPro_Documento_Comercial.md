# TALLERPRO
## Gestión Inteligente para Talleres Mecánicos

---

# 📋 FICHA COMERCIAL

| | |
|---|---|
| **Producto** | TallerPro - Software de gestión para talleres |
| **Versión** | 1.0 |
| **Tipo** | SaaS / On-premise |
| **Sector** | Automoción - Talleres mecánicos |
| **Precio orientación** | Desde 99€/mes por taller |

---

# 🎯 PROBLEMA

El **85% de los talleres** en España siguen gestionando sus citas con papel, WhatsApp o Excel.

Esto significa:

- ❌ Citas que se solapan o pierden
- ❌ Clientes que no recuerdan cuándo fue su último servicio
- ❌ Mecánicos sin visibilidad de sus trabajos
- ❌ Facturas manuales y propensas a errores
- ❌ Tiempo perdido buscando información

**Resultado**: Perdida de dinero, clientes insatisfechos y caos operativo.

---

# 💡 SOLUCIÓN

**TallerPro** centraliza toda la gestión del taller en una sola plataforma:

```
┌─────────────────────────────────────────────────────────┐
│                    TALLERPRO                            │
│                                                          │
│   📱 CLIENTE          🔧 MECÁNICO         👨‍💼 ADMIN    │
│   ──────────          ──────────          ──────────    │
│   • Ver coches        • Ver trabajos      • Dashboard   │
│   • Pedir citas       • Iniciar/finalizar • Gestionar   │
│   • Ver historial     • Añadir notas      • Facturar    │
│   • Recibir alertas   • Sugerir servicios • Inventario  │
└─────────────────────────────────────────────────────────┘
```

---

# ✨ FUNCIONALIDADES

## Para el CLIENTE

| Feature | Descripción |
|---------|-------------|
| 🚗 **Portal del cliente** | Ve sus coches, historial y citas desde cualquier dispositivo |
| 📅 **Citas online** | Solicita cita 24/7 sin llamar al taller |
| 🔔 **Alertas ITV** | Recordatorio automático cuando se acerca la ITV |
| 📋 **Historial completo** | Todas las intervenciones de su coche disponibles |
| 📧 **Notificaciones** | Email/SMS con recordatorios de mantenimiento |

## Para el MECÁNICO

| Feature | Descripción |
|---------|-------------|
| 📋 **Mis trabajos** | Lista clara de trabajos asignados |
| ▶️ **Iniciar/Finalizar** | Un clic para marcar inicio y fin del trabajo |
| ⏱️ **Control de tiempos** | Registro automático de duración |
| 💡 **Sugerencias** | Proponer próximo servicio al cliente |

## Para el ADMIN

| Feature | Descripción |
|---------|-------------|
| 📊 **Dashboard** | Métricas en tiempo real: citas, trabajos, ingresos |
| 👥 **Gestión de usuarios** | Control total de empleados y roles |
| 📦 **Inventario** | Control de piezas y stock |
| 💰 **Facturación** | Generación de facturas vinculada a trabajos |
| ✅ **Aprobar citas** | Revisar y confirmar solicitudes de clientes |

---

# 🔄 FLUJO DE USO

```
CLIENTE                    TALLER                    SISTEMA
───────                    ──────                    ───────

1. Registra coche              │
   (matrícula, modelo)        │
         │                    │
         ▼                    │
2. Solicita cita ────────────► │
                                │
3.                         Admin revisa
                                │
                                ▼
4.                     Cita aceptada
   Notificación ─────────────► │
                                │
                                ▼
5.                     Trabajo creado
   Notificación ─────────────► │
                                │
                                ▼
6.                     Mecánico recibe
   Ver trabajo ───────────────►│
                                │
                                ▼
7.                     Inicia trabajo
   Tracking ─────────────────► │
                                │
                                ▼
8.                     Completa trabajo
                                │
                                ▼
9.               Factura generada
                                │
                                ▼
10.              Historial actualizado
   Ver ───────────────────────► │
```

---

# 🏗️ STACK TÉCNICO

| Componente | Tecnología |
|------------|------------|
| Backend | Node.js + Express |
| Frontend | React 19 |
| Base de datos | PostgreSQL |
| Autenticación | JWT con roles |
| Despliegue | Docker / Cloud |

**Seguridad**: Contraseñas encriptadas, tokens con expiración, validación de roles por endpoint.

---

# 📱 FUNCIONALIDADES FUTURAS

| Feature | Estado | Descripción |
|---------|--------|-------------|
| App móvil cliente | Roadmap Q3 | iOS/Android para clientes |
| Integración WhatsApp | Roadmap Q3 | Notificaciones via WhatsApp |
| Cámara + IA | Explorando | Reconocimiento automático de matrículas |
| Dashboard productividad | Roadmap Q4 | Métricas por mecánico |
| Multi-taller | Roadmap Q4 | Gestión franchising |

---

# 💰 MODELO DE NEGOCIO

## Opción 1: SaaS (Recomendado)

| Plan | Precio | Características |
|------|--------|-----------------|
| **Starter** | 99€/mes | 1 taller, hasta 5 usuarios, funciones básicas |
| **Professional** | 199€/mes | 1 taller, usuarios ilimitados, todas las funciones |
| **Business** | 399€/mes | Multi-taller, API, soporte prioritario |

## Opción 2: Licencia On-Premise

- **Precio**: 2.000€ - 5.000€ (único pago)
- **Requisitos**: Servidor propio del cliente
- **Mantenimiento**: 20%/año

## Opción 3: White-label

- Para empresas que quieran su propia marca
- Precio a negociar según alcance

---

# 🎯 MERCADO OBJETIVO

## Primarios
- Talleres mecánicos independientes (1-10 empleados)
- Talleres de franquicia buscando digitalizarse

## Secundarios
- Concesionarios con taller propio
- Centros ITV
- Flotas empresariales

## TAM (Total Addressable Market)
- ~50.000 talleres en España
- Facturación media sector: 500.000€/año
- Potencial de mercado: 5.000M€

---

# 🆚 COMPETENCIA

| Competidor | Fortalezas | Debilidades TallerPro |
|------------|------------|----------------------|
| **Talleres 360** | Consolidado | No tiene portal cliente |
| **Cobertia** | Marca conocida | Complejo, caro |
| **Soluciones propias** | Personalizado | Desarrollo propio costoso |

**Diferenciadores de TallerPro:**
1. ✅ Portal cliente incluido (no todos lo tienen)
2. ✅ Alertas ITV automáticas
3. ✅ Registro de tiempos por trabajo
4. ✅ Diseño moderno y fácil de usar
5. ✅ Precio competitivo

---

# 📈 CASO DE USO

## Taller "Garaje López" - Antes vs Después

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Citas perdidas/mes | 12 | 2 | 83% |
| Tiempo gestión admin | 4h/día | 1h/día | 75% |
| Clientes que vuelven | 60% | 85% | 42% |
| Facturación mes | 15.000€ | 19.500€ | 30% |

---

# 🛡️ GARANTÍAS

- **Demo gratuita**: 14 días sin compromiso
- **Sin permanencia**: Cancela cuando quieras (SaaS)
- **Migración asistida**: Te ayudamos a importar tus datos
- **Soporte**: Email y chat incluido en todos los planes

---

# 📞 PRÓXIMOS PASOS

1. **Demo personalizada** (30 min)
   - Mostramos cómo se adapta a su taller
   - Respondemos preguntas específicas

2. **Periodo de prueba** (14 días)
   - Acceso completo al sistema
   - Soporte técnico incluido

3. **Alta y configuración** (1-2 días)
   - Alta de usuarios
   - Importación de datos
   - Formación básica

---

# 📧 CONTACTO

**Empresa**: TallerPro Solutions S.L.  
**Web**: www.tallerpro.es  
**Email**: comercial@tallerpro.es  
**Teléfono**: +34 900 XXX XXX  

---

# 📎 ANEXO: ESPECIFICACIONES TÉCNICAS

## Requisitos cliente

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| Navegador | Chrome 90+, Firefox 88+, Safari 14+ | Chrome latest |
| Conexión | 1 Mbps | 5 Mbps |
| Dispositivos | PC, tablet, móvil | PC + móvil |

## Requisitos servidor (On-premise)

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disco | 20 GB SSD | 50 GB SSD |
| SO | Ubuntu 20.04 / Debian 11 | Ubuntu 22.04 |

## API

- REST API con autenticación JWT
- Webhooks para integraciones
- Documentación OpenAPI/Swagger

---

*Documento confidencial - TallerPro Solutions S.L. 2026*
