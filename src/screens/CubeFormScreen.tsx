import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert ,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { CubeCategory } from '../types';

import { saveCubeToDB, updateCubeInDB } from '../db/database';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { useHeaderHeight } from '@react-navigation/elements';


// Agrega el tipado de props para la navegación
type Props = NativeStackScreenProps<RootStackParamList, 'CubeForm'>;

export default function CubeFormScreen({ route, navigation }: Props) {
  // Estados para nuestros campos

  const headerHeight = useHeaderHeight();

  const cubeToEdit = route.params?.cubeToEdit;
  const [name, setName] = useState(cubeToEdit?.name || '');
  const [brand, setBrand] = useState(cubeToEdit?.brand || '');
  const [category, setCategory] = useState<CubeCategory>(cubeToEdit?.category || '3x3');
  const [description, setDescription] = useState(cubeToEdit?.description || '');
  const [pb, setPb] = useState(cubeToEdit?.pb || '');
  const [images, setImages] = useState<string[]>(cubeToEdit?.images || []);

  const [status, setStatus] = useState<'coleccion' | 'deseados'>(cubeToEdit?.status || 'coleccion');
  // Función para abrir la galería y seleccionar una foto
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Límite alcanzado', 'Puedes subir un máximo de 5 fotos por cubo.');
      return;
    }

    // Pedimos abrir la galería
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Recortar en formato cuadrado (ideal para catálogos)
      quality: 0.8,
    });

    if (!result.canceled) {
      // Agregamos la nueva URI de la imagen al arreglo
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Función para eliminar una foto seleccionada si te equivocas
  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // Función para guardar (por ahora solo validará y mostrará por consola)
  const handleSave = async () => {
    if (!name.trim() || !brand.trim() || images.length === 0) {
      Alert.alert('Error', 'El nombre, la marca y al menos 1 foto son obligatorios.');
      return;
    }

  const cubeData = {
        id: cubeToEdit ? cubeToEdit.id : Date.now().toString(), // Mantenemos el ID si estamos editando
        name,
        brand,
        category,
        images,
        description,
        pb,
        status,
      };

  const success = cubeToEdit 
  ? await updateCubeInDB(cubeData) 
  : await saveCubeToDB(cubeData);

    

  if (success) {
        // Como el detalle también se quedó con la información vieja, 
        // lo mejor es volver a la pantalla Home para que refresque todo.
        navigation.popToTop();
      }
    // Aquí luego agregaremos la lógica para guardar en base de datos
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      // En iOS funciona mejor con 'padding', en Android el sistema suele manejarlo 
      // mejor por defecto, o usando 'height'.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.label}>¿Dónde quieres agregarlo? *</Text>
        <View style={[styles.tabContainer, { marginHorizontal: 0, marginTop: 0 }]}>
          <TouchableOpacity 
            style={[styles.tab, status === 'coleccion' && styles.activeTab]}
            onPress={() => setStatus('coleccion')}
          >
            <Text style={[styles.tabText, status === 'coleccion' && styles.activeTabText]}>Mi Colección</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, status === 'deseados' && styles.activeTab]}
            onPress={() => setStatus('deseados')}
          >
            <Text style={[styles.tabText, status === 'deseados' && styles.activeTabText]}>Deseados</Text>
          </TouchableOpacity>
        </View>
        {/* Sección de Fotos */}
        <Text style={styles.label}>Fotos ({images.length}/5) *</Text>
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <TouchableOpacity key={index} onPress={() => removeImage(index)}>
              <Image source={{ uri }} style={styles.previewImage} />
              <View style={styles.removeBadge}><Text style={styles.removeText}>X</Text></View>
            </TouchableOpacity>
          ))}
          {images.length < 5 && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Text style={styles.addImageText}>+ Foto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Campos Obligatorios */}
        <Text style={styles.label}>Nombre del Cubo *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: GAN 12 Maglev" 
          value={name} 
          onChangeText={setName} 
        />

        <Text style={styles.label}>Marca *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: GAN, QiYi, MoYu" 
          value={brand} 
          onChangeText={setBrand} 
        />

        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue as CubeCategory)}
          >
            <Picker.Item label="2x2" value="2x2" />
            <Picker.Item label="3x3" value="3x3" />
            <Picker.Item label="4x4" value="4x4" />
            <Picker.Item label="5x5" value="5x5" />
            <Picker.Item label="6x6" value="6x6" />
            <Picker.Item label="7x7" value="7x7" />
            <Picker.Item label="Megaminx" value="Megaminx" />
            <Picker.Item label="Square-1" value="Square-1" />
            <Picker.Item label="Skewb" value="Skewb" />
            <Picker.Item label="Pyraminx" value="Pyraminx" />
            <Picker.Item label="Otro" value="Otro" />
          </Picker>
        </View>

        {/* Campos Opcionales */}
        <Text style={styles.label}>Personal Best (PB) - Opcional</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 11.03s" 
          value={pb} 
          onChangeText={setPb} 
          keyboardType="numeric"
        />

        <Text style={styles.label}>Descripción - Opcional</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Notas sobre el ajuste, lubricación, etc." 
          value={description} 
          onChangeText={setDescription} 
          multiline
          numberOfLines={4}
        />

        {/* Botón de Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Cubo</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Para que el texto empiece arriba en Android
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden', // Importante para que el Picker respete los bordes redondos
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  addImageText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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