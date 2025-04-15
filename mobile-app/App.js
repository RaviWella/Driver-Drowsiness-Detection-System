import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginUI from './UI/LoginUI';
import HomeUI from './UI/HomeUI';
import AlertsUI from './UI/Alerts';
import AnalyticsUI from './UI/Analytics';
import Contacts from './UI/Contacts';

const Stack = createStackNavigator();

const App = () => {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => 
    {
        const checkUser = async () => 
        {
            try 
            {
                const user = await AsyncStorage.getItem('user');
                if (user) 
                {
                    setInitialRoute('Home');
                } 
                else 
                {
                    setInitialRoute('Login');
                }
            }
            catch (err) 
            {
                console.error('Error checking login state:', err);
                setInitialRoute('Login'); // fallback
            }
        };

        checkUser();
    }, []);

    if (!initialRoute) 
    {
        // checking, show splash/loading
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
        </View>
        );
    }

  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen 
            name="Login" 
            component={LoginUI} 
            options={{ headerShown: false }} 
            />
            <Stack.Screen 
            name="Home" 
            component={HomeUI} 
            options={{ headerShown: true }} 
            />
            <Stack.Screen 
            name="Alerts" 
            component={AlertsUI} 
            options={{ headerShown: true }} 
            />
            <Stack.Screen 
            name="Analytics" 
            component={AnalyticsUI} 
            options={{ headerShown: true }}
            />
            <Stack.Screen 
            name="Contacts" 
            component={Contacts} 
            options={{ headerShown: true }} 
        />
        </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create(
{
  loadingContainer: 
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});

export default App;
