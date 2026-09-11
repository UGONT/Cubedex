import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  TextInput,
  ScrollView 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
// Asegúrate de tener Feather instalado de los pasos anteriores
import { Feather } from '@expo/vector-icons'; 
import { RootStackParamList, Cube, CubeCategory } from '../types';
import { getCubesFromDB } from '../db/database';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Lista de categorías para los filtros rápidos
const CATEGORIES = ['Todas', '2x2', '3x3', '4x4', '5x5', '6x6', '7x7', 'Megaminx', 'Square-1', 'Skewb', 'Pyraminx', 'Otro'];



export default function HomeScreen({ navigation }: Props) {
  const [cubes, setCubes] = useState<Cube[]>([]);
  // Nuevos estados para la búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activeTab, setActiveTab] = useState<'coleccion' | 'deseados'>('coleccion');

  useFocusEffect(
    useCallback(() => {
      const loadCubes = () => {
        const data = getCubesFromDB();
        setCubes(data);
      };
      loadCubes();
    }, [])
  );
  
  // Calculamos los totales revisando la lista completa
  const collectionCount = cubes.filter(cube => (cube.status || 'coleccion') === 'coleccion').length;
  const wishlistCount = cubes.filter(cube => cube.status === 'deseados').length;


  // Lógica de filtrado en tiempo real
  const filteredCubes = cubes.filter(cube => {
    // 1. Filtro por Pestaña (Si el cubo no tiene status, asumimos que es de 'coleccion')
    const cubeStatus = cube.status || 'coleccion';
    if (cubeStatus !== activeTab) return false;

    // 2. Filtros de búsqueda y categoría
    const matchesSearch = 
      cube.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cube.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'Todas' || cube.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderCubeCard = ({ item }: { item: Cube }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CubeDetail', { cube: item })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.cubeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cubeBrand}>{item.brand} • {item.category}</Text>
        {item.pb ? <Text style={styles.cubePb}>PB: {item.pb}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* 0. Selector de Pestañas (Segmented Control) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'coleccion' && styles.activeTab]}
          onPress={() => setActiveTab('coleccion')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'coleccion' && styles.activeTabText]}>
            Mi Colección ({collectionCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'deseados' && styles.activeTab]}
          onPress={() => setActiveTab('deseados')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'deseados' && styles.activeTabText]}>
            Deseados ({wishlistCount})
          </Text>
        </TouchableOpacity>
      </View>
      {/* 1. Barra de Búsqueda */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar un GAN, QiYi o modelo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing" // En iOS pone la "X" para borrar
        />
        {searchQuery.length > 0 && ( // Botón "X" manual para Android
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Filtros de Categoría (Chips) */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Cuadrícula de Cubos Filtrados */}
      {filteredCubes.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="inbox" size={48} color="#CBD5E1" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No se encontraron cubos.</Text>
          {cubes.length === 0 && <Text style={styles.emptySubtext}>¡Agrega tu primer puzzle!</Text>}
        </View>
      ) : (
        <FlatList
          data={filteredCubes}
          renderItem={renderCubeCard}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          keyboardShouldPersistTaps="handled" // Permite tocar los cubos sin tener que cerrar el teclado primero
        />
      )}
      

      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CubeForm', {})}
      >
        <Feather name="plus" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  // --- Estilos nuevos para búsqueda y filtros ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
  },
  filtersContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#3B82F6',
  },
  chipText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#FFF',
  },
  // --- Estilos anteriores ---
  listContainer: {
    padding: 10,
    paddingBottom: 100, 
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    flex: 1,
    margin: 8,
    maxWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    padding: 12,
  },
  cubeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  cubeBrand: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  cubePb: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // --- Estilos para las Pestañas Superiores ---
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
  },
});