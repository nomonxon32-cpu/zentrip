import bcrypt from "bcrypt";
import {
  BookingPaymentStatus,
  BookingStatus,
  DocumentType,
  FuelType,
  KycStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PrismaClient,
  Role,
  Transmission,
  VehicleCategory,
  VehicleStatus,
  DisputeStatus,
} from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.emailVerificationToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.availabilityBlock.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, ownerPassword, owner2Password, renterPassword, renter2Password, renter3Password] =
    await Promise.all([
      bcrypt.hash("Admin123!", 10),
      bcrypt.hash("Owner123!", 10),
      bcrypt.hash("Owner234!", 10),
      bcrypt.hash("Renter123!", 10),
      bcrypt.hash("Renter234!", 10),
      bcrypt.hash("Renter345!", 10),
    ]);

  const admin = await prisma.user.create({
    data: {
      name: "Zentrip Admin",
      email: "admin@uzcar.uz",
      phone: "+998 90 000 00 01",
      emailVerifiedAt: new Date(),
      passwordHash: adminPassword,
      role: Role.ADMIN,
      city: "Tashkent",
      kycStatus: KycStatus.APPROVED,
    },
  });

  const ownerDemo = await prisma.user.create({
    data: {
      name: "Jasur Mirzayev",
      email: "owner@uzcar.uz",
      phone: "+998 90 111 22 33",
      emailVerifiedAt: new Date(),
      passwordHash: ownerPassword,
      role: Role.OWNER,
      city: "Tashkent",
      bio: "Professional host with executive sedans and family SUVs.",
      kycStatus: KycStatus.APPROVED,
    },
  });

  const ownerTwo = await prisma.user.create({
    data: {
      name: "Dilshod Karimov",
      email: "owner2@uzcar.uz",
      phone: "+998 93 444 55 66",
      emailVerifiedAt: new Date(),
      passwordHash: owner2Password,
      role: Role.OWNER,
      city: "Samarkand",
      bio: "Samarkand-based host focused on premium city and tourism rentals.",
      kycStatus: KycStatus.APPROVED,
    },
  });

  const renterDemo = await prisma.user.create({
    data: {
      name: "Aziza Ismailova",
      email: "renter@uzcar.uz",
      phone: "+998 97 777 88 99",
      emailVerifiedAt: new Date(),
      passwordHash: renterPassword,
      role: Role.RENTER,
      city: "Tashkent",
      bio: "Consultant who often rents for business trips and family weekends.",
      kycStatus: KycStatus.APPROVED,
    },
  });

  const renterTwo = await prisma.user.create({
    data: {
      name: "Bekzod Rasulov",
      email: "renter2@uzcar.uz",
      phone: "+998 90 222 33 44",
      emailVerifiedAt: new Date(),
      passwordHash: renter2Password,
      role: Role.RENTER,
      city: "Bukhara",
      kycStatus: KycStatus.PENDING,
    },
  });

  const renterThree = await prisma.user.create({
    data: {
      name: "Madina Sobirova",
      email: "renter3@uzcar.uz",
      phone: "+998 91 555 66 77",
      emailVerifiedAt: new Date(),
      passwordHash: renter3Password,
      role: Role.RENTER,
      city: "Fergana",
      kycStatus: KycStatus.REJECTED,
      isSuspended: false,
    },
  });

  await prisma.kycDocument.createMany({
    data: [
      {
        userId: ownerDemo.id,
        documentType: DocumentType.PASSPORT,
        frontImageUrl: "/uploads/seed-passport.svg",
        status: KycStatus.APPROVED,
      },
      {
        userId: ownerDemo.id,
        documentType: DocumentType.DRIVER_LICENSE,
        frontImageUrl: "/uploads/seed-license.svg",
        status: KycStatus.APPROVED,
      },
      {
        userId: ownerTwo.id,
        documentType: DocumentType.ID_CARD,
        frontImageUrl: "/uploads/seed-id-card.svg",
        status: KycStatus.APPROVED,
      },
      {
        userId: ownerTwo.id,
        documentType: DocumentType.DRIVER_LICENSE,
        frontImageUrl: "/uploads/seed-license.svg",
        status: KycStatus.APPROVED,
      },
      {
        userId: renterDemo.id,
        documentType: DocumentType.PASSPORT,
        frontImageUrl: "/uploads/seed-passport.svg",
        status: KycStatus.APPROVED,
      },
      {
        userId: renterDemo.id,
        documentType: DocumentType.DRIVER_LICENSE,
        frontImageUrl: "/uploads/seed-license.svg",
        status: KycStatus.APPROVED,
      },
      {
        userId: renterTwo.id,
        documentType: DocumentType.ID_CARD,
        frontImageUrl: "/uploads/seed-id-card.svg",
        status: KycStatus.PENDING,
      },
      {
        userId: renterThree.id,
        documentType: DocumentType.PASSPORT,
        frontImageUrl: "/uploads/seed-passport.svg",
        status: KycStatus.REJECTED,
        rejectionReason: "Passport image is too blurry. Please upload a sharper scan.",
      },
    ],
  });

  const vehicleDefinitions = [
    {
      ownerId: ownerDemo.id,
      make: "Chevrolet",
      model: "Cobalt",
      year: 2023,
      category: VehicleCategory.SEDAN,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seats: 5,
      city: "Tashkent",
      address: "Mirabad district, Tashkent",
      dailyPrice: 390000,
      monthlyPrice: 8500000,
      depositAmount: 1200000,
      description: "Comfortable daily sedan for city and airport trips with a clean, modern interior.",
      rules: "No smoking. Return with the same fuel level. City trips only after 11pm.",
      mileageLimitPerDay: 250,
      plateNumber: "01 A 123 BC",
      hasOsago: true,
      hasCasco: true,
      airportPickupAvailable: true,
      deliveryAvailable: true,
      monthlyAvailable: true,
      instantBook: false,
      pickupInstructions: "Available from Tashkent airport parking or central hotel pickup.",
      deliveryFee: 90000,
      status: VehicleStatus.ACTIVE,
      photoUrls: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=80"],
      blocks: [{ startDate: addDays(new Date(), 18), endDate: addDays(new Date(), 20), reason: "Scheduled maintenance" }],
    },
    {
      ownerId: ownerTwo.id,
      make: "Toyota",
      model: "Camry",
      year: 2022,
      category: VehicleCategory.PREMIUM,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      seats: 5,
      city: "Samarkand",
      address: "Registan area, Samarkand",
      dailyPrice: 720000,
      monthlyPrice: null,
      depositAmount: 2200000,
      description: "Executive sedan popular for weddings, VIP transfers, and longer road journeys.",
      rules: "No pets. Driver license required at pickup. Speeding fines are renter responsibility.",
      mileageLimitPerDay: 220,
      plateNumber: "30 B 777 AA",
      hasOsago: true,
      hasCasco: true,
      airportPickupAvailable: true,
      deliveryAvailable: true,
      monthlyAvailable: false,
      instantBook: true,
      pickupInstructions: "Airport and Registan hotel handoff available with notice.",
      deliveryFee: 120000,
      status: VehicleStatus.ACTIVE,
      photoUrls: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"],
      blocks: [],
    },
    {
      ownerId: ownerDemo.id,
      make: "Kia",
      model: "Sportage",
      year: 2024,
      category: VehicleCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seats: 5,
      city: "Bukhara",
      address: "Old town pickup point, Bukhara",
      dailyPrice: 650000,
      monthlyPrice: 16500000,
      depositAmount: 1800000,
      description: "Premium crossover for family trips, historical city touring, and highway comfort.",
      rules: "No smoking. Sand road use must be disclosed. Keep interior clean.",
      mileageLimitPerDay: 260,
      plateNumber: "80 C 850 BO",
      hasOsago: true,
      hasCasco: true,
      airportPickupAvailable: false,
      deliveryAvailable: true,
      monthlyAvailable: true,
      instantBook: false,
      pickupInstructions: "Can be delivered to select old-town hotels.",
      deliveryFee: 100000,
      status: VehicleStatus.ACTIVE,
      photoUrls: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1400&q=80"],
      blocks: [],
    },
    {
      ownerId: ownerTwo.id,
      make: "Hyundai",
      model: "Elantra",
      year: 2021,
      category: VehicleCategory.ECONOMY,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seats: 5,
      city: "Fergana",
      address: "Central boulevard, Fergana",
      dailyPrice: 330000,
      monthlyPrice: null,
      depositAmount: 900000,
      description: "Affordable and well-kept compact sedan designed for everyday city mobility.",
      rules: "Return washed for trips longer than five days.",
      mileageLimitPerDay: 240,
      plateNumber: "15 H 141 AD",
      hasOsago: true,
      hasCasco: false,
      airportPickupAvailable: false,
      deliveryAvailable: false,
      monthlyAvailable: false,
      instantBook: true,
      pickupInstructions: null,
      deliveryFee: null,
      status: VehicleStatus.ACTIVE,
      photoUrls: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80"],
      blocks: [{ startDate: addDays(new Date(), 6), endDate: addDays(new Date(), 8), reason: "Family use" }],
    },
    {
      ownerId: ownerDemo.id,
      make: "Mercedes",
      model: "Vito",
      year: 2020,
      category: VehicleCategory.VAN,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seats: 8,
      city: "Tashkent",
      address: "Chilanzar district, Tashkent",
      dailyPrice: 880000,
      monthlyPrice: null,
      depositAmount: 2500000,
      description: "High-capacity premium van perfect for airport runs, production teams, and group travel.",
      rules: "Intercity trips allowed with advance notice. No cargo transport.",
      mileageLimitPerDay: 300,
      plateNumber: "01 V 888 TT",
      hasOsago: true,
      hasCasco: true,
      airportPickupAvailable: true,
      deliveryAvailable: true,
      monthlyAvailable: false,
      instantBook: false,
      pickupInstructions: "Chilanzar or airport pickup available for group trips.",
      deliveryFee: 150000,
      status: VehicleStatus.ACTIVE,
      photoUrls: ["https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1400&q=80"],
      blocks: [],
    },
    {
      ownerId: ownerTwo.id,
      make: "BYD",
      model: "Han EV",
      year: 2025,
      category: VehicleCategory.ELECTRIC,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.ELECTRIC,
      seats: 5,
      city: "Samarkand",
      address: "Silk Road tourism zone, Samarkand",
      dailyPrice: 970000,
      monthlyPrice: 23800000,
      depositAmount: 2800000,
      description: "High-end electric flagship with long range and a quiet luxury cabin.",
      rules: "Fast charging only. Keep charge above 20% before return.",
      mileageLimitPerDay: 280,
      plateNumber: "30 E 808 EV",
      hasOsago: true,
      hasCasco: true,
      airportPickupAvailable: false,
      deliveryAvailable: false,
      monthlyAvailable: true,
      instantBook: true,
      pickupInstructions: "Meet near the Silk Road tourism zone charging hub.",
      deliveryFee: null,
      status: VehicleStatus.ACTIVE,
      photoUrls: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80"],
      blocks: [],
    },
    {
      ownerId: ownerDemo.id,
      make: "Lexus",
      model: "RX",
      year: 2023,
      category: VehicleCategory.PREMIUM,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      seats: 5,
      city: "Bukhara",
      address: "Airport road pickup point, Bukhara",
      dailyPrice: 1050000,
      monthlyPrice: null,
      depositAmount: 3000000,
      description: "Premium SUV pending admin review, aimed at luxury tourism and executive use.",
      rules: "No smoking. Highway tolls are the renter's responsibility.",
      mileageLimitPerDay: 240,
      plateNumber: "80 L 900 RX",
      hasOsago: true,
      hasCasco: true,
      airportPickupAvailable: true,
      deliveryAvailable: false,
      monthlyAvailable: false,
      instantBook: false,
      pickupInstructions: "Available near Bukhara airport road after approval.",
      deliveryFee: null,
      status: VehicleStatus.PENDING_REVIEW,
      photoUrls: ["/uploads/vehicles/1779493767971-9d1a8aac-ed7b-478e-b966-f352b3348c89.jpg"],
      blocks: [],
    },
    {
      ownerId: ownerTwo.id,
      make: "Daewoo",
      model: "Gentra",
      year: 2019,
      category: VehicleCategory.SEDAN,
      transmission: Transmission.MANUAL,
      fuelType: FuelType.GAS,
      seats: 5,
      city: "Fergana",
      address: "Margilan road, Fergana",
      dailyPrice: 280000,
      monthlyPrice: null,
      depositAmount: 700000,
      description: "Affordable manual sedan ready for approval as a practical option in the Fergana valley.",
      rules: "No off-road use. Return before midnight unless agreed.",
      mileageLimitPerDay: 220,
      plateNumber: "15 G 909 GN",
      hasOsago: true,
      hasCasco: false,
      airportPickupAvailable: false,
      deliveryAvailable: true,
      monthlyAvailable: false,
      instantBook: false,
      pickupInstructions: "Delivery possible around Fergana and Margilan.",
      deliveryFee: 70000,
      status: VehicleStatus.PENDING_REVIEW,
      photoUrls: ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"],
      blocks: [],
    },
  ];

  const vehicles = [];
  for (const definition of vehicleDefinitions) {
    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: definition.ownerId,
        make: definition.make,
        model: definition.model,
        year: definition.year,
        category: definition.category,
        transmission: definition.transmission,
        fuelType: definition.fuelType,
        seats: definition.seats,
        city: definition.city,
        address: definition.address,
        dailyPrice: definition.dailyPrice,
        monthlyPrice: definition.monthlyPrice ?? null,
        depositAmount: definition.depositAmount,
        description: definition.description,
        rules: definition.rules,
        mileageLimitPerDay: definition.mileageLimitPerDay,
        plateNumber: definition.plateNumber,
        hasOsago: definition.hasOsago,
        hasCasco: definition.hasCasco,
        airportPickupAvailable: definition.airportPickupAvailable,
        deliveryAvailable: definition.deliveryAvailable,
        monthlyAvailable: definition.monthlyAvailable,
        instantBook: definition.instantBook,
        pickupInstructions: definition.pickupInstructions,
        deliveryFee: definition.deliveryFee,
        status: definition.status,
        photos: {
          create: definition.photoUrls.map((url, index) => ({ url, sortOrder: index })),
        },
        availabilityBlocks: {
          create: definition.blocks,
        },
      },
    });
    vehicles.push(vehicle);
  }

  const [
    vehicleCobalt,
    vehicleCamry,
    vehicleSportage,
    vehicleElantra,
    vehicleVito,
    vehicleByd,
  ] = vehicles;

  await prisma.favorite.createMany({
    data: [
      {
        userId: renterDemo.id,
        vehicleId: vehicleCobalt.id,
      },
      {
        userId: renterDemo.id,
        vehicleId: vehicleCamry.id,
      },
      {
        userId: renterTwo.id,
        vehicleId: vehicleSportage.id,
      },
    ],
  });

  const completedBooking = await prisma.booking.create({
    data: {
      vehicleId: vehicleCobalt.id,
      renterId: renterDemo.id,
      ownerId: ownerDemo.id,
      startDate: subDays(new Date(), 16),
      endDate: subDays(new Date(), 12),
      days: 4,
      dailyPrice: vehicleCobalt.dailyPrice,
      rentalAmount: 1560000,
      serviceFee: 187200,
      depositAmount: vehicleCobalt.depositAmount,
      totalAmount: 2947200,
      status: BookingStatus.COMPLETED,
      paymentStatus: BookingPaymentStatus.PAID,
      pickupNotes: "Met at Tashkent airport parking.",
      returnNotes: "Returned clean with full fuel.",
    },
  });

  const pendingApprovalBooking = await prisma.booking.create({
    data: {
      vehicleId: vehicleCobalt.id,
      renterId: renterDemo.id,
      ownerId: ownerDemo.id,
      startDate: addDays(new Date(), 10),
      endDate: addDays(new Date(), 13),
      days: 3,
      dailyPrice: vehicleCobalt.dailyPrice,
      rentalAmount: 1170000,
      serviceFee: 140400,
      depositAmount: vehicleCobalt.depositAmount,
      totalAmount: 2510400,
      pickupLocation: "Tashkent International Airport",
      startTime: "10:00",
      endTime: "18:00",
      status: BookingStatus.PENDING_OWNER_APPROVAL,
      paymentStatus: BookingPaymentStatus.PAID,
      pickupNotes: "Please arrange airport pickup if possible.",
    },
  });

  const confirmedBooking = await prisma.booking.create({
    data: {
      vehicleId: vehicleSportage.id,
      renterId: renterTwo.id,
      ownerId: ownerDemo.id,
      startDate: addDays(new Date(), 5),
      endDate: addDays(new Date(), 8),
      days: 3,
      dailyPrice: vehicleSportage.dailyPrice,
      rentalAmount: 1950000,
      serviceFee: 234000,
      depositAmount: vehicleSportage.depositAmount,
      totalAmount: 3984000,
      status: BookingStatus.CONFIRMED,
      paymentStatus: BookingPaymentStatus.PAID,
    },
  });

  const activeBooking = await prisma.booking.create({
    data: {
      vehicleId: vehicleElantra.id,
      renterId: renterDemo.id,
      ownerId: ownerTwo.id,
      startDate: subDays(new Date(), 1),
      endDate: addDays(new Date(), 2),
      days: 3,
      dailyPrice: vehicleElantra.dailyPrice,
      rentalAmount: 990000,
      serviceFee: 118800,
      depositAmount: vehicleElantra.depositAmount,
      totalAmount: 2008800,
      status: BookingStatus.ACTIVE,
      paymentStatus: BookingPaymentStatus.PAID,
      pickupNotes: "Renter collected keys in person.",
    },
  });

  const cancelledBooking = await prisma.booking.create({
    data: {
      vehicleId: vehicleVito.id,
      renterId: renterDemo.id,
      ownerId: ownerDemo.id,
      startDate: addDays(new Date(), 14),
      endDate: addDays(new Date(), 16),
      days: 2,
      dailyPrice: vehicleVito.dailyPrice,
      rentalAmount: 1760000,
      serviceFee: 211200,
      depositAmount: vehicleVito.depositAmount,
      totalAmount: 4471200,
      status: BookingStatus.CANCELLED,
      paymentStatus: BookingPaymentStatus.REFUNDED,
      cancellationReason: "Renter itinerary changed.",
    },
  });

  const disputedBooking = await prisma.booking.create({
    data: {
      vehicleId: vehicleByd.id,
      renterId: renterTwo.id,
      ownerId: ownerTwo.id,
      startDate: subDays(new Date(), 9),
      endDate: subDays(new Date(), 6),
      days: 3,
      dailyPrice: vehicleByd.dailyPrice,
      rentalAmount: 2910000,
      serviceFee: 349200,
      depositAmount: vehicleByd.depositAmount,
      totalAmount: 6059200,
      status: BookingStatus.DISPUTED,
      paymentStatus: BookingPaymentStatus.PAID,
      pickupNotes: "Delivered to hotel lobby.",
    },
  });

  await prisma.payment.createMany({
    data: [
      {
        bookingId: completedBooking.id,
        userId: renterDemo.id,
        amount: completedBooking.rentalAmount + completedBooking.serviceFee,
        type: PaymentType.RENTAL_PAYMENT,
        method: PaymentMethod.UZCARD,
        status: PaymentStatus.SUCCESS,
        providerReference: "MOCK-COMPLETE-1",
      },
      {
        bookingId: completedBooking.id,
        userId: renterDemo.id,
        amount: completedBooking.depositAmount,
        type: PaymentType.DEPOSIT_HOLD,
        method: PaymentMethod.UZCARD,
        status: PaymentStatus.RELEASED,
        providerReference: "MOCK-COMPLETE-DEP-1",
      },
      {
        bookingId: completedBooking.id,
        userId: ownerDemo.id,
        amount: completedBooking.rentalAmount - completedBooking.serviceFee,
        type: PaymentType.PAYOUT,
        method: PaymentMethod.UZCARD,
        status: PaymentStatus.SUCCESS,
        providerReference: "MOCK-PAYOUT-1",
      },
      {
        bookingId: pendingApprovalBooking.id,
        userId: renterDemo.id,
        amount: pendingApprovalBooking.rentalAmount + pendingApprovalBooking.serviceFee,
        type: PaymentType.RENTAL_PAYMENT,
        method: PaymentMethod.PAYME,
        status: PaymentStatus.SUCCESS,
        providerReference: "MOCK-PENDING-1",
      },
      {
        bookingId: pendingApprovalBooking.id,
        userId: renterDemo.id,
        amount: pendingApprovalBooking.depositAmount,
        type: PaymentType.DEPOSIT_HOLD,
        method: PaymentMethod.PAYME,
        status: PaymentStatus.HELD,
        providerReference: "MOCK-PENDING-DEP-1",
      },
      {
        bookingId: confirmedBooking.id,
        userId: renterTwo.id,
        amount: confirmedBooking.rentalAmount + confirmedBooking.serviceFee,
        type: PaymentType.RENTAL_PAYMENT,
        method: PaymentMethod.CLICK,
        status: PaymentStatus.SUCCESS,
        providerReference: "MOCK-CONFIRMED-1",
      },
      {
        bookingId: confirmedBooking.id,
        userId: renterTwo.id,
        amount: confirmedBooking.depositAmount,
        type: PaymentType.DEPOSIT_HOLD,
        method: PaymentMethod.CLICK,
        status: PaymentStatus.HELD,
        providerReference: "MOCK-CONFIRMED-DEP-1",
      },
      {
        bookingId: activeBooking.id,
        userId: renterDemo.id,
        amount: activeBooking.rentalAmount + activeBooking.serviceFee,
        type: PaymentType.RENTAL_PAYMENT,
        method: PaymentMethod.HUMO,
        status: PaymentStatus.SUCCESS,
        providerReference: "MOCK-ACTIVE-1",
      },
      {
        bookingId: activeBooking.id,
        userId: renterDemo.id,
        amount: activeBooking.depositAmount,
        type: PaymentType.DEPOSIT_HOLD,
        method: PaymentMethod.HUMO,
        status: PaymentStatus.HELD,
        providerReference: "MOCK-ACTIVE-DEP-1",
      },
      {
        bookingId: cancelledBooking.id,
        userId: renterDemo.id,
        amount: cancelledBooking.rentalAmount + cancelledBooking.serviceFee,
        type: PaymentType.RENTAL_PAYMENT,
        method: PaymentMethod.VISA,
        status: PaymentStatus.REFUNDED,
        providerReference: "MOCK-CANCELLED-1",
      },
      {
        bookingId: cancelledBooking.id,
        userId: renterDemo.id,
        amount: cancelledBooking.depositAmount,
        type: PaymentType.DEPOSIT_HOLD,
        method: PaymentMethod.VISA,
        status: PaymentStatus.RELEASED,
        providerReference: "MOCK-CANCELLED-DEP-1",
      },
      {
        bookingId: cancelledBooking.id,
        userId: renterDemo.id,
        amount: cancelledBooking.rentalAmount + cancelledBooking.serviceFee,
        type: PaymentType.REFUND,
        method: PaymentMethod.VISA,
        status: PaymentStatus.REFUNDED,
        providerReference: "MOCK-REFUND-1",
      },
      {
        bookingId: disputedBooking.id,
        userId: renterTwo.id,
        amount: disputedBooking.rentalAmount + disputedBooking.serviceFee,
        type: PaymentType.RENTAL_PAYMENT,
        method: PaymentMethod.MASTERCARD,
        status: PaymentStatus.SUCCESS,
        providerReference: "MOCK-DISPUTE-1",
      },
      {
        bookingId: disputedBooking.id,
        userId: renterTwo.id,
        amount: disputedBooking.depositAmount,
        type: PaymentType.DEPOSIT_HOLD,
        method: PaymentMethod.MASTERCARD,
        status: PaymentStatus.HELD,
        providerReference: "MOCK-DISPUTE-DEP-1",
      },
    ],
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      vehicleId: vehicleCobalt.id,
      authorId: renterDemo.id,
      receiverId: ownerDemo.id,
      rating: 5,
      comment: "Smooth pickup, spotless car, and very responsive host. Ideal for a business trip in Tashkent.",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        bookingId: pendingApprovalBooking.id,
        senderId: renterDemo.id,
        receiverId: ownerDemo.id,
        content: "Hi, I land at 10:30. Is airport pickup possible?",
      },
      {
        bookingId: pendingApprovalBooking.id,
        senderId: ownerDemo.id,
        receiverId: renterDemo.id,
        content: "Yes, I can arrange airport pickup once the booking is approved.",
      },
      {
        bookingId: activeBooking.id,
        senderId: ownerTwo.id,
        receiverId: renterDemo.id,
        content: "Please remember the vehicle needs at least 20% fuel on return.",
      },
      {
        bookingId: activeBooking.id,
        senderId: renterDemo.id,
        receiverId: ownerTwo.id,
        content: "Understood. Everything is going smoothly so far.",
      },
    ],
  });

  await prisma.dispute.create({
    data: {
      bookingId: disputedBooking.id,
      openedById: renterTwo.id,
      reason: "Deposit release delay",
      description: "Renter reported that the deposit should be released after return, but there is an unresolved damage discussion.",
      status: DisputeStatus.OPEN,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: ownerTwo.id,
        type: "BOOKING_REQUEST",
        title: "New booking request",
        message: "Aziza Ismailova requested Toyota Camry for three days.",
      },
      {
        userId: ownerDemo.id,
        type: "REVIEW",
        title: "New review received",
        message: "Aziza Ismailova left a 5-star review.",
      },
      {
        userId: admin.id,
        type: "LISTING_REVIEW",
        title: "Two listings pending review",
        message: "Lexus RX and Daewoo Gentra are waiting for moderation.",
      },
    ],
  });

  console.log("Seed completed");
  console.log("Admin:", admin.email, "Admin123!");
  console.log("Owner:", ownerDemo.email, "Owner123!");
  console.log("Renter:", renterDemo.email, "Renter123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
