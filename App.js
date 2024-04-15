// Imported libraries used in this app
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
// useEffect, useReducer, and useCallback are part of the photo gallery
import React, { useState, useEffect, useReducer, useCallback } from 'react';
// ActivityIndicator is a part of the photo gallery
import {
  Text,
  View,
  Button,
  StyleSheet,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
// Navigation libraries
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Creates gradient effect
import { LinearGradient } from 'expo-linear-gradient';
// Libraries needed for photo gallery
import { getList } from './api/picsum';
import { actionCreators, initialState, reducer } from './reducers/photos';
import PhotoGrid from './components/PhotoGrid';
// Image Picker
import * as ImagePicker from 'expo-image-picker';

// This is our starting page
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
    <LinearGradient
            colors={['rgba(27, 47, 143, 0.8)', 'transparent']}
            style={styles.background}
          />
      <Text style={styles.title}>{'\n\n'}Welcome to Photo Vault!</Text>
      <Image
        source={require('./assets/camera.png')}
        style={{ height: '15%', width: '26%', alignSelf: 'center' }}
      />
      <Text style={{ color: 'white', fontSize: 20 }}>
        {'\n'}Welcome back to Photo Vault! Your photos are still safe and sound in the cloud. {'\n'} 
      </Text>
      <Button
        title="Vault"
        onPress={() => navigation.navigate('Vault')}
      />
      <Text> </Text>
      <Button
        title="Upload to Vault"
        onPress={() => navigation.navigate('Upload Vault')}
      />
    </View>
  );
}

function Vault({ navigation }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { photos, nextPage, loading, error } = state;

  const fetchPhotos = useCallback(async () => {
    dispatch(actionCreators.loading());

    try {
      const nextPhotos = await getList(nextPage);
      dispatch(actionCreators.success(nextPhotos, nextPage));
    } catch (e) {
      dispatch(actionCreators.failure());
    }
  }, [nextPage]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  // We'll show an error only if the first page fails to load
  if (photos.length === 0) {
    if (loading) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(27, 47, 143, 0.8)', 'transparent']}
            style={styles.background}
          />
          <Text style={styles.title}>{'\n\n'}Loading Vault</Text>
          <ActivityIndicator animating={true} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(27, 47, 143, 0.8)', 'transparent']}
            style={styles.background}
          />
          <Text style={styles.title}>{'\n\n'}Vault Failed</Text>
          <Text>Failed to load photos!</Text>
        </View>
      );
    }
  }

  return (
    <PhotoGrid numColumns={3} photos={photos} onEndReached={fetchPhotos} />
  );
}

function UploadVault({ navigation }) {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(94, 105, 160, 0.8)' }}>
    <LinearGradient
            colors={['rgba(27, 47, 143, 0.8)', 'transparent']}
            style={styles.background}
          />
      <Button title="Upload image to Vault" onPress={pickImage} />
      <Text>{" "}</Text>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}

// Create nav component
const Stack = createStackNavigator();

// This will take care of all our navigation
// This of this as the navigation brain
// This of this as the traffic cop
// This as the Router
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main Page">
        <Stack.Screen name="Main Page" component={HomeScreen} />
        <Stack.Screen name="Vault" component={Vault} />
        <Stack.Screen name="Upload Vault" component={UploadVault} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Style Sheet for application
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(94, 105, 160, 0.8)',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  title: {
    alignSelf: 'center',
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
