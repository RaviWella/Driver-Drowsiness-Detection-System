import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AlertsUI = () => 
{
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => 
    {
        navigation.setOptions(
        {
            headerRight: () => 
            (
                <TouchableOpacity onPress={handleLogout} style={{ margin: 16 }}>
                    <Feather name="log-out" size={24} color="#2d3748" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => 
    {
        Animated.timing(fadeAnim, 
        {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleLogout = async () => 
    {
        await AsyncStorage.removeItem('user');
        Alert.alert('Logged out', 'You have been successfully logged out.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const navigateWithEffect = (targetScreen) => 
    {
        setLoading(true);
        setTimeout(() => 
        {
            setLoading(false);
            navigation.navigate(targetScreen);
        }, 500);
    };

    const alertHistory = 
    [
        { id: '1', time: '10:30 AM', date: '2023-06-15', type: 'Drowsiness Detected', severity: 'high' },
        { id: '2', time: '09:15 AM', date: '2023-06-15', type: 'Text sent to Sofia', severity: 'medium' },
        { id: '3', time: '08:00 AM', date: '2023-06-15', type: 'System Check', severity: 'low' },
    ];

    const renderItem = ({ item }) => 
    (
        <View style={styles.alertItem}>
            <View style={[
            styles.icon,
            item.severity === 'high' ? styles.highAlert :
            item.severity === 'medium' ? styles.mediumAlert : styles.lowAlert
            ]}>
            <MaterialIcons name="warning" size={20}
                color={
                item.severity === 'high' ? '#F44336' :
                item.severity === 'medium' ? '#FFC107' : '#4CAF50'
                }
            />
            </View>
            <View style={styles.alertDetails}>
            <Text style={styles.alertType}>{item.type}</Text>
            <Text style={styles.alertTime}>{item.date} at {item.time}</Text>
            </View>
        </View>
    );

    return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {loading && (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#1976D2" />
        </View>
        )}

        <FlatList
        data={alertHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Home')}>
            <Ionicons name="home-outline" size={24} color="#718096" />
            <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
            <Ionicons name="notifications" size={24} color="#1976D2" />
            <Text style={styles.navTextActive}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Analytics')}>
            <Ionicons name="stats-chart" size={24} color="#718096" />
            <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Contacts')}>
            <Ionicons name="people-outline" size={24} color="#718096" />
            <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>
        </View>
    </Animated.View>
    );
};

const styles = StyleSheet.create(
{
container: 
{
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: 16,
},
overlay: 
{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
},
list: 
{
    paddingBottom: 100,
},
alertItem: 
{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
},
icon: 
{
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
},
highAlert: 
{
    backgroundColor: '#FFEBEE',
},
mediumAlert: 
{
    backgroundColor: '#FFF8E1',
},
lowAlert: 
{
    backgroundColor: '#E8F5E9',
},
alertDetails: 
{
    flex: 1,
},
alertType: 
{
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
},
alertTime: 
{
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
},
bottomNav: 
{
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
},
navItem: { alignItems: 'center' },
navItemActive: { alignItems: 'center' },
navText: { fontSize: 12, color: '#718096', marginTop: 4 },
navTextActive: { fontSize: 12, color: '#1976D2', fontWeight: '600', marginTop: 4 },
});

export default AlertsUI;
