"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ImageOff, Search, Pencil, Trash2 } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type {
  AddOnPublicResponse,
  BraiderStyleAddonInput,
  BraiderStyleResponse,
  BraiderStyleVariationInput,
  StylePublicResponse,
} from "@/lib/api/types";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { catalogApi } from "@/lib/api/catalog-client";
import { ApiError } from "@/lib/api/auth-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const SEARCH_DEBOUNCE_MS = 350;

function addedStyleName(
  service: BraiderStyleResponse,
  lang: Locale
): string {
  if (lang === "de" && service.style_name_de) return service.style_name_de;
  if (lang === "fr" && service.style_name_fr) return service.style_name_fr;
  return service.style_name_en;
}

interface VariationSelection {
  checked: boolean;
  price: string;
}

interface AddonSelection {
  checked: boolean;
  price: string;
  required: boolean;
}

function isValidPrice(value: string): boolean {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n > 0;
}

export function ServiceTypeForm({
  dict,
  common,
  lang,
  initialServices,
  isDashboard,
}: {
  dict: Dictionary["onboarding"]["serviceType"];
  common: Dictionary["common"];
  lang: Locale;
  initialServices: BraiderStyleResponse[];
  isDashboard?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const modalTitleId = useId();

  const [editingBraiderStyleId, setEditingBraiderStyleId] = useState<string | null>(null);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);

  const [services, setServices] = useState(initialServices);
  const [categoryId, setCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedStyle, setSelectedStyle] = useState<StylePublicResponse | null>(
    null
  );
  const [basePrice, setBasePrice] = useState("");
  const [duration, setDuration] = useState("");
  const [variationSelections, setVariationSelections] = useState<
    Record<string, VariationSelection>
  >({});
  const [addonSelections, setAddonSelections] = useState<
    Record<string, AddonSelection>
  >({});

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const categoriesQuery = useQuery({
    queryKey: ["style-categories", lang],
    queryFn: () => catalogApi.getStyleCategories(lang),
  });

  const addonsQuery = useQuery({
    queryKey: ["addons", lang],
    queryFn: () => catalogApi.getAddons(lang),
  });

  const stylesQuery = useInfiniteQuery({
    queryKey: ["styles", categoryId, debouncedSearch, lang],
    queryFn: ({ pageParam }) =>
      catalogApi.getStyles(
        {
          categoryId: categoryId || undefined,
          search: debouncedSearch || undefined,
          page: pageParam,
        },
        lang
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
  });

  const styles = stylesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const addons: AddOnPublicResponse[] = addonsQuery.data ?? [];

  const addedStyleIds = useMemo(
    () => new Set(services.map((service) => service.style_id)),
    [services]
  );

  const addMutation = useMutation({
    mutationFn: () => {
      const variations: BraiderStyleVariationInput[] = Object.entries(
        variationSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([styleVariationId, selection]) => ({
          style_variation_id: styleVariationId,
          price: Number(selection.price),
        }));

      const selectedAddons: BraiderStyleAddonInput[] = Object.entries(
        addonSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([addonId, selection]) => ({
          addon_id: addonId,
          price: Number(selection.price),
          is_required: selection.required,
        }));

      return onboardingApi.addService(session!.accessToken, {
        style_id: selectedStyle!.id,
        base_price: Number(basePrice),
        duration_minutes: duration ? Number(duration) : undefined,
        variations,
        addons: selectedAddons,
      });
    },
    onSuccess: (data) => {
      setServices((current) => [...current, data]);
      toast.success(dict.toasts.added);
      setSelectedStyle(null);
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingBraiderStyleId) throw new Error("No style ID to update");
      const variations: BraiderStyleVariationInput[] = Object.entries(
        variationSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([styleVariationId, selection]) => ({
          style_variation_id: styleVariationId,
          price: Number(selection.price),
        }));

      const selectedAddons: BraiderStyleAddonInput[] = Object.entries(
        addonSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([addonId, selection]) => ({
          addon_id: addonId,
          price: Number(selection.price),
          is_required: selection.required,
        }));

      return onboardingApi.updateService(session!.accessToken, editingBraiderStyleId, {
        base_price: Number(basePrice),
        duration_minutes: duration ? Number(duration) : undefined,
        is_active: true,
        variations,
        addons: selectedAddons,
      });
    },
    onSuccess: (data) => {
      setServices((current) =>
        current.map((s) => (s.id === data.id ? data : s))
      );
      toast.success(dict.toasts.saved || "Service updated");
      setSelectedStyle(null);
      setEditingBraiderStyleId(null);
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (braiderStyleId: string) =>
      onboardingApi.deleteService(session!.accessToken, braiderStyleId),
    onSuccess: (_, braiderStyleId) => {
      setServices((current) => current.filter((s) => s.id !== braiderStyleId));
      toast.success(dict.toasts.removed || "Service removed");
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  function openStyle(style: StylePublicResponse) {
    setSelectedStyle(style);
    setEditingBraiderStyleId(null);
    setBasePrice("");
    setDuration("");
    setVariationSelections(
      Object.fromEntries(
        style.variations.map((variation) => [
          variation.id,
          { checked: false, price: "" },
        ])
      )
    );
    setAddonSelections(
      Object.fromEntries(
        addons.map((addon) => [
          addon.id,
          {
            checked: false,
            price: addon.suggested_price?.toString() ?? "",
            required: false,
          },
        ])
      )
    );
  }

  async function handleEditStyle(braiderStyle: BraiderStyleResponse) {
    try {
      setIsFetchingEdit(true);
      const stylePublic = await queryClient.fetchQuery({
        queryKey: ["style", braiderStyle.style_id, lang],
        queryFn: () => catalogApi.getStyle(braiderStyle.style_id, lang),
      });

      setSelectedStyle(stylePublic);
      setEditingBraiderStyleId(braiderStyle.id);
      setBasePrice(braiderStyle.base_price.toString());
      setDuration(braiderStyle.duration_minutes?.toString() ?? "");

      const vSelections: Record<string, VariationSelection> = {};
      for (const v of stylePublic.variations) {
        const existing = braiderStyle.variations.find(
          (bv) => bv.style_variation_id === v.id
        );
        vSelections[v.id] = {
          checked: !!existing,
          price: existing ? existing.price.toString() : "",
        };
      }
      setVariationSelections(vSelections);

      const aSelections: Record<string, AddonSelection> = {};
      for (const a of addons) {
        const existing = braiderStyle.addons.find(
          (ba) => ba.addon_id === a.id
        );
        aSelections[a.id] = {
          checked: !!existing,
          price: existing
            ? existing.price.toString()
            : (a.suggested_price?.toString() ?? ""),
          required: existing ? existing.is_required : false,
        };
      }
      setAddonSelections(aSelections);
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch style details");
    } finally {
      setIsFetchingEdit(false);
    }
  }

  function handleContinue() {
    router.push(`/${lang}/onboarding`);
  }

  const hasInvalidVariationPrice = Object.values(variationSelections).some(
    (selection) => selection.checked && !isValidPrice(selection.price)
  );
  const hasInvalidAddonPrice = Object.values(addonSelections).some(
    (selection) => selection.checked && !isValidPrice(selection.price)
  );
  const canSubmit =
    isValidPrice(basePrice) && !hasInvalidVariationPrice && !hasInvalidAddonPrice;

  const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <div className="w-full relative">
      {(isFetchingEdit || deleteMutation.isPending) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-foreground">
        {isDashboard ? dict.dashboardTitle || dict.title : dict.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isDashboard ? dict.dashboardSubtitle || dict.subtitle : dict.subtitle}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Select
          label={dict.categoryLabel}
          showLabel
          value={categoryId}
          onChange={setCategoryId}
          placeholder={dict.categoryPlaceholder}
          options={categoryOptions}
        />

        <Input
          label={dict.searchLabel}
          showLabel
          icon={Search}
          placeholder={dict.searchPlaceholder}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {styles.map((style) => {
          const added = addedStyleIds.has(style.id);
          const thumbnail = style.images[0]?.url;
          return (
            <div
              key={style.id}
              className="flex flex-col border border-border bg-input"
            >
              <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-border/40">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageOff className="size-6 text-icon-muted" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {style.name}
                  </p>
                  {style.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {style.description}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={added}
                  onClick={() => openStyle(style)}
                >
                  {added ? dict.addedBadge : dict.selectButton}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {!stylesQuery.isLoading && styles.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {dict.noResults}
        </p>
      )}

      {stylesQuery.hasNextPage && (
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={stylesQuery.isFetchingNextPage}
          onClick={() => stylesQuery.fetchNextPage()}
        >
          {stylesQuery.isFetchingNextPage ? common.loading : dict.loadMore}
        </Button>
      )}

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">
          {dict.menuTitle}
        </h2>

        {services.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {dict.emptyMenu}
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border border border-border">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <span className="block text-foreground font-medium">
                    {addedStyleName(service, lang)}
                  </span>
                  <span className="block text-muted-foreground">
                    {Number(service.base_price).toFixed(2)} €
                    {service.duration_minutes ? ` • ${service.duration_minutes} min` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => handleEditStyle(service)}
                    className="flex size-8 items-center justify-center rounded-md text-icon-muted transition-colors hover:bg-border hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => deleteMutation.mutate(service.id)}
                    className="flex size-8 items-center justify-center rounded-md text-icon-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isDashboard && services.length > 0 && (
        <Button type="button" className="mt-6" onClick={handleContinue}>
          {dict.continue}
        </Button>
      )}

      <Modal
        open={!!selectedStyle}
        onClose={() => {
          setSelectedStyle(null);
          setEditingBraiderStyleId(null);
        }}
        labelledBy={modalTitleId}
        size="lg"
      >
        {selectedStyle && (
          <>
            <h2 id={modalTitleId} className="text-lg font-bold text-foreground">
              {selectedStyle.name}
            </h2>
            {selectedStyle.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedStyle.description}
              </p>
            )}

            <div className="mt-4 space-y-4">
              <Input
                label={dict.basePriceLabel}
                showLabel
                type="number"
                min="0.01"
                step="0.01"
                placeholder={dict.basePricePlaceholder}
                value={basePrice}
                onChange={(event) => setBasePrice(event.target.value)}
                required
              />

              <Input
                label={dict.durationLabel}
                showLabel
                type="number"
                min="1"
                step="1"
                placeholder={dict.durationPlaceholder}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />

              {selectedStyle.variations.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    {dict.variationsTitle}
                  </p>
                  <div className="space-y-2">
                    {selectedStyle.variations.map((variation) => {
                      const selection = variationSelections[variation.id];
                      return (
                        <div
                          key={variation.id}
                          className="border border-border px-3 py-2"
                        >
                          <label className="flex items-center gap-2.5 text-sm text-foreground">
                            <input
                              type="checkbox"
                              className="size-4 shrink-0 accent-brand"
                              checked={selection?.checked ?? false}
                              onChange={(event) =>
                                setVariationSelections((current) => ({
                                  ...current,
                                  [variation.id]: {
                                    checked: event.target.checked,
                                    price: current[variation.id]?.price ?? "",
                                  },
                                }))
                              }
                            />
                            {variation.name}
                          </label>

                          {selection?.checked && (
                            <div className="mt-2 pl-6">
                              <Input
                                label={dict.priceLabel}
                                showLabel
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder={dict.priceLabel}
                                value={selection.price}
                                onChange={(event) =>
                                  setVariationSelections((current) => ({
                                    ...current,
                                    [variation.id]: {
                                      checked: true,
                                      price: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {addons.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    {dict.addonsTitle}
                  </p>
                  <div className="space-y-2">
                    {addons.map((addon) => {
                      const selection = addonSelections[addon.id];
                      return (
                        <div
                          key={addon.id}
                          className="border border-border px-3 py-2"
                        >
                          <label className="flex items-center gap-2.5 text-sm text-foreground">
                            <input
                              type="checkbox"
                              className="size-4 shrink-0 accent-brand"
                              checked={selection?.checked ?? false}
                              onChange={(event) =>
                                setAddonSelections((current) => ({
                                  ...current,
                                  [addon.id]: {
                                    checked: event.target.checked,
                                    price:
                                      current[addon.id]?.price ??
                                      addon.suggested_price?.toString() ??
                                      "",
                                    required: current[addon.id]?.required ?? false,
                                  },
                                }))
                              }
                            />
                            {addon.name}
                          </label>

                          {selection?.checked && (
                            <div className="mt-2 space-y-2 pl-6">
                              <Input
                                label={dict.priceLabel}
                                showLabel
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder={dict.priceLabel}
                                value={selection.price}
                                onChange={(event) =>
                                  setAddonSelections((current) => ({
                                    ...current,
                                    [addon.id]: {
                                      checked: true,
                                      price: event.target.value,
                                      required: current[addon.id]?.required ?? false,
                                    },
                                  }))
                                }
                              />
                              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <input
                                  type="checkbox"
                                  className="size-3.5 accent-brand"
                                  checked={selection.required}
                                  onChange={(event) =>
                                    setAddonSelections((current) => ({
                                      ...current,
                                      [addon.id]: {
                                        checked: true,
                                        price: current[addon.id]?.price ?? "",
                                        required: event.target.checked,
                                      },
                                    }))
                                  }
                                />
                                {dict.requiredLabel}
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-4 mt-6 flex gap-3 border-t border-border bg-surface px-4 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedStyle(null)}
              >
                {dict.cancel}
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!canSubmit || addMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  if (editingBraiderStyleId) {
                    updateMutation.mutate();
                  } else {
                    addMutation.mutate();
                  }
                }}
              >
                {addMutation.isPending || updateMutation.isPending
                  ? common.loading
                  : editingBraiderStyleId
                  ? dict.saveChanges || "Save Changes"
                  : dict.addButton}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
