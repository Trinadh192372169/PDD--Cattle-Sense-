import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, StatusBar,
    ActivityIndicator, ScrollView, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
    firebaseLogin,
    firebaseRegister,
    firebaseResetPassword,
    firebaseGoogleLogin
} from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { AgriColors } from '@/constants/theme';

export default function LoginScreen() {
    const router = useRouter();
    const { login, setOfficerRole } = useAuthStore();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedRole, setSelectedRole] = useState<'Field Officer' | 'Veterinarian'>('Field Officer');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

    // Forgot Password Modal State
    const [forgotModalVisible, setForgotModalVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    // Compute password strength
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { score: 0, label: '', color: '#CBD5E1' };
        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
        if (score === 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
        if (score === 3) return { score: 3, label: 'Good', color: '#10B981' };
        return { score: 4, label: 'Strong', color: '#059669' };
    };

    const pwdStrength = getPasswordStrength(password);

    const handleAuth = async () => {
        setStatusMessage(null);

        if (!email.trim() || !password.trim()) {
            setStatusMessage({ type: 'error', text: 'Please enter both email and password.' });
            return;
        }
        if (!email.includes('@')) {
            setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }
        if (password.length < 6) {
            setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);
        try {
            let response;
            if (isRegistering) {
                response = await firebaseRegister(
                    email.trim(),
                    password,
                    fullName.trim() || 'Cattle Officer'
                );
            } else {
                response = await firebaseLogin(email.trim(), password);
            }

            if (response.success && response.user) {
                login(
                    response.user.uid,
                    response.user.email ?? email.trim(),
                    (response.user.displayName ?? fullName) || 'Cattle Officer'
                );
                if (isRegistering) {
                    setOfficerRole(selectedRole);
                }
                router.replace('/(tabs)/home');
            } else {
                setStatusMessage({ type: 'error', text: response.message || 'Authentication failed.' });
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            setStatusMessage({ type: 'error', text: 'Connection error. Please check your network.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setStatusMessage(null);
        setGoogleLoading(true);
        try {
            const res = await firebaseGoogleLogin();
            if (res.success && res.user) {
                login(
                    res.user.uid,
                    res.user.email || 'user@google.com',
                    res.user.displayName || 'Google User'
                );
                router.replace('/(tabs)/home');
            } else {
                setStatusMessage({
                    type: 'info',
                    text: res.message || 'Google sign-in could not be completed.'
                });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err?.message || 'Google sign-in error.' });
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleDemoLogin = () => {
        login(
            'demo-officer-999',
            'demo.officer@cattlesense.gov.in',
            'Dr. Rajesh Kumar (Senior Field Officer)'
        );
        setOfficerRole('Field Officer');
        router.replace('/(tabs)/home');
    };

    const handleForgotPassword = async () => {
        if (!resetEmail.trim() || !resetEmail.includes('@')) {
            setResetMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }
        setResetLoading(true);
        setResetMessage(null);
        try {
            const res = await firebaseResetPassword(resetEmail.trim());
            if (res.success) {
                setResetMessage({ type: 'success', text: res.message });
            } else {
                setResetMessage({ type: 'error', text: res.message });
            }
        } catch (e: any) {
            setResetMessage({ type: 'error', text: 'Could not send reset link. Try again.' });
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#F4FAF5" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.cardContainer}>
                        {/* Header Logo */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBox}>
                                <MaterialCommunityIcons name="cow" size={42} color="#FFF" />
                            </View>
                            <Text style={styles.headline}>CattleSense</Text>
                            <Text style={styles.subHeadline}>
                                AI-Powered Cattle Breed Identification Platform
                            </Text>
                        </View>

                        {/* Mode Toggle */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, !isRegistering && styles.activeTab]}
                                onPress={() => { setIsRegistering(false); setStatusMessage(null); }}
                            >
                                <Text style={[styles.tabText, !isRegistering && styles.activeTabText]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, isRegistering && styles.activeTab]}
                                onPress={() => { setIsRegistering(true); setStatusMessage(null); }}
                            >
                                <Text style={[styles.tabText, isRegistering && styles.activeTabText]}>
                                    Register
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Status / Alert Banner */}
                        {!!statusMessage && (
                            <View style={[
                                styles.alertContainer,
                                statusMessage.type === 'error' && styles.alertError,
                                statusMessage.type === 'success' && styles.alertSuccess,
                                statusMessage.type === 'info' && styles.alertInfo,
                            ]}>
                                <Ionicons
                                    name={
                                        statusMessage.type === 'error'
                                            ? 'alert-circle'
                                            : statusMessage.type === 'success'
                                                ? 'checkmark-circle'
                                                : 'information-circle'
                                    }
                                    size={20}
                                    color={
                                        statusMessage.type === 'error'
                                            ? '#DC2626'
                                            : statusMessage.type === 'success'
                                                ? '#16A34A'
                                                : '#0284C7'
                                    }
                                />
                                <Text style={[
                                    styles.alertText,
                                    statusMessage.type === 'error' && { color: '#991B1B' },
                                    statusMessage.type === 'success' && { color: '#166534' },
                                    statusMessage.type === 'info' && { color: '#075985' },
                                ]}>
                                    {statusMessage.text}
                                </Text>
                            </View>
                        )}

                        {/* Form Section */}
                        <View style={styles.formSection}>
                            {isRegistering && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Full Name</Text>
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="person-outline" size={19} color="#64748B" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g. Dr. Rajesh Kumar"
                                                placeholderTextColor="#94A3B8"
                                                value={fullName}
                                                onChangeText={setFullName}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Role Designation</Text>
                                        <View style={styles.roleRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.rolePill,
                                                    selectedRole === 'Field Officer' && styles.rolePillActive
                                                ]}
                                                onPress={() => setSelectedRole('Field Officer')}
                                            >
                                                <MaterialCommunityIcons
                                                    name="clipboard-account"
                                                    size={16}
                                                    color={selectedRole === 'Field Officer' ? '#FFF' : '#176B45'}
                                                />
                                                <Text style={[
                                                    styles.rolePillText,
                                                    selectedRole === 'Field Officer' && styles.rolePillTextActive
                                                ]}>Field Officer</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.rolePill,
                                                    selectedRole === 'Veterinarian' && styles.rolePillActive
                                                ]}
                                                onPress={() => setSelectedRole('Veterinarian')}
                                            >
                                                <MaterialCommunityIcons
                                                    name="medical-bag"
                                                    size={16}
                                                    color={selectedRole === 'Veterinarian' ? '#FFF' : '#176B45'}
                                                />
                                                <Text style={[
                                                    styles.rolePillText,
                                                    selectedRole === 'Veterinarian' && styles.rolePillTextActive
                                                ]}>Veterinarian</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={19} color="#64748B" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="officer@cattlesense.gov.in"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.passwordLabelRow}>
                                    <Text style={styles.label}>Password</Text>
                                    {!isRegistering && (
                                        <TouchableOpacity onPress={() => {
                                            setResetEmail(email);
                                            setResetMessage(null);
                                            setForgotModalVisible(true);
                                        }}>
                                            <Text style={styles.forgotText}>Forgot Password?</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={19} color="#64748B" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#94A3B8"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color="#64748B"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Password Strength Guidance on Register */}
                                {isRegistering && password.length > 0 && (
                                    <View style={styles.strengthBox}>
                                        <View style={styles.strengthBar}>
                                            <View
                                                style={[
                                                    styles.strengthFill,
                                                    {
                                                        width: `${(pwdStrength.score / 4) * 100}%`,
                                                        backgroundColor: pwdStrength.color
                                                    }
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.strengthText, { color: pwdStrength.color }]}>
                                            Strength: {pwdStrength.label} {pwdStrength.score < 3 && '(use letters, numbers & symbols)'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleAuth}
                                disabled={loading || googleLoading}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        {isRegistering ? 'Create Officer Account' : 'Sign In to Portal'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Google Sign-In */}
                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGoogleSignIn}
                                disabled={googleLoading || loading}
                                activeOpacity={0.85}
                            >
                                {googleLoading ? (
                                    <ActivityIndicator color="#1E293B" />
                                ) : (
                                    <>
                                        <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
                                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Quick Evaluation / Examiner Login */}
                            <TouchableOpacity
                                style={styles.demoButton}
                                onPress={handleDemoLogin}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="flash-outline" size={17} color="#176B45" style={{ marginRight: 8 }} />
                                <Text style={styles.demoButtonText}>Quick Examiner / Demo Login</Text>
                            </TouchableOpacity>

                            {/* Security Badge */}
                            <View style={styles.securityBadge}>
                                <Ionicons name="shield-checkmark" size={14} color="#176B45" />
                                <Text style={styles.securityBadgeText}>
                                    Protected by Firebase Authentication & 256-bit AES
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Forgot Password Modal */}
                <Modal
                    visible={forgotModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setForgotModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={styles.modalIconBox}>
                                    <Ionicons name="key-outline" size={24} color="#176B45" />
                                </View>
                                <Text style={styles.modalTitle}>Reset Password</Text>
                                <Text style={styles.modalSub}>
                                    Enter your registered email address to receive password reset instructions.
                                </Text>
                            </View>

                            {!!resetMessage && (
                                <View style={[
                                    styles.alertContainer,
                                    resetMessage.type === 'error' ? styles.alertError : styles.alertSuccess,
                                    { marginBottom: 16 }
                                ]}>
                                    <Ionicons
                                        name={resetMessage.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
                                        size={18}
                                        color={resetMessage.type === 'error' ? '#DC2626' : '#16A34A'}
                                    />
                                    <Text style={[
                                        styles.alertText,
                                        { color: resetMessage.type === 'error' ? '#991B1B' : '#166534' }
                                    ]}>
                                        {resetMessage.text}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={19} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#94A3B8"
                                    value={resetEmail}
                                    onChangeText={setResetEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalCancelBtn}
                                    onPress={() => setForgotModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalSubmitBtn}
                                    onPress={handleForgotPassword}
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? (
                                        <ActivityIndicator color="#FFF" size="small" />
                                    ) : (
                                        <Text style={styles.modalSubmitText}>Send Reset Link</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AgriColors.background,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#176B45',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoBox: {
        width: 72,
        height: 72,
        backgroundColor: AgriColors.primary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: AgriColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 12,
    },
    headline: {
        fontSize: 26,
        fontWeight: 'bold',
        color: AgriColors.heading,
        letterSpacing: -0.5,
    },
    subHeadline: {
        fontSize: 13,
        color: AgriColors.textMuted,
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 18,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 9,
    },
    activeTab: {
        backgroundColor: AgriColors.primary,
        shadowColor: AgriColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    alertContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        gap: 8,
    },
    alertError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    alertSuccess: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    alertInfo: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    alertText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },
    formSection: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 6,
    },
    passwordLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    forgotText: {
        fontSize: 12,
        color: AgriColors.primary,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
    },
    eyeIcon: {
        padding: 6,
    },
    roleRow: {
        flexDirection: 'row',
        gap: 10,
    },
    rolePill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F8FAFC',
        gap: 6,
    },
    rolePillActive: {
        backgroundColor: AgriColors.primary,
        borderColor: AgriColors.primary,
    },
    rolePillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
    rolePillTextActive: {
        color: '#FFFFFF',
    },
    strengthBox: {
        marginTop: 6,
    },
    strengthBar: {
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: AgriColors.primary,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
        shadowColor: AgriColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    googleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AgriColors.surface,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingVertical: 11,
        borderRadius: 12,
        marginBottom: 16,
    },
    demoButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: AgriColors.primary,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    securityBadgeText: {
        fontSize: 11,
        color: '#64748B',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 18,
    },
    modalIconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: AgriColors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AgriColors.heading,
    },
    modalSub: {
        fontSize: 13,
        color: AgriColors.textMuted,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 18,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    modalSubmitBtn: {
        flex: 1,
        backgroundColor: AgriColors.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalSubmitText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});
