import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Cube } from '../types';

// Abrimos (o creamos) la base de datos de forma síncrona
const db = SQLite.openDatabaseSync('cubedex.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cubes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      images TEXT NOT NULL, -- SQLite no tiene tipo array, guardaremos un JSON string
      description TEXT,
      pb TEXT
    );
  `);

  try {
    db.execSync(`ALTER TABLE cubes ADD COLUMN status TEXT DEFAULT 'coleccion';`);
  } catch (e) {}
  
  console.log('Base de datos inicializada');
};

export const saveCubeToDB = async (cubeData: Cube) => {
  try {
// 1. Mover las imágenes de la caché al almacenamiento permanente
    const permanentImages = await Promise.all(
      cubeData.images.map(async (tempUri: string) => {
        const filename = tempUri.split('/').pop();
        
        // Aseguramos a TypeScript que documentDirectory es un string válido
        const baseDir = FileSystem.documentDirectory || ''; 
        const permanentPath = `${baseDir}${filename}`;
       
        await FileSystem.copyAsync({
          from: tempUri,
          to: permanentPath,
        });
        
        return permanentPath; 
      })
    );

    // 2. Insertar los datos en SQLite
    const statement = db.prepareSync(
      'INSERT INTO cubes (id, name, brand, category, images, description, pb, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    
    statement.executeSync([
      cubeData.id,
      cubeData.name,
      cubeData.brand,
      cubeData.category,
      JSON.stringify(permanentImages), // Convertimos el array a string
      cubeData.description || '',
      cubeData.pb || '',
      cubeData.status || 'coleccion'
    ]);

    console.log('Cubo guardado con éxito en SQLite');
    return true;
  } catch (error) {
    console.error('Error guardando en BD:', error);
    return false;
  }
};

export const getCubesFromDB = (): Cube[] => {
  try {
    // Obtenemos todos los cubos de forma síncrona
    const result = db.getAllSync('SELECT * FROM cubes');
    
    // Transformamos el string de imágenes devuelta a un arreglo de rutas
    return result.map((row: any) => ({
      ...row,
      images: JSON.parse(row.images)
    }));
  } catch (error) {
    console.error('Error leyendo la BD:', error);
    return [];
  }
};

export const deleteCubeFromDB = async (id: string) => {
  try {
    const statement = db.prepareSync('DELETE FROM cubes WHERE id = ?');
    statement.executeSync([id]);
    console.log(`Cubo con ID ${id} eliminado correctamente`);
    return true;
  } catch (error) {
    console.error('Error eliminando de la BD:', error);
    return false;
  }
};

export const updateCubeInDB = async (cubeData: Cube) => {
  try {
    const permanentImages = await Promise.all(
      cubeData.images.map(async (uri: string) => {
        // Si la foto ya está en nuestro directorio seguro, la dejamos igual
        const baseDir = FileSystem.documentDirectory || ''; 
        if (uri.startsWith(baseDir)) {
          return uri;
        }
        
        // Si es una foto nueva, la movemos
        const filename = uri.split('/').pop();
        const permanentPath = `${baseDir}${filename}`;
        await FileSystem.copyAsync({ from: uri, to: permanentPath });
        return permanentPath; 
      })
    );

    const statement = db.prepareSync(
      'UPDATE cubes SET name = ?, brand = ?, category = ?, images = ?, description = ?, pb = ?, status = ? WHERE id = ?'
    );
    
    statement.executeSync([
      cubeData.name,
      cubeData.brand,
      cubeData.category,
      JSON.stringify(permanentImages), 
      cubeData.description || '',
      cubeData.pb || '',
      cubeData.status || 'coleccion',
      cubeData.id 
    ]);

    console.log('Cubo actualizado correctamente');
    return true;
  } catch (error) {
    console.error('Error actualizando en BD:', error);
    return false;
  }
};