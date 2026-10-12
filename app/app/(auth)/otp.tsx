import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function OTPScreen() {
    const router = useRouter();
    const { login } = useAuthStore();

    useEffect(() => {
        login("uid-legacy", "user@cattlesense.com", "Officer");
        router.replace('/(onboarding)/permissions');
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.text}>OTP Verification has been replaced with Email Login.</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.buttonText}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        color: '#1A2A3A',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#1B4332',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
