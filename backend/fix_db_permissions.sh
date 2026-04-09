#!/bin/bash
# Script para arreglar la base de datos del taller
# Ejecutar como: sudo ./fix_db_permissions.sh

echo "Configurando permisos de PostgreSQL..."

# Verificar si estamos como root o con sudo
if [ "$EUID" -ne 0 ]; then
  echo "Este script necesita permisos de root. Ejecuta: sudo $0"
  exit 1
fi

# Opciones de conexión
HOST="localhost"
DB="taller"
USER="postgres"

# Agregar columnas a trabajos
echo "Agregando columnas hora_inicio y hora_fin a trabajos..."
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE trabajos ADD COLUMN IF NOT EXISTS hora_inicio TIMESTAMP DEFAULT NULL;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE trabajos ADD COLUMN IF NOT EXISTS hora_fin TIMESTAMP DEFAULT NULL;"

# Agregar columnas a coches si no existen
echo "Agregando columnas estado e itv_vigencia a coches..."
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE coches ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente';"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE coches ADD COLUMN IF NOT EXISTS itv_vigencia DATE;"

# Agregar columnas a historial si no existen
echo "Agregando columnas a historial..."
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE historial ADD COLUMN IF NOT EXISTS fecha DATE DEFAULT CURRENT_DATE;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE historial ADD COLUMN IF NOT EXISTS kilometraje INTEGER;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE historial ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2);"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE historial ADD COLUMN IF NOT EXISTS siguiente_fecha DATE;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE historial ADD COLUMN IF NOT EXISTS siguiente_kilometraje INTEGER;"

# Eliminar tabla anomalias
echo "Eliminando tabla anomalias..."
psql -h $HOST -U $USER -d $DB -c "DROP TABLE IF EXISTS anomalias CASCADE;"

# Cambiar dueño de las tablas a taller_user
echo "Cambiando dueño de las tablas a taller_user..."
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE trabajos OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE coches OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE citas OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE historial OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE inventario OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE facturas OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE factura_detalles OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE notificaciones OWNER TO taller_user;"
psql -h $HOST -U $USER -d $DB -c "ALTER TABLE usuarios OWNER TO taller_user;"

echo "¡Listo! Las tablas ahora son propiedad de taller_user."
