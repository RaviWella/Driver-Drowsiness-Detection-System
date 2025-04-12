// UI/Alerts.js

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AlertsUI = () => {
  const alertHistory = [
    { id: '1', time: '10:30 AM', date: '2023-06-15', type: 'Drowsiness Detected' },
    { id: '2', time: '02:15 PM', date: '2023-06-14', type: 'System Alert' },
    { id: '3', time: '08:45 AM', date: '2023-06-14', type: 'Drowsiness Detected' },
    { id: '4', time: '01:20 PM', date: '2023-06-13', type: 'Driver Unresponsive' },
    { id: '5', time: '06:50 AM', date: '2023-06-13', type: 'System Check Passed' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.alertItem}>
      <View style={styles.icon}>
        <MaterialIcons name="warning" size={20} color="#e53e3e" />
      </View>
      <View style={styles.alertDetails}>
        <Text style={styles.alertType}>{item.type}</Text>
        <Text style={styles.alertTime}>{item.date} at {item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alerts History</Text>
      <FlatList
        data={alertHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d3748',
  },
  list: {
    paddingBottom: 100,
  },
  alertItem: {
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
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertDetails: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
  alertTime: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
});

export default AlertsUI;
