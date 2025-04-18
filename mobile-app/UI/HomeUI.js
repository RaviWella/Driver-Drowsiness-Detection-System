import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';


const HomeUI = () => 
{
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('User');
    const [greeting, setGreeting] = useState('');

    const handleLogout = async () => 
    {
        await AsyncStorage.removeItem('user');
        Alert.alert('Logged out', 'You have been successfully logged out.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const fetchUserName = async () => 
    {
        try {
        const name = await AsyncStorage.getItem('fullname');
        setUserName(name || 'User');
        } catch (err) {
        console.error('Failed to fetch user name:', err);
        }
    };

    const determineGreeting = () => 
    {
        const hour = new Date().getHours();
        if (hour < 12) {
        setGreeting('Good Morning');
        } else if (hour < 18) {
        setGreeting('Good Afternoon');
        } else {
        setGreeting('Good Evening');
        }
    };

    const [isConnected, setIsConnected] = useState(null);

    useEffect(() => 
    {
        fetchUserName();
        determineGreeting();
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
    
        return () => unsubscribe();
    }, []);

    const navigateWithEffect = (targetScreen) => 
    {
        setLoading(true);
        setTimeout(() => {
        setLoading(false);
        navigation.navigate(targetScreen);
        }, 500);
    };

    useLayoutEffect(() => 
    {
        navigation.setOptions(
        {
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
                <Feather name="log-out" size={24} color="#2d3748" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);


    const stats = 
    [
        { icon: 'hardware-chip-outline', value: '3/4', label: 'Devices Online' },
        { icon: 'alert-circle', value: '3', label: 'Today\'s Alerts' },
        { icon: 'analytics', value: '87%', label: 'Accuracy' },
    ];

    const devices = 
    [
        { name: 'IR Camera', status: 'Connected', icon: 'camera-outline', connected: true },
        { name: 'Buzzer', status: 'Connected', icon: 'bell-outline', connected: true },
        { name: 'Detection Engine', status: 'Connected', icon: 'chip', connected: true },
        {
          name: 'Cloud Sync',
          status: isConnected === null ? 'Checking...' : isConnected ? 'Connected' : 'Not Connected',
          icon: isConnected ? 'cloud-outline' : 'cloud-off-outline',
          connected: isConnected
        },
      ];
      

    const alerts = 
    [
        { title: 'Drowsiness Detected', time: '10:30 AM', severity: 'high' },
        { title: 'Text sent to Sofia', time: '09:15 AM', severity: 'medium' },
        { title: 'System Check', time: '08:00 AM', severity: 'low' },
    ];

return ( 
    <View style={styles.container}>
    {loading && (
        <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#1976D2" />
        </View>
    )}

    <ScrollView contentContainerStyle={styles.content}>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
        <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>System Active</Text>
        </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsContainer}>
            {stats.map((stat, index) => 
            (
                <View key={index} style={styles.statCard}>
                    <Ionicons name={stat.icon} size={20} color="#1976D2" />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
            ))}
        </View>
        </View>

        {/* Devices Section */}
        <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Device Status</Text>
            <TouchableOpacity>
            <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.devicesContainer}>
            {devices.map((device, index) => 
            (
                <TouchableOpacity key={index} style={styles.deviceCard}>
                    <MaterialCommunityIcons
                    name={device.icon}
                    size={24}
                    color={device.connected ? '#1976D2' : '#718096'}
                    />
                    <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceStatus}>
                        {device.connected ? 'Connected' : 'Offline'}
                    </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#718096" />
                </TouchableOpacity>
            ))}
        </View>
        </View>

        {/* Alerts Section */}
        <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <TouchableOpacity onPress={() => navigateWithEffect('Alerts')}>
            <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.alertsContainer}>
            {alerts.map((alert, index) => (
            <TouchableOpacity key={index} style={styles.alertCard}>
                <View style={[
                styles.alertIcon,
                alert.severity === 'high' ? styles.highAlert : 
                alert.severity === 'medium' ? styles.mediumAlert : styles.lowAlert
                ]}>
                <MaterialCommunityIcons
                    name="alert-circle"
                    size={18}
                    color={
                    alert.severity === 'high' ? '#F44336' : 
                    alert.severity === 'medium' ? '#FFC107' : '#4CAF50'
                    }
                />
                </View>
                <View style={styles.alertDetails}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#718096" />
            </TouchableOpacity>
            ))}
        </View>
        </View>
    </ScrollView>

    {/* Bottom Navigation */}
    <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
        <Ionicons name="home" size={24} color="#1976D2" />
        <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigateWithEffect('Alerts')}
        >
        <Ionicons name="notifications-outline" size={24} color="#718096" />
        <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigateWithEffect('Analytics')}
        >
        <Ionicons name="stats-chart" size={24} color="#718096" />
        <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigateWithEffect('Contacts')}
        >
        <Ionicons name="people-outline" size={24} color="#718096" />
        <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>
    </View>
    </View>
    );
};

const styles = StyleSheet.create(
{
container: 
{
    flex: 1,
    backgroundColor: '#f8f9fa',
},
overlay: 
{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
},
content: 
{
    padding: 16,
    paddingBottom: 80,
},
welcomeContainer: 
{
    backgroundColor: '#1976D2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
greeting: 
{
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 4,
},
userName: 
{
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
},
statusBadge: 
{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
},
statusDot: 
{
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#4CAF50',
},
statusText: 
{
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
},
section: 
{
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
},
sectionTitle: 
{
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
},
sectionHeader: 
{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
},
seeAllText: 
{
    color: '#1976D2',
    fontWeight: '500',
    fontSize: 14,
},
statsContainer: 
{
    flexDirection: 'row',
    justifyContent: 'space-between',
},
statCard: 
{
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderRadius: 8,
    padding: 12,
},
statValue: 
{
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
    marginVertical: 8,
},
statLabel: 
{
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
},
devicesContainer: 
{
    borderRadius: 8,
    overflow: 'hidden',
},
deviceCard: 
{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
},
deviceInfo: 
{
    flex: 1,
    marginLeft: 16,
},
deviceName:
{
    fontSize: 15,
    fontWeight: '500',
    color: '#2d3748',
},
deviceStatus: 
{
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
},
alertsContainer: 
{
    borderRadius: 8,
    overflow: 'hidden',
},
alertCard: 
{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
},
alertIcon: 
{
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: 16,
},
alertTitle: 
{
    fontSize: 15,
    fontWeight: '500',
    color: '#2d3748',
},
alertTime: 
{
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
},
bottomNav: 
{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
},
navItem: 
{
    alignItems: 'center',
},
navItemActive: 
{
    alignItems: 'center',
},
navText: 
{
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
},
navTextActive: 
{
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    marginTop: 4,
},
});

export default HomeUI;