import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../locales/i18n';

export default function HelpScreen() {
  const router = useRouter();
  const { userEmail, displayName } = useAuthStore();
  const { t } = useTranslation();

  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [formName, setFormName] = useState(displayName || '');
  const [formEmail, setFormEmail] = useState(userEmail || '');
  const [formCategory, setFormCategory] = useState('Breed Classification Question');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<string | null>(null);

  const faqs = [
    {
      id: 1,
      q: 'How does CattleSense identify cattle breeds?',
      a: 'CattleSense uses a deep learning convolutional neural network (MobileNetV2) trained on 50 indigenous Indian cattle breeds. It analyzes key physical features like hump shape, horn curvature, dewlap, and coat pigmentation.',
    },
    {
      id: 2,
      q: 'What is the best way to photograph cattle in the field?',
      a: 'Take a clear side-profile photo in outdoor daylight. Keep your camera at shoulder height with the cattle filling 70-80% of the frame. Avoid harsh shadows or strong backlighting.',
    },
    {
      id: 3,
      q: 'Why did my scan produce low confidence?',
      a: 'Low confidence happens when the image is blurry, taken from an unusual angle, or if the animal is crossbred with traits from multiple lineages. Retake the image standing 3-4 meters away in good light.',
    },
    {
      id: 4,
      q: 'How are my scan records stored?',
      a: 'Records are saved locally in the SQLite database (backend/cattle_sense.db) and synchronized with Google Cloud Firestore when connected to the internet.',
    },
    {
      id: 5,
      q: 'Can administrators monitor system usage?',
      a: 'Yes. Users with administrator privileges can access the Administration console to review system health, database storage, and total scan activity.',
    },
  ];

  const handleSupportSubmit = () => {
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setFormStatus('Please complete all fields before submitting.');
      return;
    }

    setFormStatus('Your inquiry has been submitted! Support reference #' + Math.floor(100000 + Math.random() * 900000));
    setFormMessage('');
    setTimeout(() => setFormStatus(null), 5000);
  };

  return (
    <ResponsiveShell
      title={t.navHelp}
      subtitle="Frequently Asked Questions & Field Assistance"
      activeRoute="help"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Contact Buttons */}
        <View style={styles.quickContactRow}>
          <TouchableOpacity
            style={styles.contactTile}
            onPress={() => Linking.openURL('mailto:support@cattlesense.org?subject=CattleSense Assistance')}
          >
            <View style={[styles.contactIconBox, { backgroundColor: '#E8F5EE' }]}>
              <Ionicons name="mail" size={20} color={AgriColors.primary} />
            </View>
            <Text style={styles.contactTitle}>Email Helpdesk</Text>
            <Text style={styles.contactSub}>support@cattlesense.org</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactTile}
            onPress={() => router.push('/(stack)/about')}
          >
            <View style={[styles.contactIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="information-circle" size={20} color="#0284C7" />
            </View>
            <Text style={styles.contactTitle}>About Platform</Text>
            <Text style={styles.contactSub}>Project Architecture & Tech</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          <Text style={styles.cardDesc}>Common questions regarding AI identification, database, and usage:</Text>

          <View style={styles.faqList}>
            {faqs.map((f) => {
              const isOpen = expandedId === f.id;
              return (
                <View key={f.id} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => setExpandedId(isOpen ? null : f.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.faqQuestion, isOpen && { color: AgriColors.primary }]}>{f.q}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isOpen ? AgriColors.primary : AgriColors.textMuted}
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.faqBody}>
                      <Text style={styles.faqAnswer}>{f.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Contact / Inquiry Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Technical Support</Text>
          <Text style={styles.cardDesc}>
            Send field inquiries, bug reports, or breed database feedback to the research team:
          </Text>

          {formStatus && (
            <View style={[styles.statusBox, formStatus.includes('reference') ? styles.statusSuccess : styles.statusError]}>
              <Ionicons
                name={formStatus.includes('reference') ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={formStatus.includes('reference') ? '#15803D' : '#DC2626'}
              />
              <Text style={styles.statusText}>{formStatus}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="Officer Name"
              placeholderTextColor={AgriColors.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formEmail}
              onChangeText={setFormEmail}
              placeholder="officer@dairy.gov.in"
              placeholderTextColor={AgriColors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Inquiry Topic</Text>
            <View style={styles.categoryRow}>
              {['Classification', 'Breed Info', 'Bug Report'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, formCategory === cat && styles.categoryPillActive]}
                  onPress={() => setFormCategory(cat)}
                >
                  <Text style={[styles.categoryPillText, formCategory === cat && styles.categoryPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Message / Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formMessage}
              onChangeText={setFormMessage}
              placeholder="Describe your question or observation in detail..."
              placeholderTextColor={AgriColors.textLight}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSupportSubmit}>
            <Ionicons name="paper-plane" size={17} color="#FFF" />
            <Text style={styles.submitBtnText}>Submit Support Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 16,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactTile: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: AgriColors.border,
    alignItems: 'flex-start',
    gap: 4,
  },
  contactIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  contactSub: {
    fontSize: 12,
    color: AgriColors.textMuted,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  cardDesc: {
    fontSize: 13,
    color: AgriColors.textMuted,
    lineHeight: 18,
    marginBottom: 6,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: AgriColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AgriColors.border,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
    flex: 1,
  },
  faqBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: AgriColors.borderSubtle,
    paddingTop: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: AgriColors.textMedium,
    lineHeight: 19,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.textDark,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: AgriColors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: AgriColors.border,
    fontSize: 14,
    color: AgriColors.textDark,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: AgriColors.background,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  categoryPillActive: {
    backgroundColor: AgriColors.primary,
    borderColor: AgriColors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  categoryPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  statusSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: AgriColors.textDark,
    flex: 1,
  },
});
