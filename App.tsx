// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';

// Importamos las pantallas (aunque estén casi vacías por ahora)
import HomeScreen from './src/screens/HomeScreen';
import CubeDetailScreen from './src/screens/CubeDetailScreen';
import CubeFormScreen from './src/screens/CubeFormScreen';

import { initDB } from './src/db/database';

// Ejecutamos la inicialización
initDB();

// Creamos el Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#F5F7FA' },
          headerTintColor: '#1E293B',
          headerTitleStyle: { fontWeight: 'bold' },
          animation: 'none'
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Mi Cubedex' }} 
        />
        <Stack.Screen 
          name="CubeDetail" 
          component={CubeDetailScreen} 
          options={{ title: 'Detalles del Cubo' }} 
        />
        <Stack.Screen 
          name="CubeForm" 
          component={CubeFormScreen} 
          options={({ route }) => ({ 
            // El título cambia si estamos creando o editando
            title: route.params?.cubeToEdit ? 'Editar Cubo' : 'Nuevo Cubo' 
          })} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}