import React, { useState } from 'react';
import { StyleSheet, View, Text, Button, Image, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OnboardingFieldConditions() {
    const router = useRouter();
    const [debugPressed, setDebugPressed] = useState(false);

    const handleFinish = () => {
        console.log('Field guide Get Started pressed');
        router.push('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <SafeAreaView style={styles.safeArea}>

                {/* Illustration Area */}
                <View style={styles.imageSection}>
                    {/* Using a placeholder for the Field Illustration - Needs to be replaced with local asset or similar URL */}
                    <Image
                        source={require('../../assets/images/field_guide_illustration.jpg')}
                        style={styles.fieldImage}
                    />
                </View>

                {/* Content Area */}
                <View style={styles.textSection}>
                    <Text style={styles.title}>Works in Real Field Conditions</Text>

                    <Text style={styles.description}>
                        Designed for outdoor usage with high contrast display. Works offline and syncs when connected.
                    </Text>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        <View style={styles.inactiveDot} />
                        <View style={styles.activeDot} />
                    </View>

                    {/* Button */}
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Get Started"
                            onPress={() => {
                                console.log('Field guide Get Started pressed');
                                setDebugPressed(true);
                                handleFinish();
                            }}
                            color="#1B4332"
                        />
                    </View>

                    {debugPressed && <Text style={styles.debugText}>✓ Button press detected!</Text>}

                    {/* Skip Link */}
                    <View style={styles.skipButtonWrapper}>
                        <Button 
                            title="Skip" 
                            onPress={handleFinish} 
                            color="#0F3D2E"
                        />
                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    imageSection: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    fieldImage: {
        width: width * 0.8,
        height: width * 0.8,
        resizeMode: 'contain',
    },
    textSection: {
        flex: 0.5,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#0F3D2E', // Dark Green
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 34,
    },
    description: {
        fontSize: 16,
        color: '#556960',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    activeDot: {
        width: 32,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1B4332', // Active Dark Green
        marginLeft: 6,
    },
    inactiveDot: {
        width: 32,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E0E0E0', // Inactive Grey
    },
    button: {
        backgroundColor: '#1B4332',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#1B4332',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: '#0F3D2E',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonWrapper: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    skipButtonWrapper: {
        padding: 10,
    },
    debugText: {
        color: '#1B4332',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
});
