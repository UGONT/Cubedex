import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
// Importaremos la función para eliminar (la crearemos en el siguiente paso)
import { deleteCubeFromDB } from '../db/database';

import ImageView from 'react-native-image-viewing';

type Props = NativeStackScreenProps<RootStackParamList, 'CubeDetail'>;

export default function CubeDetailScreen({ route, navigation }: Props) {
  const { cube } = route.params;

  // Estados para el visor de imágenes
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formattedImages = cube.images.map(uri => ({ uri }));

  const handleDelete = () => {
    // Alerta nativa para confirmar antes de borrar
    Alert.alert(
      "Eliminar Cubo",
      `¿Estás seguro de que quieres eliminar a ${cube.name} de tu Cubedex?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            const success = await deleteCubeFromDB(cube.id);
            if (success) {
              navigation.goBack(); // Volvemos al catálogo
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Carrusel de fotos horizontal */}
      {/* 3. Actualizamos el Carrusel para que las imágenes sean botones */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
        {cube.images.map((uri, index) => (
          <TouchableOpacity 
            key={index} 
            activeOpacity={0.9} // Un destello muy sutil al tocar
            onPress={() => {
              setCurrentImageIndex(index);
              setIsViewerVisible(true);
            }}
          >
            <Image source={{ uri }} style={styles.image} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.photoCount}>
        {cube.images.length > 1 ? `Desliza para ver más (${cube.images.length} fotos)` : ''}
      </Text>


      {/* Cabecera del Cubo */}
      <View style={styles.header}>
        <Text style={styles.name}>{cube.name}</Text>
        <Text style={styles.brandCategory}>{cube.brand} • {cube.category}</Text>
      </View>

      {/* Tarjeta de Datos */}
      <View style={styles.dataCard}>
        {cube.pb ? (
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Personal Best (PB):</Text>
            <Text style={styles.dataValuePb}>{cube.pb}</Text>
          </View>
        ) : null}

        {cube.description ? (
          <View style={styles.dataRowColumn}>
            <Text style={styles.dataLabel}>Descripción / Notas:</Text>
            <Text style={styles.dataValueDesc}>{cube.description}</Text>
          </View>
        ) : (
          <Text style={styles.emptyDesc}>Sin descripción adicional.</Text>
        )}
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.modernBtn, styles.editBtn]} 
          onPress={() => navigation.navigate('CubeForm', { cubeToEdit: cube })}
          activeOpacity={0.7}
        >
          <Feather name="edit-3" size={20} color="#FFF" />
          <Text style={styles.modernBtnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modernBtn, styles.deleteBtn]} 
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={20} color="#EF4444" />
          <Text style={[styles.modernBtnText, { color: '#EF4444' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>

      {/* 4. Componente del Visor de Imágenes a Pantalla Completa */}
      <ImageView
        images={formattedImages}
        imageIndex={currentImageIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)} // Cuando deslizas hacia abajo o tocas la X
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingBottom: 40,
  },
  imageCarousel: {
    height: 350,
  },
  image: {
    width: 384, // Ancho fijo para el carrusel, puedes ajustarlo si se ve raro en tu celular
    height: 350,
    backgroundColor: '#E2E8F0',
  },
  photoCount: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  brandCategory: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  dataCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataRowColumn: {
    flexDirection: 'column',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dataLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
  },
  dataValuePb: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  dataValueDesc: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginTop: 8,
  },
  emptyDesc: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },




  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12, // Espacio entre botones
  },
  modernBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30, // Forma de píldora
    gap: 8, // Espacio entre el ícono y el texto
  },
  editBtn: {
    backgroundColor: '#3B82F6', // Azul moderno para editar (o el color que prefieras)
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2', // Fondo rojizo suave
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  modernBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});