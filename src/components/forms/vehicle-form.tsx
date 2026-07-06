"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FuelType, Transmission, VehicleCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLocale } from "@/components/providers";
import { UploadBox } from "@/components/upload-box";
import { CITIES } from "@/lib/constants";
import { getLegalUi } from "@/lib/legal";
import { vehicleListingSchema } from "@/lib/validators";

type VehicleValues = z.infer<typeof vehicleListingSchema>;

const defaultVehicleValues: VehicleValues = {
  make: "",
  model: "",
  year: 2022,
  category: VehicleCategory.SEDAN,
  transmission: Transmission.AUTOMATIC,
  fuelType: FuelType.PETROL,
  seats: 5,
  city: "Tashkent",
  address: "",
  latitude: null,
  longitude: null,
  dailyPrice: 350000,
  monthlyPrice: null,
  depositAmount: 1000000,
  description: "",
  rules: "",
  mileageLimitPerDay: 250,
  plateNumber: "",
  hasOsago: false,
  hasCasco: false,
  airportPickupAvailable: false,
  deliveryAvailable: false,
  monthlyAvailable: false,
  instantBook: false,
  pickupInstructions: "",
  deliveryFee: null,
  photoUrls: [],
  availabilityBlocks: [],
};

export function VehicleForm({
  mode,
  vehicleId,
  initialValues,
}: {
  mode: "create" | "edit";
  vehicleId?: string;
  initialValues?: Partial<VehicleValues>;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const legal = getLegalUi(locale);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<VehicleValues>({
    resolver: zodResolver(vehicleListingSchema),
    defaultValues: {
      ...defaultVehicleValues,
      acceptedTerms: mode === "edit",
      ...initialValues,
    },
  });

  const photoUrls = useWatch({ control, name: "photoUrls" }) ?? [];
  const deliveryAvailable = useWatch({ control, name: "deliveryAvailable" });
  const monthlyAvailable = useWatch({ control, name: "monthlyAvailable" });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "availabilityBlocks",
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          if (mode === "create" && values.acceptedTerms !== true) {
            setError("acceptedTerms", { type: "manual", message: legal.listingAgreementError });
            return;
          }

          setIsSubmitting(true);
          const payload = {
            ...values,
            pickupInstructions: values.pickupInstructions?.trim() ? values.pickupInstructions.trim() : null,
            deliveryFee:
              values.deliveryAvailable && Number.isFinite(values.deliveryFee)
                ? values.deliveryFee
                : values.deliveryAvailable
                  ? 0
                  : null,
            monthlyPrice:
              values.monthlyAvailable && Number.isFinite(values.monthlyPrice)
                ? values.monthlyPrice
                : null,
          };
          const response = await fetch(mode === "create" ? "/api/listings" : `/api/listings/${vehicleId}`, {
            method: mode === "create" ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = (await response.json()) as { error?: string; listingId?: string };

          if (!response.ok) {
            throw new Error(result.error ?? "Listing submission failed.");
          }

          toast.success(mode === "create" ? "Listing submitted" : "Listing updated");
          router.push(mode === "create" ? "/dashboard/owner" : `/dashboard/owner/listings/${result.listingId ?? vehicleId}/edit`);
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Listing submission failed.");
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="space-y-8"
    >
      <div className="surface-card grid gap-5 rounded-[2rem] p-6 md:grid-cols-2 dark:bg-slate-900">
        <Field label="Make" error={errors.make?.message}>
          <input {...register("make")} className="input" />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <input {...register("model")} className="input" />
        </Field>
        <Field label="Year" error={errors.year?.message}>
          <input {...register("year", { valueAsNumber: true })} type="number" className="input" />
        </Field>
        <Field label="City" error={errors.city?.message}>
          <select {...register("city")} className="input">
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <select {...register("category")} className="input">
            {Object.values(VehicleCategory).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Transmission" error={errors.transmission?.message}>
          <select {...register("transmission")} className="input">
            {Object.values(Transmission).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fuel type" error={errors.fuelType?.message}>
          <select {...register("fuelType")} className="input">
            {Object.values(FuelType).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Seats" error={errors.seats?.message}>
          <input {...register("seats", { valueAsNumber: true })} type="number" className="input" />
        </Field>
        <Field label="Daily price (UZS)" error={errors.dailyPrice?.message}>
          <input {...register("dailyPrice", { valueAsNumber: true })} type="number" className="input" />
        </Field>
        <Field label="Monthly price, UZS" error={errors.monthlyPrice?.message as string | undefined}>
          <input
            {...register("monthlyPrice", { valueAsNumber: true })}
            type="number"
            className="input"
            disabled={!monthlyAvailable}
            placeholder={monthlyAvailable ? "Enter monthly price" : "Enable monthly rental below"}
          />
        </Field>
        <Field label="Deposit (UZS)" error={errors.depositAmount?.message}>
          <input {...register("depositAmount", { valueAsNumber: true })} type="number" className="input" />
        </Field>
        <Field label="Mileage limit per day" error={errors.mileageLimitPerDay?.message}>
          <input {...register("mileageLimitPerDay", { valueAsNumber: true })} type="number" className="input" />
        </Field>
        <Field label="Plate number" error={errors.plateNumber?.message}>
          <input {...register("plateNumber")} className="input" />
        </Field>
        <Field label="Address" error={errors.address?.message} className="md:col-span-2">
          <input {...register("address")} className="input" />
        </Field>
        <Field label="Description" error={errors.description?.message} className="md:col-span-2">
          <textarea {...register("description")} rows={5} className="input min-h-32" />
        </Field>
        <Field label="Rental rules" error={errors.rules?.message} className="md:col-span-2">
          <textarea {...register("rules")} rows={4} className="input min-h-28" />
        </Field>
      </div>

      <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
        <UploadBox
          label="Vehicle photos"
          folder="vehicles"
          multiple
          value={photoUrls}
          onChange={(urls) => setValue("photoUrls", urls, { shouldValidate: true })}
        />
        {errors.photoUrls ? <p className="theme-error mt-2 text-sm">{errors.photoUrls.message as string}</p> : null}
      </div>

      <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">Blocked dates</h3>
            <p className="theme-help text-sm">Add dates when the car should be unavailable.</p>
          </div>
          <button
            type="button"
            onClick={() => append({ startDate: "", endDate: "", reason: "" })}
            className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Add block
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 xl:grid-cols-[1fr_1fr_2fr_auto]">
              <input {...register(`availabilityBlocks.${index}.startDate`)} type="date" className="input" />
              <input {...register(`availabilityBlocks.${index}.endDate`)} type="date" className="input" />
              <input {...register(`availabilityBlocks.${index}.reason`)} placeholder="Reason" className="input" />
              <button
                type="button"
                onClick={() => remove(index)}
                className="btn-danger rounded-full px-4 py-2 text-sm font-semibold transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700">
          <input {...register("hasOsago")} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
          <span>
            <span className="block font-semibold text-slate-950 dark:text-slate-50">OSAGO insurance confirmed</span>
            <span className="theme-help text-sm">Required before the listing can be reviewed.</span>
          </span>
        </label>
        {errors.hasOsago ? <p className="theme-error mt-2 text-sm">{errors.hasOsago.message}</p> : null}
        <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700">
          <input {...register("hasCasco")} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
          <span>
            <span className="block font-semibold text-slate-950 dark:text-slate-50">CASCO available</span>
            <span className="theme-help text-sm">Optional extra protection badge.</span>
          </span>
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700">
            <input {...register("airportPickupAvailable")} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-slate-50">Airport pickup available</span>
              <span className="theme-help text-sm">Show this car in airport pickup marketplace filters.</span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700">
            <input {...register("deliveryAvailable")} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-slate-50">Delivery available</span>
              <span className="theme-help text-sm">Offer vehicle handoff to a renter-selected location.</span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700">
            <input {...register("monthlyAvailable")} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-slate-50">Monthly rental available</span>
              <span className="theme-help text-sm">Prioritize this listing for long trips and monthly searches.</span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700">
            <input {...register("instantBook")} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-slate-50">Instant booking available</span>
              <span className="theme-help text-sm">Highlight this listing for renters who want a faster decision flow.</span>
            </span>
          </label>
        </div>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <Field label="Pickup instructions" error={errors.pickupInstructions?.message}>
            <textarea
              {...register("pickupInstructions")}
              rows={3}
              className="input min-h-24"
              placeholder="Optional airport or delivery handoff notes"
            />
          </Field>

          {deliveryAvailable ? (
            <Field label="Delivery fee (UZS)" error={errors.deliveryFee?.message as string | undefined}>
              <input {...register("deliveryFee", { valueAsNumber: true })} type="number" className="input" />
            </Field>
          ) : (
            <div className="surface-dashed rounded-2xl p-4 text-sm">
              Enable delivery to set an optional delivery fee.
            </div>
          )}
        </div>
      </div>

      {mode === "create" ? (
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700">
            <input
              {...register("acceptedTerms")}
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600"
              onChange={(event) => {
                register("acceptedTerms").onChange(event);
                if (event.target.checked) {
                  clearErrors("acceptedTerms");
                }
              }}
            />
            <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {legal.listingAgreementLead}
              <Link href="/terms-of-use" className="font-semibold text-sky-600 hover:underline dark:text-sky-400">
                {legal.termsOfUse}
              </Link>
              {legal.listingAgreementSuffix}
            </span>
          </label>
          {errors.acceptedTerms ? <p className="theme-error mt-2 text-sm">{legal.listingAgreementError}</p> : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full rounded-2xl px-6 py-3 font-semibold transition sm:w-auto"
      >
        {isSubmitting ? "Saving..." : mode === "create" ? "Submit for review" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="theme-label mb-2 block text-sm font-semibold">{label}</label>
      {children}
      {error ? <p className="theme-error mt-2 text-sm">{error}</p> : null}
    </div>
  );
}
