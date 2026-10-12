import { useSettingsStore } from '../store/settingsStore';

export type LanguageCode = 'en' | 'hi' | 'gu';

export const TRANSLATIONS = {
  en: {
    // Navigation
    navDashboard: 'Dashboard',
    navScanner: 'AI Cattle Scanner',
    navBreedLibrary: 'Breed Library',
    navHistory: 'Scan History',
    navAnalytics: 'Analytics & Reports',
    navModelInfo: 'AI Model Info',
    navProfile: 'User Profile',
    navSettings: 'Settings',
    navHelp: 'Help & Support',
    navAbout: 'About CattleSense',
    navAdmin: 'Administration',
    navLogout: 'Sign Out',

    // Dashboard
    dashWelcome: 'Welcome back',
    dashSubtitle: 'AI-Powered Cattle Breed Identification Platform',
    dashTotalScans: 'Total Scans',
    dashMonthlyScans: 'Scans This Month',
    dashAccuracyEst: 'Model Confidence',
    dashTopBreed: 'Top Identified Breed',
    dashQuickScan: 'Quick Scan',
    dashBrowseBreeds: 'Browse Breeds',
    dashViewHistory: 'View History',
    dashRecentScans: 'Recent Scans',
    dashNoScans: 'No scans recorded yet. Capture or upload a cattle photo to get started.',
    dashActivityOverview: 'Scan Activity & Breed Distribution',

    // Scanner
    scanTitle: 'AI Cattle Scanner',
    scanSubtitle: 'Position the cattle in the frame or upload a clear photo',
    scanCapturePhoto: 'Take Photo',
    scanUploadGallery: 'Upload from Gallery',
    scanAnalyze: 'Analyze Breed',
    scanRetake: 'Retake',
    scanAnalyzing: 'Analyzing image with MobileNetV2...',
    scanTipsTitle: 'Photography Field Tips',
    scanTip1: 'Ensure good daylight and minimal shadows',
    scanTip2: 'Capture full side-profile showing hump, head & coat',
    scanTip3: 'Avoid blurry or heavily obstructed photos',

    // Results
    resTitle: 'Prediction Results',
    resTopMatch: 'Top Predicted Breed',
    resConfidence: 'Confidence',
    resWarningLowConf: 'Confidence is below 70%. We recommend capturing a clearer photo with proper lighting.',
    resDisclaimer: 'Note: Confidence score indicates model certainty for this sample, not absolute field accuracy.',
    resTop3Predictions: 'Top 3 Predictions',
    resCharacteristics: 'Key Breed Characteristics',
    resMilkYield: 'Typical Milk Yield',
    resOrigin: 'Regional Origin',
    resScanAgain: 'Scan Another Animal',
    resViewDetails: 'View Full Breed Details',
    resSaved: 'Scan saved to your history',

    // Breed Library
    libTitle: 'Indigenous Breed Library',
    libSubtitle: 'Comprehensive catalog of 50 Indian cattle breeds',
    libSearchPlaceholder: 'Search by breed name or state...',
    libFilterAll: 'All Breeds',
    libFilterMilch: 'Milch (Dairy)',
    libFilterDraft: 'Draught (Work)',
    libFilterDual: 'Dual Purpose',
    libTotalCount: 'Showing {count} breeds',

    // Scan History
    histTitle: 'Scan Records',
    histSubtitle: 'Review past identifications, confidence scores & photos',
    histSearch: 'Search records by breed...',
    histDeleteConfirm: 'Are you sure you want to delete this scan record?',
    histDelete: 'Delete Record',
    histCancel: 'Cancel',

    // Settings
    setLanguage: 'Language / भाषा / ભાષા',
    setTheme: 'Dark Mode',
    setAutoSync: 'Cloud Synchronization',
    setClearCache: 'Clear Local Cache',
    setCacheCleared: 'Local cache cleared successfully',

    // Common
    loading: 'Loading...',
    save: 'Save Changes',
    close: 'Close',
    error: 'An error occurred',
  },

  hi: {
    // Navigation
    navDashboard: 'डैशबोर्ड',
    navScanner: 'एआई नस्ल स्कैनर',
    navBreedLibrary: 'नस्ल पुस्तकालय',
    navHistory: 'स्कैन इतिहास',
    navAnalytics: 'विश्लेषण एवं रिपोर्ट',
    navModelInfo: 'एआई मॉडल जानकारी',
    navProfile: 'उपयोगकर्ता प्रोफ़ाइल',
    navSettings: 'सेटिंग्स',
    navHelp: 'सहायता एवं समर्थन',
    navAbout: 'कैटलसेंस के बारे में',
    navAdmin: 'प्रशासन',
    navLogout: 'लॉग आउट',

    // Dashboard
    dashWelcome: 'स्वागत है',
    dashSubtitle: 'एआई-संचालित स्वदेशी मवेशी नस्ल पहचान प्रणाली',
    dashTotalScans: 'कुल स्कैन',
    dashMonthlyScans: 'इस महीने के स्कैन',
    dashAccuracyEst: 'मॉडल विश्वसनीयता',
    dashTopBreed: 'प्रमुख पहचानी गई नस्ल',
    dashQuickScan: 'त्वरित स्कैन',
    dashBrowseBreeds: 'नस्लें देखें',
    dashViewHistory: 'इतिहास देखें',
    dashRecentScans: 'हाल के स्कैन',
    dashNoScans: 'अभी तक कोई स्कैन नहीं। मवेशी की तस्वीर खींचें या अपलोड करें।',
    dashActivityOverview: 'स्कैन गतिविधि और नस्ल वितरण',

    // Scanner
    scanTitle: 'एआई मवेशी स्कैनर',
    scanSubtitle: 'मवेशी को फ्रेम में रखें या स्पष्ट तस्वीर अपलोड करें',
    scanCapturePhoto: 'फोटो खींचें',
    scanUploadGallery: 'गैलरी से अपलोड करें',
    scanAnalyze: 'नस्ल पहचानें',
    scanRetake: 'पुनः प्रयास',
    scanAnalyzing: 'मोबाइलनेटवी२ द्वारा फोटो का विश्लेषण किया जा रहा है...',
    scanTipsTitle: 'फोटोग्राफी सुझाव',
    scanTip1: 'पर्याप्त दिन के उजाले में फोटो लें',
    scanTip2: 'कूबड़, सिर और त्वचा दिखाने वाली स्पष्ट साइड फोटो लें',
    scanTip3: 'धुंधली तस्वीरों से बचें',

    // Results
    resTitle: 'पहचान परिणाम',
    resTopMatch: 'शीर्ष पहचानी गई नस्ल',
    resConfidence: 'विश्वसनीयता',
    resWarningLowConf: 'विश्वसनीयता ७०% से कम है। कृपया बेहतर रोशनी में दोबारा फोटो लें।',
    resDisclaimer: 'नोट: स्कोर मॉडल की निश्चितता दर्शाता है, पूर्ण सटीकता की गारंटी नहीं।',
    resTop3Predictions: 'शीर्ष ३ संभावित नस्लें',
    resCharacteristics: 'प्रमुख विशेषताएं',
    resMilkYield: 'अनुमानित दुग्ध उत्पादन',
    resOrigin: 'उत्पत्ति क्षेत्र',
    resScanAgain: 'दूसरा पशु स्कैन करें',
    resViewDetails: 'पूरी नस्ल जानकारी देखें',
    resSaved: 'स्कैन आपके इतिहास में सुरक्षित हो गया',

    // Breed Library
    libTitle: 'स्वदेशी नस्ल पुस्तकालय',
    libSubtitle: '५० भारतीय मवेशी नस्लों का सम्पूर्ण डेटाबेस',
    libSearchPlaceholder: 'नस्ल के नाम या राज्य से खोजें...',
    libFilterAll: 'सभी नस्लें',
    libFilterMilch: 'दुधारू नस्लें',
    libFilterDraft: 'भारवाही नस्लें',
    libFilterDual: 'द्वि-उद्देशीय नस्लें',
    libTotalCount: '{count} नस्लें उपलब्ध हैं',

    // Scan History
    histTitle: 'स्कैन रिकॉर्ड्स',
    histSubtitle: 'पूर्व पहचान, विश्वसनीयता और फोटो समीक्षा',
    histSearch: 'नस्ल द्वारा खोजें...',
    histDeleteConfirm: 'क्या आप इस स्कैन रिकॉर्ड को हटाना चाहते हैं?',
    histDelete: 'रिकॉर्ड हटाएं',
    histCancel: 'रद्द करें',

    // Settings
    setLanguage: 'भाषा / Language / ભાષા',
    setTheme: 'डार्क मोड',
    setAutoSync: 'क्लाउड सिंक',
    setClearCache: 'कैश साफ़ करें',
    setCacheCleared: 'कैश सफलतापूर्वक साफ़ कर दिया गया',

    // Common
    loading: 'लोड हो रहा है...',
    save: 'सहेजें',
    close: 'बंद करें',
    error: 'त्रुटि उत्पन्न हुई',
  },

  gu: {
    // Navigation
    navDashboard: 'ડેશબોર્ડ',
    navScanner: 'એઆઈ પશુ સ્કેનર',
    navBreedLibrary: 'નસલ પુસ્તકાલય',
    navHistory: 'સ્કેન ઇતિહાસ',
    navAnalytics: 'વિશ્લેષણ અને અહેવાલ',
    navModelInfo: 'એઆઈ મોડેલ માહિતી',
    navProfile: 'પ્રોફાઇલ',
    navSettings: 'સેટિંગ્સ',
    navHelp: 'મદદ અને સહાય',
    navAbout: 'કેટલસેન્સ વિશે',
    navAdmin: 'વહીવટ',
    navLogout: 'લૉગ આઉટ',

    // Dashboard
    dashWelcome: 'સ્વાગત છે',
    dashSubtitle: 'એઆઈ આધારિત ભારતીય ગાય નસલ ઓળખ સિસ્ટમ',
    dashTotalScans: 'કુલ સ્કેન',
    dashMonthlyScans: 'આ મહિનાના સ્કેન',
    dashAccuracyEst: 'મોડલ વિશ્વસનીયતા',
    dashTopBreed: 'મુખ્ય ઓળખાયેલી નસલ',
    dashQuickScan: 'ઝડપી સ્કેન',
    dashBrowseBreeds: 'નસલો જુઓ',
    dashViewHistory: 'ઇતિહાસ જુઓ',
    dashRecentScans: 'તાજેતરના સ્કેન',
    dashNoScans: 'હજી સુધી કોઈ સ્કેન નોંધાયેલ નથી. ગાયનો ફોટો લો અથવા અપલોડ કરો.',
    dashActivityOverview: 'સ્કેન પ્રવૃત્તિ અને નસલ વિતરણ',

    // Scanner
    scanTitle: 'એઆઈ પશુ સ્કેનર',
    scanSubtitle: 'પશુને ફ્રેમમાં રાખો અથવા સ્પષ્ટ ફોટો અપલોડ કરો',
    scanCapturePhoto: 'ફોટો લો',
    scanUploadGallery: 'ગેલેરીમાંથી અપલોડ કરો',
    scanAnalyze: 'નસલ ઓળખો',
    scanRetake: 'ફરીથી લો',
    scanAnalyzing: 'મોબાઇલનેટ દ્વારા ફોટોનું વિશ્લેષણ થઈ રહ્યું છે...',
    scanTipsTitle: 'ફોટોગ્રાફી ટિપ્સ',
    scanTip1: 'દિવસના અજવાળામાં ફોટો લો',
    scanTip2: 'ખૂંધ, માથું અને શરીર દર્શાવતો સ્પષ્ટ ફોટો લો',
    scanTip3: 'ઝાંખા ફોટા ટાળો',

    // Results
    resTitle: 'ઓળખ પરિણામ',
    resTopMatch: 'મુખ્ય ઓળખાયેલી નસલ',
    resConfidence: 'વિશ્વસનીયતા',
    resWarningLowConf: 'વિશ્વસનીયતા ૭૦% થી ઓછી છે. કૃપા કરીને વધુ સ્પષ્ટ ફોટો લો.',
    resDisclaimer: 'નોંધ: સ્કોર મોડેલની ખાતરી દર્શાવે છે, ક્ષેત્ર ચોકસાઈની બાંયધરી નથી.',
    resTop3Predictions: 'ટોચની ૩ સંભવિત નસલો',
    resCharacteristics: 'મુખ્ય લક્ષણો',
    resMilkYield: 'દૂધ ઉત્પાદન ક્ષમતા',
    resOrigin: 'મૂળ પ્રદેશ',
    resScanAgain: 'બીજું પશુ સ્કેન કરો',
    resViewDetails: 'સંપૂર્ણ વિગતો જુઓ',
    resSaved: 'સ્કેન તમારા ઇતિહાસમાં સાચવવામાં આવ્યું',

    // Breed Library
    libTitle: 'સ્વદેશી નસલ પુસ્તકાલય',
    libSubtitle: '૫૦ ભારતીય પશુ નસલોનો વ્યાપક સંગ્રહ',
    libSearchPlaceholder: 'નસલના નામ કે રાજ્ય દ્વારા શોધો...',
    libFilterAll: 'બધી નસલો',
    libFilterMilch: 'દૂધાળી નસલો',
    libFilterDraft: 'ખેતી ઉપયોગી નસલો',
    libFilterDual: 'દ્વિ-હેતુક નસલો',
    libTotalCount: '{count} નસલો ઉપલબ્ધ છે',

    // Scan History
    histTitle: 'સ્કેન ઇતિહાસ',
    histSubtitle: 'અગાઉના સ્કેન, સ્કોર્સ અને ફોટાઓની સમીક્ષા',
    histSearch: 'નસલ દ્વારા શોધો...',
    histDeleteConfirm: 'શું તમે આ સ્કેન રેકોર્ડ કાઢી નાખવા માંગો છો?',
    histDelete: 'રેકોર્ડ કાઢી નાખો',
    histCancel: 'રદ કરો',

    // Settings
    setLanguage: 'ભાષા / Language / भाषा',
    setTheme: 'ડાર્ક મોડ',
    setAutoSync: 'ક્લાઉડ સિંક',
    setClearCache: 'કેશ સાફ કરો',
    setCacheCleared: 'કેશ સફળતાપૂર્વક સાફ કરવામાં આવી',

    // Common
    loading: 'લોડ થઈ રહ્યું છે...',
    save: 'સાચવો',
    close: 'બંધ કરો',
    error: 'ભૂલ આવી',
  },
};

export const useTranslation = () => {
  const language = useSettingsStore((s) => s.language) || 'en';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  return { t, language };
};
