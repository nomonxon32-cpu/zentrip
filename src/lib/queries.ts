import { Prisma, VehicleStatus } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

import { hasAvailabilityConflict } from "@/lib/availability";
import { db } from "@/lib/db";
import { normalizeCityParam } from "@/lib/utils";

const vehicleCardInclude = {
  photos: {
    orderBy: { sortOrder: "asc" as const },
    take: 4,
  },
  owner: {
    select: {
      id: true,
      name: true,
      city: true,
      avatarUrl: true,
      isSuspended: true,
      reviewsReceived: {
        select: { rating: true },
      },
    },
  },
  favorites: {
    select: {
      userId: true,
    },
  },
  reviews: {
    select: {
      rating: true,
    },
  },
  bookings: {
    select: {
      startDate: true,
      endDate: true,
      status: true,
    },
  },
  availabilityBlocks: {
    select: {
      startDate: true,
      endDate: true,
      reason: true,
    },
  },
} satisfies Prisma.VehicleInclude;

export type VehicleCardRecord = Prisma.VehicleGetPayload<{
  include: typeof vehicleCardInclude;
}>;

export type SearchFilter =
  | "all"
  | "airports"
  | "monthly"
  | "nearby"
  | "delivered"
  | "cities";

export function withVehicleMetrics(
  vehicle: VehicleCardRecord,
  options?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string | null;
  },
) {
  const reviewCount = vehicle.reviews.length;
  const averageRating =
    reviewCount > 0
      ? vehicle.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  const isAvailable =
    options?.startDate && options?.endDate
      ? !hasAvailabilityConflict({
          startDate: options.startDate,
          endDate: options.endDate,
          bookings: vehicle.bookings,
          blocks: vehicle.availabilityBlocks,
        })
      : true;

  return {
    ...vehicle,
    averageRating,
    reviewCount,
    isAvailable,
    isFavorited: options?.userId ? vehicle.favorites.some((favorite) => favorite.userId === options.userId) : false,
  };
}

export async function getFeaturedVehicles(options?: {
  city?: string;
  userId?: string | null;
  limit?: number;
}) {
  const city = normalizeCityParam(options?.city);
  const vehicles = await db.vehicle.findMany({
    where: {
      status: VehicleStatus.ACTIVE,
      owner: {
        isSuspended: false,
      },
      city: city || undefined,
    },
    include: vehicleCardInclude,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 6,
  });

  return vehicles.map((vehicle) =>
    withVehicleMetrics(vehicle, {
      userId: options?.userId,
    }),
  );
}

export async function getCityBrowseSummary() {
  const vehicles = await db.vehicle.findMany({
    where: {
      status: VehicleStatus.ACTIVE,
      owner: {
        isSuspended: false,
      },
    },
    select: {
      city: true,
    },
  });

  const counts = vehicles.reduce<Record<string, number>>((summary, vehicle) => {
    summary[vehicle.city] = (summary[vehicle.city] ?? 0) + 1;
    return summary;
  }, {});

  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export async function searchVehicles(filters: {
  location?: string;
  city?: string;
  q?: string;
  startDate?: Date;
  endDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  sort?: "price-asc" | "price-desc" | "rating" | "newest";
  filter?: SearchFilter;
  userId?: string | null;
}) {
  const normalizedLocation = normalizeCityParam(filters.location ?? filters.city) ?? filters.location ?? filters.city;
  const normalizedQuery = filters.q?.trim().toLowerCase();
  const queryFilter = filters.filter ?? "all";

  const vehicles = await db.vehicle.findMany({
    where: {
      status: VehicleStatus.ACTIVE,
      owner: {
        isSuspended: false,
      },
      dailyPrice: {
        gte: filters.minPrice || undefined,
        lte: filters.maxPrice || undefined,
      },
      category: filters.category
        ? (filters.category as Prisma.EnumVehicleCategoryFilter["equals"])
        : undefined,
      transmission: filters.transmission
        ? (filters.transmission as Prisma.EnumTransmissionFilter["equals"])
        : undefined,
      fuelType: filters.fuelType
        ? (filters.fuelType as Prisma.EnumFuelTypeFilter["equals"])
        : undefined,
      seats: filters.seats ? { gte: filters.seats } : undefined,
      airportPickupAvailable: queryFilter === "airports" ? true : undefined,
      deliveryAvailable: queryFilter === "delivered" ? true : undefined,
      monthlyAvailable: queryFilter === "monthly" ? true : undefined,
    },
    include: vehicleCardInclude,
    orderBy:
      filters.sort === "price-asc"
        ? { dailyPrice: "asc" }
        : filters.sort === "price-desc"
          ? { dailyPrice: "desc" }
          : { createdAt: "desc" },
  });

  const filteredByLocation = normalizedLocation
    ? vehicles.filter((vehicle) => matchesLocation(vehicle, normalizedLocation))
    : vehicles;

  const filteredByQuery = normalizedQuery
    ? filteredByLocation.filter((vehicle) => {
        const haystacks = [
          vehicle.make,
          vehicle.model,
          `${vehicle.make} ${vehicle.model}`,
          vehicle.category,
        ];

        return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
      })
    : filteredByLocation;

  const decorated = filteredByQuery.map((vehicle) =>
    withVehicleMetrics(vehicle, {
      startDate: filters.startDate,
      endDate: filters.endDate,
      userId: filters.userId,
    }),
  );

  let filtered =
    filters.startDate && filters.endDate
      ? decorated.filter((vehicle) => vehicle.isAvailable)
      : decorated;

  if (queryFilter === "nearby" && normalizedLocation) {
    filtered = filtered.filter((vehicle) => matchesLocation(vehicle, normalizedLocation));
  }

  const rentalDays =
    filters.startDate && filters.endDate
      ? Math.max(1, differenceInCalendarDays(filters.endDate, filters.startDate))
      : 0;

  if (filters.sort === "rating") {
    filtered = [...filtered].sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
  }

  if (queryFilter === "monthly" || rentalDays >= 28) {
    filtered = [...filtered].sort((a, b) => {
      if (a.monthlyAvailable === b.monthlyAvailable) {
        return a.dailyPrice - b.dailyPrice;
      }

      return a.monthlyAvailable ? -1 : 1;
    });
  }

  return filtered;
}

export async function getVehicleDetail(id: string) {
  return db.vehicle.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
      },
      owner: {
        include: {
          reviewsReceived: {
            select: { rating: true },
          },
        },
      },
      reviews: {
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      bookings: {
        select: {
          startDate: true,
          endDate: true,
          status: true,
        },
      },
      availabilityBlocks: {
        orderBy: {
          startDate: "asc",
        },
      },
      favorites: {
        select: {
          userId: true,
        },
      },
    },
  });
}

function matchesLocation(
  vehicle: Pick<VehicleCardRecord, "city" | "address">,
  location: string,
) {
  const normalizedQuery = location.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return [vehicle.city, vehicle.address]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}
