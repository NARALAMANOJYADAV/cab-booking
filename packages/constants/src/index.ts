import { VehicleCategory, BookingState, UserRole } from '@fairride/types';

export const APP_NAME = 'FairRide';
export const APP_TAGLINE = 'Book With Confidence.';

export const VEHICLE_CONFIGS: Record<
  VehicleCategory,
  {
    name: string;
    description: string;
    capacity: number;
    baseFare: number;
    baseKm: number;
    perKmRate: number;
    perMinuteRate: number;
    platformFeeRate: number; // e.g. 0.10 (10%)
    gstRate: number; // 0.05 (5%)
    co2PerKmGrams: number;
    isZeroEmission?: boolean;
    icon: string;
  }
> = {
  ECONOMY: {
    name: 'FairEconomy',
    description: 'Affordable, compact rides for everyday travel with guaranteed fair rates.',
    capacity: 4,
    baseFare: 50,
    baseKm: 2,
    perKmRate: 14,
    perMinuteRate: 1.5,
    platformFeeRate: 0.08,
    gstRate: 0.05,
    co2PerKmGrams: 140,
    icon: 'car-simple'
  },
  HATCHBACK: {
    name: 'FairHatchback',
    description: 'Nimble city cars with AC, ideal for traffic and quick commutes.',
    capacity: 4,
    baseFare: 60,
    baseKm: 2,
    perKmRate: 16,
    perMinuteRate: 1.8,
    platformFeeRate: 0.08,
    gstRate: 0.05,
    co2PerKmGrams: 130,
    icon: 'car'
  },
  SEDAN: {
    name: 'FairSedan',
    description: 'Spacious comfort with extra legroom and dedicated trunk space.',
    capacity: 4,
    baseFare: 80,
    baseKm: 3,
    perKmRate: 19,
    perMinuteRate: 2.0,
    platformFeeRate: 0.10,
    gstRate: 0.05,
    co2PerKmGrams: 160,
    icon: 'car-front'
  },
  SUV: {
    name: 'FairSUV',
    description: '6-seater spacious vehicle for families, groups, and large airport luggage.',
    capacity: 6,
    baseFare: 120,
    baseKm: 3,
    perKmRate: 25,
    perMinuteRate: 2.5,
    platformFeeRate: 0.10,
    gstRate: 0.05,
    co2PerKmGrams: 210,
    icon: 'suv'
  },
  PREMIUM: {
    name: 'FairPrime Luxe',
    description: 'Executive cars with top-rated drivers, complimentary water, and quiet ride mode.',
    capacity: 4,
    baseFare: 150,
    baseKm: 3,
    perKmRate: 32,
    perMinuteRate: 3.5,
    platformFeeRate: 0.12,
    gstRate: 0.05,
    co2PerKmGrams: 180,
    icon: 'gem'
  },
  EV: {
    name: 'FairGreen EV',
    description: '100% Electric vehicle. Silent, zero emissions, and carbon offset rewards.',
    capacity: 4,
    baseFare: 65,
    baseKm: 2.5,
    perKmRate: 16,
    perMinuteRate: 1.6,
    platformFeeRate: 0.06,
    gstRate: 0.05,
    co2PerKmGrams: 0,
    isZeroEmission: true,
    icon: 'leaf'
  },
  SHARED: {
    name: 'FairShare',
    description: 'Share your route with a co-passenger traveling in the same corridor for up to 40% savings.',
    capacity: 2,
    baseFare: 40,
    baseKm: 2,
    perKmRate: 11,
    perMinuteRate: 1.2,
    platformFeeRate: 0.08,
    gstRate: 0.05,
    co2PerKmGrams: 70,
    icon: 'users'
  },
  ACCESSIBLE: {
    name: 'FairAccess',
    description: 'Wheelchair accessible, trained caregiver driver assistance, priority boarding.',
    capacity: 4,
    baseFare: 70,
    baseKm: 2,
    perKmRate: 17,
    perMinuteRate: 1.5,
    platformFeeRate: 0.05,
    gstRate: 0.05,
    co2PerKmGrams: 150,
    icon: 'accessibility'
  }
};

export const DEFAULT_DISPATCH_WEIGHTS = {
  eta: 0.30,
  distance: 0.20,
  driverReliability: 0.15,
  vehicleCompatibility: 0.15,
  currentWorkload: 0.10,
  operationalFairness: 0.10
};

export const VALID_BOOKING_TRANSITIONS: Record<BookingState, BookingState[]> = {
  SEARCHING: ['QUOTE_CREATED', 'CANCELLED'],
  QUOTE_CREATED: ['FARE_LOCKED', 'CANCELLED'],
  FARE_LOCKED: ['REQUESTED', 'CANCELLED'],
  REQUESTED: ['DRIVER_ASSIGNED', 'RECOVERY', 'CANCELLED'],
  DRIVER_ASSIGNED: ['DRIVER_ACCEPTED', 'RECOVERY', 'CANCELLED'],
  DRIVER_ACCEPTED: ['DRIVER_ARRIVING', 'RECOVERY', 'CANCELLED'],
  DRIVER_ARRIVING: ['DRIVER_ARRIVED', 'RECOVERY', 'CANCELLED'],
  DRIVER_ARRIVED: ['TRIP_STARTED', 'CANCELLED'],
  TRIP_STARTED: ['TRIP_IN_PROGRESS', 'DISPUTED'],
  TRIP_IN_PROGRESS: ['TRIP_COMPLETED', 'DISPUTED'],
  TRIP_COMPLETED: ['PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'DISPUTED'],
  PAYMENT_PENDING: ['PAYMENT_COMPLETED', 'DISPUTED'],
  PAYMENT_COMPLETED: ['DISPUTED', 'REFUNDED'],
  CANCELLED: ['RECOVERY'],
  RECOVERY: ['DRIVER_ASSIGNED', 'CANCELLED'],
  DISPUTED: ['REFUNDED', 'PAYMENT_COMPLETED'],
  REFUNDED: []
};

export const DRIVER_DECLINE_REASONS = [
  'Pickup is too far',
  'Heavy traffic corridor',
  'Vehicle mechanical issue',
  'Safety concern at pickup zone',
  'Personal emergency',
  'End of driving shift',
  'Other legitimate reason'
] as const;

export const PASSENGER_CANCEL_REASONS = [
  'Driver not moving towards pickup',
  'Driver asked to cancel and pay offline',
  'Driver demanded extra money over locked fare',
  'Changed travel plans',
  'Booked alternate transport',
  'Wrong pickup location entered'
] as const;

export const ROUTE_DEVIATION_TOLERANCE_METERS = 300; // 300 meters buffer for traffic/diversions

export const FUEL_COST_PER_KM_ESTIMATE = 6.5; // Average INR fuel cost per km for driver net earnings preview
export const TOLL_ESTIMATE_DEFAULT = 0;

export const DEMO_CITIES = [
  {
    name: 'Hyderabad',
    center: [78.3808, 17.4435] as [number, number],
    hotspots: [
      { name: 'Hitech City Cyber Towers', coordinates: [78.3811, 17.4474] as [number, number], demand: 'HIGH' },
      { name: 'Rajiv Gandhi International Airport (RGIA)', coordinates: [78.4298, 17.2403] as [number, number], demand: 'HIGH' },
      { name: 'Gachibowli Financial District', coordinates: [78.3498, 17.4239] as [number, number], demand: 'HIGH' },
      { name: 'Secunderabad Railway Station', coordinates: [78.5029, 17.4344] as [number, number], demand: 'MEDIUM' },
      { name: 'Jubilee Hills Check Post', coordinates: [78.4116, 17.4319] as [number, number], demand: 'MEDIUM' },
      { name: 'Charminar Heritage Zone', coordinates: [78.4747, 17.3616] as [number, number], demand: 'LOW' }
    ]
  },
  {
    name: 'Bengaluru',
    center: [77.5946, 12.9716] as [number, number],
    hotspots: [
      { name: 'Kempegowda International Airport (BLR)', coordinates: [77.7064, 13.1986] as [number, number], demand: 'HIGH' },
      { name: 'Koramangala Sony World Signal', coordinates: [77.6271, 12.9352] as [number, number], demand: 'HIGH' },
      { name: 'Whitefield ITPL', coordinates: [77.7479, 12.9863] as [number, number], demand: 'HIGH' },
      { name: 'Indiranagar 100ft Road', coordinates: [77.6412, 12.9719] as [number, number], demand: 'MEDIUM' }
    ]
  }
];

export const I18N_STRINGS = {
  en: {
    tagline: 'Book With Confidence.',
    whereTo: 'Where do you want to go?',
    fareLocked: 'FARE LOCKED',
    noHiddenCharges: 'Guaranteed upfront pricing. No sudden surge or surprise deductions.',
    driverGross: 'Driver Gross Earnings',
    driverNet: 'Estimated Driver Net Earnings',
    fuelEstimate: 'Estimated Fuel',
    autoRecoveryTitle: 'Driver Cancelled. Auto-Recovery Active.',
    autoRecoveryDesc: 'We are immediately pairing you with the next nearest top-rated driver. Zero penalty.',
    routeGuardian: 'Route Guardian Active',
    sosButton: 'EMERGENCY SOS',
    evidenceDispute: 'Evidence-Based Dispute Resolution',
    seniorMode: 'Senior Accessibility Mode',
    lowInternetMode: 'FairRide Lite (Low Internet)'
  },
  te: {
    tagline: 'నమ్మకంతో ప్రయాణించండి.',
    whereTo: 'మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు?',
    fareLocked: 'ధర లాక్ చేయబడింది',
    noHiddenCharges: 'ముందుగానే నిర్ణయించిన ధర. దాగి ఉన్న ఛార్జీలు లేవు.',
    driverGross: 'డ్రైవర్ స్థూల ఆదాయం',
    driverNet: 'డ్రైవర్ నికర ఆదాయం',
    fuelEstimate: 'ఇంధన అంచనా వ్యయం',
    autoRecoveryTitle: 'డ్రైవర్ రద్దు చేశారు. ఆటో రికవరీ మొదలైంది.',
    autoRecoveryDesc: 'ఎటువంటి అదనపు రుసుము లేకుండా వేరొక డ్రైవర్‌ను కేటాయిస్తున్నాము.',
    routeGuardian: 'రూట్ గార్డియన్ రక్షణలో ఉంది',
    sosButton: 'అత్యవసర SOS',
    evidenceDispute: 'ఆధారాలతో వివాద పరిష్కారం',
    seniorMode: 'సీనియర్ సిటిజన్ మోడ్',
    lowInternetMode: 'ఫేర్‌రైడ్ లైట్ (నెమ్మది ఇంటర్నెట్ మోడ్)'
  },
  hi: {
    tagline: 'विश्वास के साथ बुक करें।',
    whereTo: 'आप कहाँ जाना चाहते हैं?',
    fareLocked: 'किराया लॉक है',
    noHiddenCharges: 'पारदर्शी किराया। कोई अप्रत्याशित शुल्क नहीं।',
    driverGross: 'चालक की कुल कमाई',
    driverNet: 'चालक की अनुमानित शुद्ध कमाई',
    fuelEstimate: 'अनुमानित ईंधन खर्च',
    autoRecoveryTitle: 'चालक ने रद्द किया। ऑटो-रिकवरी चालू है।',
    autoRecoveryDesc: 'बिना किसी परेशानी के दूसरा चालक खोजा जा रहा है।',
    routeGuardian: 'रूट गार्जियन सक्रिय',
    sosButton: 'आपातकालीन SOS',
    evidenceDispute: 'प्रमाण-आधारित विवाद समाधान',
    seniorMode: 'वरिष्ठ नागरिक मोड',
    lowInternetMode: 'फेयरराइड लाइट (धीमा इंटरनेट)'
  },
  ta: {
    tagline: 'நம்பிக்கையுடன் பயணிக்கவும்.',
    whereTo: 'நீங்கள் எங்கு செல்ல விரும்புகிறீர்கள்?',
    fareLocked: 'கட்டணம் பூட்டப்பட்டது',
    noHiddenCharges: 'மறைமுக கட்டணங்கள் இல்லை.',
    driverGross: 'ஓட்டுநர் மொத்த வருமானம்',
    driverNet: 'ஓட்டுநர் நிகர வருமானம்',
    fuelEstimate: 'மதிப்பிடப்பட்ட எரிபொருள்',
    autoRecoveryTitle: 'தானியங்கி மீட்பு இயங்குகிறது',
    autoRecoveryDesc: 'உடனடியாக வேறொரு ஓட்டுநரை இணைக்கிறோம்.',
    routeGuardian: 'பாதை கண்காணிப்பாளர்',
    sosButton: 'அவசர SOS',
    evidenceDispute: 'ஆதார அடிப்படையிலான தீர்வு',
    seniorMode: 'முதியோர் பயன்முறை',
    lowInternetMode: 'ஃபேர்ரைட் லைட்'
  },
  kn: {
    tagline: 'ವಿಶ್ವಾಸದಿಂದ ಬುಕ್ ಮಾಡಿ.',
    whereTo: 'ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಲು ಬಯಸುತ್ತೀರಿ?',
    fareLocked: 'ದರ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ',
    noHiddenCharges: 'ಸ್ಪಷ್ಟ ದರ. ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳಿಲ್ಲ.',
    driverGross: 'ಚಾಲಕರ ಒಟ್ಟು ಗಳಿಕೆ',
    driverNet: 'ಚಾಲಕರ ನಿವ್ವಳ ಗಳಿಕೆ',
    fuelEstimate: 'ಅಂದಾಜು ಇಂಧನ ವೆಚ್ಚ',
    autoRecoveryTitle: 'ಚಾಲಕ ರದ್ದುಗೊಳಿಸಿದ್ದಾರೆ. ಸ್ವಯಂ ಮರುಪಡೆಯುವಿಕೆ ಸಕ್ರಿಯ.',
    autoRecoveryDesc: 'ಶುಲ್ಕವಿಲ್ಲದೆ ತಕ್ಷಣ ಹೊಸ ಚಾಲಕರನ್ನು ನಿಯೋಜಿಸಲಾಗುತ್ತಿದೆ.',
    routeGuardian: 'ರೂಟ್ ಗಾರ್ಡಿಯನ್ ಸಕ್ರಿಯ',
    sosButton: 'ತುರ್ತು SOS',
    evidenceDispute: 'ಸಾಕ್ಷ್ಯ ಆಧಾರಿತ ಪರಿಹಾರ',
    seniorMode: 'ಹಿರಿಯ ನಾಗರಿಕರ ಮೋಡ್',
    lowInternetMode: 'ಫೇರ್ ರೈಡ್ ಲೈಟ್'
  }
};
