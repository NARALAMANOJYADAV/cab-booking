import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Driver,
  Vehicle,
  Booking,
  FareLock,
  FareAudit,
  Dispute,
  SafetyIncident,
  Wallet,
  WalletTransaction,
  CorporateAccount,
  FraudAlert
} from '../models/index.js';
import { VEHICLE_CONFIGS } from '@fairride/constants';
import { VehicleCategory } from '@fairride/types';

export async function runSeed() {
  console.log('[Seed] Starting comprehensive FairRide seed...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Driver.deleteMany({}),
    Vehicle.deleteMany({}),
    Booking.deleteMany({}),
    FareLock.deleteMany({}),
    FareAudit.deleteMany({}),
    Dispute.deleteMany({}),
    SafetyIncident.deleteMany({}),
    Wallet.deleteMany({}),
    WalletTransaction.deleteMany({}),
    CorporateAccount.deleteMany({}),
    FraudAlert.deleteMany({})
  ]);

  console.log('[Seed] Cleared existing data.');

  // 1. Create Default Test Accounts
  const adminUser = await User.create({
    name: 'Sunita Verma',
    email: 'admin@fairride.local',
    phone: '9800000001',
    password: 'Password@123',
    role: 'SUPER_ADMIN',
    isVerified: true,
    referralCode: 'FRADMIN'
  });

  const passengerTestUser = await User.create({
    name: 'Aarav Sharma',
    email: 'passenger@fairride.local',
    phone: '9800000002',
    password: 'Password@123',
    role: 'PASSENGER',
    isVerified: true,
    referralCode: 'FRAARAV',
    emergencyContacts: [
      { name: 'Pooja Sharma (Spouse)', phone: '+91 9876500001', relationship: 'Spouse' },
      { name: 'Dr. Ramesh Sharma (Father)', phone: '+91 9876500002', relationship: 'Father' }
    ]
  });

  const driverTestUser = await User.create({
    name: 'Rajesh Kumar',
    email: 'driver@fairride.local',
    phone: '9800000003',
    password: 'Password@123',
    role: 'DRIVER',
    isVerified: true,
    referralCode: 'FRRAJESH'
  });

  const corporateTestUser = await User.create({
    name: 'Vikram Patel',
    email: 'corporate@fairride.local',
    phone: '9800000004',
    password: 'Password@123',
    role: 'CORPORATE_MANAGER',
    isVerified: true,
    referralCode: 'FRVIKRAM'
  });

  // Wallets for default accounts
  await Wallet.create({ userId: passengerTestUser._id, userRole: 'PASSENGER', balance: 1250 });
  await Wallet.create({ userId: driverTestUser._id, userRole: 'DRIVER', balance: 3420 });

  // 2. Create 50 Passengers
  const passengerNames = [
    'Aditi Rao', 'Rohan Gupta', 'Kavita Iyer', 'Siddharth Nair', 'Sneha Reddy',
    'Arjun Menon', 'Ananya Deshmukh', 'Manoj Gowda', 'Divya Pillai', 'Varun Kapoor',
    'Neha Singhania', 'Karthik Raja', 'Meera Bhatt', 'Tanvi Joshi', 'Akash Mehta',
    'Swati Sen', 'Pranav Kulkarni', 'Preeti Verma', 'Rahul Choudhary', 'Ishaan Malhotra',
    'Shreya Saxena', 'Nikhil Agarwal', 'Ritu Tiwari', 'Kunal Trivedi', 'Shalini Das',
    'Deepak Bansal', 'Ritika Bose', 'Gaurav Dubey', 'Anjali Pandey', 'Harish Nambiar',
    'Nandini Murthy', 'Chirag Sethi', 'Radhika Apte', 'Mohit Rawat', 'Simran Kaur',
    'Abhay Singhal', 'Priya Mani', 'Vivek Oberoi', 'Tara Sutaria', 'Manish Sisodia',
    'Monika Geller', 'Chandler Murthy', 'Ross Sharma', 'Rachel Sen', 'Joey Tribbiani',
    'Phoebe Buffay', 'Bruce Wayne', 'Clark Kent', 'Diana Prince', 'Barry Allen'
  ];

  const passengers: any[] = [passengerTestUser];
  for (let i = 0; i < 49; i++) {
    const p = await User.create({
      name: passengerNames[i % passengerNames.length] + ` ${i + 1}`,
      email: `rider${i + 1}@fairride.local`,
      phone: `97000000${(i + 10).toString().padStart(2, '0')}`,
      password: 'Password@123',
      role: 'PASSENGER',
      isVerified: true,
      referralCode: `FRRIDER${i + 1}`,
      trustScore: 90 + (i % 10),
      completedRides: 5 + (i % 20)
    });
    passengers.push(p);
    await Wallet.create({ userId: p._id, userRole: 'PASSENGER', balance: 250 + (i * 10) });
  }

  // 3. Create 20 Drivers and 10 Vehicles
  const driverNames = [
    'Rajesh Kumar', 'Mohammad Shakeel', 'Venkatesh Babu', 'Ramesh Yadav', 'Satish Reddy',
    'Guru Prasad', 'Prabhakar Rao', 'Suresh Naidu', 'Deepak Chauhan', 'Jagdish Chandra',
    'Maheshwar Rao', 'Altaf Hussain', 'Gopi Krishna', 'Balram Sahu', 'Chander Prakash',
    'Dhanush Gowda', 'Eswar Murthy', 'Farooq Ahmed', 'Girish Kumble', 'Hemant Patil'
  ];

  const vehicleModels = [
    { brand: 'Hyundai', model: 'Aura', category: 'SEDAN', seats: 4, fuel: 'PETROL', isEv: false },
    { brand: 'Tata', model: 'Nexon EV', category: 'EV', seats: 4, fuel: 'ELECTRIC', isEv: true },
    { brand: 'Maruti Suzuki', model: 'WagonR', category: 'ECONOMY', seats: 4, fuel: 'CNG', isEv: false },
    { brand: 'Maruti Suzuki', model: 'Swift Dzire', category: 'SEDAN', seats: 4, fuel: 'PETROL', isEv: false },
    { brand: 'Toyota', model: 'Innova Crysta', category: 'SUV', seats: 6, fuel: 'DIESEL', isEv: false },
    { brand: 'MG', model: 'ZS EV', category: 'EV', seats: 4, fuel: 'ELECTRIC', isEv: true },
    { brand: 'Hyundai', model: 'Grand i10', category: 'HATCHBACK', seats: 4, fuel: 'PETROL', isEv: false },
    { brand: 'Toyota', model: 'Camry Hybrid', category: 'PREMIUM', seats: 4, fuel: 'HYBRID', isEv: false },
    { brand: 'Force', model: 'Urbania Access', category: 'ACCESSIBLE', seats: 4, fuel: 'DIESEL', isEv: false, isWheelchair: true },
    { brand: 'Maruti Suzuki', model: 'Ertiga', category: 'SHARED', seats: 6, fuel: 'CNG', isEv: false }
  ];

  const drivers: any[] = [];
  const hyderabadCoords: [number, number][] = [
    [78.3811, 17.4474], // Hitech City
    [78.3750, 17.4420], // Madhapur
    [78.3550, 17.4320], // Gachibowli
    [78.3680, 17.4560], // Kondapur
    [78.4010, 17.4320], // Jubilee Hills
    [78.4350, 17.4210], // Banjara Hills
    [78.4740, 17.3610], // Charminar
    [78.5020, 17.4340], // Secunderabad
    [78.4298, 17.2403], // Airport
    [78.3990, 17.4930]  // KPHB
  ];

  for (let i = 0; i < 20; i++) {
    const u = i === 0 ? driverTestUser : await User.create({
      name: driverNames[i],
      email: `driver${i + 1}@fairride.local`,
      phone: `96000000${(i + 10).toString().padStart(2, '0')}`,
      password: 'Password@123',
      role: 'DRIVER',
      isVerified: true,
      referralCode: `FRDRV${i + 1}`
    });

    const vData = vehicleModels[i % vehicleModels.length];
    const vehicle = await Vehicle.create({
      driverId: u._id,
      registrationNumber: `TS0${(i % 9) + 7}UB${1000 + i}`,
      brand: vData.brand,
      model: vData.model,
      color: i % 2 === 0 ? 'Pure White' : 'Silver Metallic',
      category: vData.category,
      seatingCapacity: vData.seats,
      fuelType: vData.fuel,
      isElectric: vData.isEv,
      isWheelchairAccessible: (vData as any).isWheelchair || false,
      rcNumber: `RC987654${i + 10}`,
      insuranceNumber: `INS202678${i + 10}`,
      verificationStatus: 'VERIFIED'
    });

    const coords = hyderabadCoords[i % hyderabadCoords.length];
    const d = await Driver.create({
      userId: u._id,
      vehicleId: vehicle._id,
      isOnline: i < 16, // 16 active online
      isBusy: i % 3 === 0,
      currentLocation: {
        type: 'Point',
        coordinates: [coords[0] + (Math.random() - 0.5) * 0.02, coords[1] + (Math.random() - 0.5) * 0.02],
        updatedAt: new Date()
      },
      city: 'Hyderabad',
      verificationStatus: 'VERIFIED',
      rating: 4.75 + (i % 25) * 0.01,
      ratingCount: 150 + i * 15,
      acceptanceRate: 92 + (i % 8),
      cancellationRate: 1.5 + (i % 3) * 0.4,
      completedTripsCount: 220 + i * 25,
      hoursOnlineToday: 4.5 + (i % 4),
      todayGrossEarnings: 1800 + i * 210,
      todayNetEarnings: 1250 + i * 160,
      trustScore: 96 + (i % 4)
    });
    drivers.push(d);
  }

  // 4. Create Corporate Account
  const corporate = await CorporateAccount.create({
    companyName: 'Infosys BPM Campus',
    corporateCode: 'INFY2026',
    billingEmail: 'transport.hyd@infosys.com',
    phone: '+91 40 6641 0000',
    monthlyBudget: 750000,
    currentSpend: 245000,
    departments: [
      { name: 'Cloud Infrastructure', budget: 300000, spend: 110000 },
      { name: 'AI & Machine Learning Labs', budget: 250000, spend: 85000 },
      { name: 'Client Operations', budget: 200000, spend: 50000 }
    ],
    travelPolicy: {
      maxFarePerRide: 2000,
      allowedCategories: ['SEDAN', 'EV', 'PREMIUM'],
      requireManagerApproval: true
    }
  });

  // 5. Create 100 Historical Rides with FareLocks and FareAudits
  console.log('[Seed] Creating 100 historical completed rides with FareLock and FareAudits...');
  const pickupSpots = [
    { name: 'Cyber Towers Gate 1', coords: [78.3811, 17.4474] },
    { name: 'Inorbit Mall Porch', coords: [78.3872, 17.4354] },
    { name: 'Gachibowli Flyover Hub', coords: [78.3498, 17.4239] },
    { name: 'Secunderabad West Metro', coords: [78.5029, 17.4344] },
    { name: 'RGIA Airport Pillar 6', coords: [78.4298, 17.2403] }
  ];

  for (let i = 0; i < 100; i++) {
    const passenger = passengers[i % passengers.length];
    const driver = drivers[i % drivers.length];
    const pickup = pickupSpots[i % pickupSpots.length];
    const dest = pickupSpots[(i + 1) % pickupSpots.length];
    const dist = 6 + (i % 25);
    const dur = 15 + (i % 40);
    const fare = Math.round(90 + dist * 18 + dur * 2);

    const lock = await FareLock.create({
      quoteId: `quote_hist_${i + 1}`,
      passengerId: passenger._id,
      vehicleCategory: 'SEDAN',
      distanceKm: dist,
      durationMin: dur,
      breakdown: {
        baseFare: 80,
        distanceCharge: dist * 18,
        timeComponent: dur * 2,
        toll: i % 4 === 0 ? 40 : 0,
        platformFee: Math.round(fare * 0.1),
        tax: Math.round(fare * 0.05),
        totalFare: fare,
        currency: 'INR'
      },
      lockedFare: fare,
      lockedAt: new Date(Date.now() - (105 - i) * 3600 * 1000),
      expiresAt: new Date(Date.now() - (104 - i) * 3600 * 1000),
      status: 'USED'
    });

    const booking = await Booking.create({
      bookingReference: `FR-HIST-${(1000 + i)}`,
      passengerId: passenger._id,
      driverId: driver._id,
      vehicleId: driver.vehicleId,
      fareLockId: lock._id,
      state: 'PAYMENT_COMPLETED',
      vehicleCategory: 'SEDAN',
      tripType: 'ONE_WAY',
      pickup: {
        type: 'Point',
        coordinates: pickup.coords,
        address: pickup.name,
        city: 'Hyderabad',
        pickupPointType: 'GATE'
      },
      destination: {
        type: 'Point',
        coordinates: dest.coords,
        address: dest.name,
        city: 'Hyderabad'
      },
      verificationPin: '4821',
      distanceKm: dist,
      estimatedDurationMin: dur,
      lockedFare: fare,
      finalFare: fare,
      paymentMethod: i % 2 === 0 ? 'UPI' : 'CARD',
      paymentStatus: 'SUCCESS',
      timeline: [
        { event: 'BOOKING_CREATED', actor: 'PASSENGER', timestamp: new Date(Date.now() - 3600000) },
        { event: 'DRIVER_ACCEPTED', actor: 'DRIVER', timestamp: new Date(Date.now() - 3400000) },
        { event: 'TRIP_STARTED', actor: 'DRIVER', timestamp: new Date(Date.now() - 2500000) },
        { event: 'TRIP_COMPLETED', actor: 'DRIVER', timestamp: new Date(Date.now() - 1000000) },
        { event: 'PAYMENT_COMPLETED', actor: 'SYSTEM', timestamp: new Date(Date.now() - 950000) }
      ],
      passengerRating: 5,
      driverRating: 5,
      createdAt: new Date(Date.now() - (105 - i) * 3600 * 1000)
    });

    await FareAudit.create({
      bookingId: booking._id,
      passengerId: passenger._id,
      driverId: driver._id,
      originalLockedFare: fare,
      finalFare: fare,
      difference: 0,
      breakdown: lock.breakdown,
      adjustments: [],
      status: 'VERIFIED_MATCH',
      receiptReference: `FR-REC-${booking.bookingReference}`
    });
  }

  // 6. Create sample disputes & safety incidents
  const sampleBooking = await Booking.findOne();
  if (sampleBooking) {
    await Dispute.create({
      disputeNumber: 'DISP-DEMO-001',
      bookingId: sampleBooking._id,
      passengerId: sampleBooking.passengerId,
      driverId: sampleBooking.driverId,
      category: 'DRIVER_DEMANDED_EXTRA_MONEY',
      description: 'Driver insisted on ₹150 additional cash for AC on arrival. I refused and showed the Fare Lock screen.',
      demandedAmount: 150,
      evidence: {
        lockedFare: sampleBooking.lockedFare,
        actualFare: sampleBooking.finalFare || sampleBooking.lockedFare,
        bookingReference: sampleBooking.bookingReference,
        eventsTimeline: [
          { event: 'DRIVER_ACCEPTED', actor: 'DRIVER', timestamp: new Date() },
          { event: 'PASSENGER_REPORTED_EXTRA_CASH', actor: 'PASSENGER', timestamp: new Date() }
        ],
        gpsTrackPointsCount: 42,
        routeDeviationFlagged: false
      },
      status: 'UNDER_REVIEW'
    });

    await SafetyIncident.create({
      incidentNumber: 'SOS-DEMO-001',
      bookingId: sampleBooking._id,
      passengerId: sampleBooking.passengerId,
      driverId: sampleBooking.driverId,
      priority: 'HIGH',
      triggerType: 'ROUTE_DEVIATION',
      currentLocation: {
        type: 'Point',
        coordinates: [78.3650, 17.4120]
      },
      addressAtIncident: 'Outer Ring Road Service Lane Deviation (720m from calculated route)',
      status: 'INVESTIGATING',
      notes: [
        {
          author: 'Safety Automation',
          text: 'Route Guardian auto-flagged 720m deviation. Safety operator connected with driver.',
          timestamp: new Date()
        }
      ]
    });

    await FraudAlert.create({
      userId: passengers[1]._id,
      userRole: 'PASSENGER',
      category: 'REFERRAL_ABUSE',
      riskLevel: 'REVIEW',
      confidenceScore: 0.65,
      evidenceSummary: '3 referrals created from same hardware MAC fingerprint within 2 hours',
      metadata: { accountsCount: 3, deviceId: 'DEV-ARM-9812-XYZ' },
      status: 'PENDING_REVIEW'
    });
  }

  console.log('[Seed] Seeding completed successfully!');
  console.log('====================================================');
  console.log('  FAIRRIDE DEMO CREDENTIALS:');
  console.log('  Passenger: passenger@fairride.local / Password@123');
  console.log('  Driver:    driver@fairride.local    / Password@123');
  console.log('  Admin:     admin@fairride.local     / Password@123');
  console.log('  Corporate: corporate@fairride.local / Password@123');
  console.log('====================================================');

  if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
    await disconnectDB();
  }
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
