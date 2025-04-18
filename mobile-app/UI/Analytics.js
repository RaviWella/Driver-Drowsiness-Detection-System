import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnalyticsUI = () => {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('week');
    const [chartType, setChartType] = useState('line');

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const navigateWithEffect = (screen) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate(screen);
        }, 500);
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
                    <Ionicons name="log-out-outline" size={24} color="#2d3748" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const chartData = {
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ data: [3, 5, 2, 6, 4, 8, 1] }]
        },
        month: {
            labels: ['W1', 'W2', 'W3', 'W4'],
            datasets: [{ data: [12, 18, 9, 15] }]
        },
        year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ data: [45, 38, 52, 47, 62, 58] }]
        }
    };

    const chartConfig = {
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        labelColor: () => '#4a5568',
        propsForDots: { r: '4', strokeWidth: '2', stroke: '#1976D2' }
    };

    const renderChart = () => {
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
                    {['week', 'month', 'year'].map(range => (
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
                        <MaterialCommunityIcons
                            name="chart-line"
                            size={20}
                            color={chartType === 'line' ? '#1976D2' : '#718096'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setChartType('bar')} style={styles.chartType}>
                        <MaterialCommunityIcons
                            name="chart-bar"
                            size={20}
                            color={chartType === 'bar' ? '#1976D2' : '#718096'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>{renderChart()}</View>
            </ScrollView>

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    content: { padding: 16, paddingBottom: 120 },
    switcher: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
    },
    rangeButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
    rangeText: { fontSize: 14, color: '#718096' },
    activeRange: { backgroundColor: '#1976D2' },
    activeText: { color: '#fff', fontWeight: '600' },
    chartTypeSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
    chartType: { padding: 10, marginHorizontal: 5, backgroundColor: '#fff', borderRadius: 8 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0'
    },
    navItem: { alignItems: 'center' },
    navItemActive: { alignItems: 'center' },
    navText: { fontSize: 12, color: '#718096', marginTop: 4 },
    navTextActive: { fontSize: 12, color: '#1976D2', fontWeight: '600', marginTop: 4 },
});

export default AnalyticsUI;
