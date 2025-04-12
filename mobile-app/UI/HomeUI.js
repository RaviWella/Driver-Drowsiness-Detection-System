import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HomeUI = () => {
  const navigation = useNavigation();

  // Sample device data
  const devices = [
    { name: 'IR Camera', status: 'Connected' },
    { name: 'Buzzer', status: 'Connected' },
    { name: 'Detection Engine', status: 'Connected' },
    { name: 'Cloud Sync', status: 'Not Connected' },
  ];

  // Sample alert history
  const alertHistory = [
    { id: 1, time: '10:30 AM', date: '2023-06-15', type: 'Drowsiness Detected' },
    { id: 2, time: '02:15 PM', date: '2023-06-14', type: 'System Alert' },
    { id: 3, time: '08:45 AM', date: '2023-06-14', type: 'Drowsiness Detected' },
  ];

  // Sample drowsy patterns
  const drowsyPatterns = [
    { day: 'Monday', count: 3 },
    { day: 'Tuesday', count: 1 },
    { day: 'Wednesday', count: 2 },
    { day: 'Thursday', count: 4 },
    { day: 'Friday', count: 2 },
    { day: 'Saturday', count: 0 },
    { day: 'Sunday', count: 1 },
  ];

  const handleLogout = () => {
    // Navigate back to login screen
    navigation.navigate('Login');
  };

  const handleConnect = (deviceName) => {
    // Handle connect button action
    alert(`Connecting to ${deviceName}...`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DrowsyGuard Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={20} color="#1976D2" />
            <Text style={styles.sectionTitle}>System Status</Text>
          </View>
          <View style={styles.statusOverview}>
            <View style={styles.statusCard}>
              <Text style={styles.statusCardValue}>3</Text>
              <Text style={styles.statusCardLabel}>Active Devices</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusCardValue}>2</Text>
              <Text style={styles.statusCardLabel}>Today's Alerts</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusCardValue}>87%</Text>
              <Text style={styles.statusCardLabel}>Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Device Status Table */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="devices" size={20} color="#1976D2" />
            <Text style={styles.sectionTitle}>Device Status</Text>
          </View>
          <View style={styles.table}>
            {devices.map((device, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{device.name}</Text>
                <View style={styles.tableCellContainer}>
                  <Text 
                    style={[
                      styles.tableCell, 
                      styles.statusCell,
                      device.status === 'Connected' ? styles.connected : styles.notConnected
                    ]}
                  >
                    {device.status}
                  </Text>
                  {device.status === 'Not Connected' && (
                    <TouchableOpacity 
                      style={styles.connectButton} 
                      onPress={() => handleConnect(device.name)}
                    >
                      <Text style={styles.connectButtonText}>Connect</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Alert History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={20} color="#1976D2" />
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.alertList}>
            {alertHistory.slice(0, 3).map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.alertIcon}>
                  <MaterialIcons name="warning" size={18} color="#e53e3e" />
                </View>
                <View style={styles.alertDetails}>
                  <Text style={styles.alertType}>{alert.type}</Text>
                  <Text style={styles.alertTime}>{alert.date} at {alert.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Drowsy Patterns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="activity" size={20} color="#1976D2" />
            <Text style={styles.sectionTitle}>Weekly Drowsy Patterns</Text>
          </View>
          <View style={styles.patternContainer}>
            {drowsyPatterns.map((pattern, index) => (
              <View key={index} style={styles.patternDay}>
                <Text style={styles.patternDayLabel}>{pattern.day.substring(0, 3)}</Text>
                <View style={styles.patternBarContainer}>
                  <View 
                    style={[
                      styles.patternBar, 
                      { height: `${pattern.count * 15}%`, backgroundColor: pattern.count > 2 ? '#e53e3e' : '#f6ad55' }
                    ]} 
                  />
                </View>
                <Text style={styles.patternCount}>{pattern.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="home" size={24} color="#1976D2" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Alerts')}>
          <MaterialIcons name="notifications" size={24} color="#1976D2" />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="dashboard" size={24} color="#a0aec0" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Contacts')}>
          <MaterialIcons name="contacts" size={24} color="#1976D2" />
          <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginTop: 20, // Set marginTop to 0 to remove the white space at the top
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#1976D2', // Updated blue color
    fontWeight: '500',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginLeft: 8,
  },
  seeAllButton: {
    marginLeft: 'auto',
  },
  seeAllText: {
    color: '#1976D2', // Updated blue color
    fontSize: 14,
  },
  statusOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: '#ebf8ff',
    borderRadius: 8,
    padding: 12,
    width: '30%',
    alignItems: 'center',
  },
  statusCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: 4,
  },
  statusCardLabel: {
    fontSize: 12,
    color: '#4a5568',
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 14,
    color: '#4a5568',
  },
  tableCellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCell: {
    fontWeight: '600',
  },
  connected: {
    color: '#38a169',
  },
  notConnected: {
    color: '#e53e3e',
  },
  connectButton: {
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#1976D2', // Updated blue color
    borderRadius: 4,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  alertList: {
    marginTop: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertDetails: {
    flex: 1,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#718096',
  },
  patternContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    height: 150,
    alignItems: 'flex-end',
  },
  patternDay: {
    alignItems: 'center',
    width: '12%',
  },
  patternDayLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  patternBarContainer: {
    height: '80%',
    justifyContent: 'flex-end',
    width: '100%',
  },
  patternBar: {
    width: '100%',
    borderRadius: 4,
  },
  patternCount: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 4,
  },
});

export default HomeUI;
