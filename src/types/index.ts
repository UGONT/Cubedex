// src/types/index.ts

// Definimos las categorías exactas que permitiremos (puedes agregar más)
export type CubeCategory = '2x2' | '3x3' | '4x4' | '5x5' | '6x6' | '7x7' | 'Megaminx' | 'Square-1' | 'Skewb' | 'Pyraminx' | 'Otro';

// Este es el "molde" de nuestro Cubo
export interface Cube {
  id: string; 
  name: string; 
  brand: string; 
  category: CubeCategory; 
  images: string[]; // Un arreglo de rutas de imágenes (ej: ['ruta/foto1.jpg', 'ruta/foto2.jpg'])
  description?: string; // El símbolo "?" significa que es opcional
  pb?: string;
  status?: 'coleccion' | 'deseados'; 
}

// También definiremos las rutas de nuestra aplicación aquí mismo
// Esto ayuda a que TypeScript sepa qué parámetros necesita cada pantalla
export type RootStackParamList = {
  Home: undefined; // La pantalla Home no recibe parámetros
  CubeDetail: { cube: Cube }; // Al ir al detalle, le pasamos el objeto Cubo completo
  CubeForm: { cubeToEdit?: Cube }; // Opcional: si le pasamos un cubo, es para Editar. Si no, es para Crear.
};

