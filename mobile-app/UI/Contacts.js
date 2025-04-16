import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import 
{
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Animated, ActivityIndicator
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ContactsAPI from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Contacts = () => 
{
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [emergencyContacts, setEmergencyContacts] = useState([]);

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

    useEffect(() => {
    Animated.timing(fadeAnim, 
    {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
    }).start();

    const load = async () => 
    {
        const saved = await loadEmergencyContacts();
        await loadDeviceContacts(saved);
    };
    load();
    }, []);

    const handleLogout = async () => 
    {
    await AsyncStorage.removeItem('user');
    Alert.alert('Logged out', 'You have been successfully logged out.');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const navigateWithEffect = (screen) => 
    {
        setLoading(true);
        setTimeout(() => 
        {
            setLoading(false);
            navigation.navigate(screen);
        }, 500);
    };

    const loadEmergencyContacts = async () => 
    {
        try 
        {
            const json = await AsyncStorage.getItem('emergencyContacts');
            const parsed = json ? JSON.parse(json) : [];
            setEmergencyContacts(parsed);
            return parsed;
        } catch (err) 
        {
            console.error('Failed to load emergency contacts from storage:', err);
            return [];
        }
    };

    const saveEmergencyContacts = async (list) => 
    {
        try 
        {
            await AsyncStorage.setItem('emergencyContacts', JSON.stringify(list));
            setEmergencyContacts(list);
        } catch (err) 
        {
            console.error('Failed to save emergency contacts:', err);
        }
    };

    const loadDeviceContacts = async (savedEmergencyContacts) => 
    {
        try 
        {
            const { status } = await ContactsAPI.requestPermissionsAsync();
            if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Cannot access device contacts');
            return;
            }

            const { data } = await ContactsAPI.getContactsAsync(
            {
                fields: [ContactsAPI.Fields.PhoneNumbers],
                pageSize: 1000,
            });

            const deviceList = data
            .filter(c => c.phoneNumbers && c.phoneNumbers.length > 0)
            .map(c => ({
                id: c.id,
                name: c.name,
                phone: c.phoneNumbers[0].number,
            }));

            const merged = 
            [
                ...savedEmergencyContacts.map(ec => 
                ({
                    ...ec,
                    isEmergency: true,
                })),
                ...deviceList
                    .filter(dc => !savedEmergencyContacts.some(ec => ec.phone === dc.phone))
                    .map(dc => ({
                    ...dc,
                    isEmergency: false,
                    })),
            ];
            setContacts(merged);
        } catch (err) {
            console.error('Failed to load device contacts:', err);
        }
    };

    const toggleEmergency = (contact) => 
    {
        const isEmergency = emergencyContacts.some(ec => ec.phone === contact.phone);
        if (isEmergency) {
            Alert.alert(
            'Remove Contact',
            `Remove ${contact.name} from emergency contacts?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                text: 'Remove',
                style: 'destructive',
                onPress: () => removeEmergency(contact),
                },
            ]
            );
        } 
        else 
        {
            addEmergency(contact);
        }
    };

    const addEmergency = async (contact) =>
    {
        const updated = [...emergencyContacts, contact];
        await saveEmergencyContacts(updated);
        setContacts(prev =>
            prev.map(c => c.phone === contact.phone ? { ...c, isEmergency: true } : c)
        );
    };

    const removeEmergency = async (contact) => 
    {
        const updated = emergencyContacts.filter(c => c.phone !== contact.phone);
        await saveEmergencyContacts(updated);
        setContacts(prev =>
            prev.map(c => c.phone === contact.phone ? { ...c, isEmergency: false } : c)
        );
    };

    const filteredContacts = contacts
    .filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0));

    const renderContact = ({ item }) => 
    (
    <View style={styles.contactCard}>
        <View style={styles.leftSection}>
        <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name?.[0]}</Text>
        </View>
        <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
        </View>
        </View>
        <TouchableOpacity onPress={() => toggleEmergency(item)}>
        <Ionicons
            name={item.isEmergency ? 'checkmark-circle' : 'add-circle-outline'}
            size={24}
            color="#1976D2"
        />
        </TouchableOpacity>
    </View>
    );

return (
<Animated.View style={[styles.container, { opacity: fadeAnim }]}>
    {loading && (
    <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#1976D2" />
    </View>
    )}

    <View style={styles.searchBar}>
    <Ionicons name="search" size={20} color="#888" />
    <TextInput
        style={styles.searchInput}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
    />
    <TouchableOpacity onPress={() => setSearchQuery('')}>
        <Ionicons name="close-circle" size={18} color="#ccc" />
    </TouchableOpacity>
    </View>

    <FlatList
    data={filteredContacts}
    keyExtractor={(item, index) => `${item.phone}-${index}`}
    renderItem={renderContact}
    contentContainerStyle={{ paddingBottom: 100 }}
    />

    <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Home')}>
        <Ionicons name="home-outline" size={24} color="#718096" />
        <Text style={styles.navText}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Alerts')}>
        <Ionicons name="notifications-outline" size={24} color="#718096" />
        <Text style={styles.navText}>Alerts</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Analytics')}>
        <Ionicons name="stats-chart-outline" size={24} color="#718096" />
        <Text style={styles.navText}>Analytics</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItemActive}>
        <Ionicons name="people-outline" size={24} color="#1976D2" />
        <Text style={styles.navTextActive}>Contacts</Text>
    </TouchableOpacity>
    </View>
</Animated.View>
);
};

const styles = StyleSheet.create(
{
container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 16, paddingHorizontal: 16 },
overlay: 
{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
},
searchBar: 
{
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 16
},
searchInput: { flex: 1, marginHorizontal: 8 },
contactCard: 
{
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12,
    borderColor: '#e2e8f0', borderWidth: 1
},
leftSection: { flexDirection: 'row', alignItems: 'center' },
avatar: 
{
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1976D2', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
},
avatarText: { color: '#fff', fontWeight: 'bold' },
name: { fontSize: 15, fontWeight: '600', color: '#2d3748' },
phone: { fontSize: 13, color: '#718096' },
bottomNav: 
{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#fff', paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#e2e8f0'
},
navItem: { alignItems: 'center' },
navItemActive: { alignItems: 'center' },
navText: { fontSize: 12, color: '#718096', marginTop: 4 },
navTextActive: { fontSize: 12, color: '#1976D2', fontWeight: '600', marginTop: 4 },
});

export default Contacts;
