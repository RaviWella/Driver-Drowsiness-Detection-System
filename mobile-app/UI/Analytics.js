import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import 
{
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Alert, ActivityIndicator
} from 'react-native';
import 
{
  Ionicons, Feather, MaterialCommunityIcons
} from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnalyticsUI = () => 
{
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('week');
    const [chartType, setChartType] = useState('line');

    const handleLogout = async () => 
    {
        await AsyncStorage.removeItem('user');
        Alert.alert('Logged out', 'You have been successfully logged out.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const navigateWithEffect = (screen) => 
    {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate(screen);
        }, 500);
    };

    useLayoutEffect(() => 
    {
        navigation.setOptions(
        {
            headerRight: () => 
            (
                <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
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
    }, []);

    const chartData = 
    {
    week: 
    {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [3, 5, 2, 6, 4, 8, 1] }]
    },
    month: 
    {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: [{ data: [12, 18, 9, 15] }]
    },
    year: 
    {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ data: [45, 38, 52, 47, 62, 58] }]
    }
    };

    const chartConfig = 
    {
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        labelColor: () => '#4a5568',
        propsForDots: { r: '4', strokeWidth: '2', stroke: '#1976D2' }
    };

    const timeOfDayData = 
    [
        { name: 'Morning', count: 15, color: '#4CAF50', legendFontColor: '#718096' },
        { name: 'Afternoon', count: 35, color: '#FFC107', legendFontColor: '#718096' },
        { name: 'Evening', count: 25, color: '#FF9800', legendFontColor: '#718096' },
        { name: 'Night', count: 45, color: '#F44336', legendFontColor: '#718096' }
    ];

    const severityData = 
    [
        { name: 'Low', count: 60, color: '#4CAF50', legendFontColor: '#718096' },
        { name: 'Medium', count: 25, color: '#FFC107', legendFontColor: '#718096' },
        { name: 'High', count: 15, color: '#F44336', legendFontColor: '#718096' }
    ];

    const renderChart = () => 
    {
        const data = chartData[timeRange];
        const width = Dimensions.get('window').width - 40;
        const ChartComponent = chartType === 'line' ? LineChart : BarChart;

    return (
    <ChartComponent
        data={data}
        width={width}
        height={220}
        chartConfig={chartConfig}
        bezier={chartType === 'line'}
        style={{ borderRadius: 12 }}
    />
    );
    };

return (
<Animated.View style={[styles.container, { opacity: fadeAnim }]}>
{loading && (
    <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#1976D2" />
    </View>
)}

<ScrollView contentContainerStyle={styles.content}>
    <View style={styles.switcher}>
    {['week', 'month', 'year'].map(range => 
    (
        <TouchableOpacity
        key={range}
        style={[styles.rangeButton, timeRange === range && styles.activeRange]}
        onPress={() => setTimeRange(range)}
        >
        <Text style={[styles.rangeText, timeRange === range && styles.activeText]}>
            {range.charAt(0).toUpperCase() + range.slice(1)}
        </Text>
        </TouchableOpacity>
    ))}
    </View>

    <View style={styles.chartTypeSelector}>
    <TouchableOpacity onPress={() => setChartType('line')} style={styles.chartType}>
        <MaterialCommunityIcons name="chart-line" size={20} color={chartType === 'line' ? '#1976D2' : '#718096'} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setChartType('bar')} style={styles.chartType}>
        <MaterialCommunityIcons name="chart-bar" size={20} color={chartType === 'bar' ? '#1976D2' : '#718096'} />
    </TouchableOpacity>
    </View>

    <View style={styles.card}>{renderChart()}</View>

    <View style={styles.cardRow}>
    {[timeOfDayData, severityData].map((data, idx) => 
    (
        <View key={idx} style={styles.cardHalf}>
        <PieChart
            data={data}
            width={Dimensions.get('window').width / 2 - 30}
            height={150}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
        />
        </View>
    ))}
    </View>

    <View style={styles.card}>
    <Text style={styles.insightTitle}>Insights</Text>
    <Text style={styles.insight}>⏰ Most alerts occur between 10PM - 2AM</Text>
    <Text style={styles.insight}>📈 Wednesdays have 25% more alerts</Text>
    <Text style={styles.insight}>⏱️ Response time improved 12%</Text>
    </View>
</ScrollView>

{/* Bottom Navigation */}
<View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Home')}>
    <Ionicons name="home-outline" size={24} color="#718096" />
    <Text style={styles.navText}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => navigateWithEffect('Alerts')}>
    <Ionicons name="notifications-outline" size={24} color="#718096" />
    <Text style={styles.navText}>Alerts</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItemActive}>
    <Ionicons name="stats-chart" size={24} color="#1976D2" />
    <Text style={styles.navTextActive}>Analytics</Text>
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
container: { flex: 1, backgroundColor: '#f8f9fa' },
overlay: 
{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
},
content: { padding: 16, paddingBottom: 120 },
switcher: 
{
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 4,
},
rangeButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
rangeText: { fontSize: 14, color: '#718096' },
activeRange: { backgroundColor: '#1976D2' },
activeText: { color: '#fff', fontWeight: '600' },
chartTypeSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
chartType: { padding: 10, marginHorizontal: 5, backgroundColor: '#fff', borderRadius: 8 },
card: 
{
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, elevation: 2, marginBottom: 16
},
cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
cardHalf: 
{
    width: '48%', backgroundColor: '#fff', padding: 8,
    borderRadius: 16, elevation: 2
},
insightTitle: { fontSize: 16, fontWeight: '600', color: '#2d3748', marginBottom: 12 },
insight: { fontSize: 13, color: '#4a5568', marginBottom: 6 },
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

export default AnalyticsUI;
