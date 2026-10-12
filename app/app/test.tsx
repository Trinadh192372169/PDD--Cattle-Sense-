import React, { useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function TestPage() {
    const router = useRouter();
    const [clicks, setClicks] = useState(0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Test Button Clicks</Text>
            <Text style={styles.subtitle}>Clicks: {clicks}</Text>

            <View style={styles.buttonContainer}>
                <Button
                    title="Increment Click Count"
                    onPress={() => {
                        console.log('Button clicked!');
                        setClicks(clicks + 1);
                    }}
                    color="#1B4332"
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Try to Navigate to Onboarding"
                    onPress={() => {
                        console.log('Trying to navigate to onboarding');
                        router.push('/(onboarding)' as any);
                    }}
                    color="#FF8008"
                />
            </View>

            <Text style={styles.debugText}>If you see this page, the app is running!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#0F3D2E',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 40,
        color: '#556960',
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    debugText: {
        marginTop: 40,
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
});
