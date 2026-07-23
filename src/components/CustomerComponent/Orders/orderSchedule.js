const WEEKDAY_SEQUENCE = [
  { name: "Monday", short: "Mon", index: 1 },
  { name: "Tuesday", short: "Tue", index: 2 },
  { name: "Wednesday", short: "Wed", index: 3 },
  { name: "Thursday", short: "Thu", index: 4 },
  { name: "Friday", short: "Fri", index: 5 },
];

const DAY_INDEX_MAP = Object.fromEntries(
  WEEKDAY_SEQUENCE.map((day) => [day.name, day.index]),
);

const DAY_SHORT_MAP = Object.fromEntries(
  WEEKDAY_SEQUENCE.map((day) => [day.name, day.short]),
);

const DAY_FIELD_CANDIDATES = [
  "day",
  "weekday",
  "dayKey",
  "dayName",
  "deliveryDay",
  "label",
  "name",
];

const FILE_COLLECTION_CANDIDATES = [
  "files",
  "availableFiles",
  "availableDays",
  "available_days",
  "daily",
  "dayFiles",
  "deliveryDays",
  "deliverySchedule",
  "scheduleRows",
  "dayRows",
];

const ROW_COLLECTION_CANDIDATES = ["data", "rows", "leads", "items", "records"];

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeWeekday = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();

  if (normalized.startsWith("mon")) return "Monday";
  if (normalized.startsWith("tue")) return "Tuesday";
  if (normalized.startsWith("wed")) return "Wednesday";
  if (normalized.startsWith("thu")) return "Thursday";
  if (normalized.startsWith("fri")) return "Friday";
  if (normalized.startsWith("sat")) return "Saturday";
  if (normalized.startsWith("sun")) return "Sunday";
  return null;
};

const dedupeWeekdays = (days) => {
  const uniqueDays = [...new Set(days.filter(Boolean))];
  return uniqueDays.sort(
    (a, b) =>
      (DAY_INDEX_MAP[a] || Number.MAX_SAFE_INTEGER) -
      (DAY_INDEX_MAP[b] || Number.MAX_SAFE_INTEGER),
  );
};

const getDayFromUnknownShape = (value) => {
  if (!value) return null;
  if (typeof value === "string") return normalizeWeekday(value);
  if (typeof value !== "object") return null;

  for (const key of DAY_FIELD_CANDIDATES) {
    const normalized = normalizeWeekday(value[key]);
    if (normalized) return normalized;
  }
  return null;
};

const normalizeFileRows = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter((row) => row && typeof row === "object");
};

const normalizeOrderFile = (file, fallbackDay = null) => {
  if (!file) return null;

  if (typeof file === "string") {
    const day = normalizeWeekday(file) || normalizeWeekday(fallbackDay);
    return day ? { day, rows: [] } : null;
  }

  if (typeof file !== "object") return null;

  const day =
    getDayFromUnknownShape(file) || normalizeWeekday(fallbackDay) || null;

  if (!day) return null;

  const rows = ROW_COLLECTION_CANDIDATES.flatMap((key) =>
    normalizeFileRows(file?.[key]),
  );

  return {
    ...file,
    id:
      file?._id ??
      file?.id ??
      file?.fileId ??
      file?.customId ??
      file?.publicId ??
      null,
    day,
    quantity: safeNumber(
      file?.quantity ??
        file?.target ??
        file?.total ??
        file?.expected ??
        rows.length,
    ),
    allocated: safeNumber(file?.allocated ?? file?.quantity ?? rows.length),
    target: safeNumber(
      file?.target ??
        file?.quantity ??
        file?.total ??
        file?.expected ??
        rows.length,
    ),
    filled: safeNumber(
      file?.filled ??
        file?.count ??
        file?.progress ??
        file?.delivered ??
        rows.length,
    ),
    updatedAt: file?.updatedAt ?? file?.deliveryDate ?? null,
    publicId:
      file?.publicId ?? file?.fileId ?? file?.customId ?? file?.id ?? null,
    locked: file?.locked ?? file?.isLocked ?? file?.disabled ?? undefined,
    rows,
  };
};

const normalizeOrderFiles = (order) => {
  const rawCollection = FILE_COLLECTION_CANDIDATES.map(
    (key) => order?.[key],
  ).find((candidate) => {
    if (Array.isArray(candidate)) return candidate.length > 0;
    if (candidate && typeof candidate === "object") {
      return Object.keys(candidate).length > 0;
    }
    return false;
  });

  if (!rawCollection) return [];

  if (Array.isArray(rawCollection)) {
    return rawCollection
      .map((file, index) =>
        normalizeOrderFile(file, WEEKDAY_SEQUENCE[index]?.name),
      )
      .filter(Boolean);
  }

  return Object.entries(rawCollection)
    .map(([key, value], index) =>
      normalizeOrderFile(
        typeof value === "object" && value !== null
          ? { day: key, ...value }
          : { day: key, value },
        WEEKDAY_SEQUENCE[index]?.name ?? key,
      ),
    )
    .filter(Boolean);
};

const getDayRowsFromOrder = (order) => {
  const rowCollections = [
    order?.daily,
    order?.dayFiles,
    order?.deliverySchedule,
    order?.scheduleRows,
    order?.dayRows,
    order?.schedule?.rows,
    order?.schedule?.days,
    order?.deliveryConfig?.rows,
    order?.deliveryConfig?.schedule,
  ];

  const matchedCollection = rowCollections.find(
    (collection) =>
      Array.isArray(collection) &&
      collection.some(
        (item) =>
          item && typeof item === "object" && getDayFromUnknownShape(item),
      ),
  );

  if (!matchedCollection) return [];

  return matchedCollection
    .map((row) => {
      const day = getDayFromUnknownShape(row);
      if (!day) return null;

      return {
        day,
        id:
          row?._id ??
          row?.id ??
          row?.fileId ??
          row?.publicId ??
          row?.customId ??
          row?.leadId ??
          null,
        target: safeNumber(
          row?.quantity ??
            row?.allocated ??
            row?.total ??
            row?.limit ??
            row?.expected ??
            row?.target,
        ),
        filled: safeNumber(
          row?.filled ?? row?.progress ?? row?.count ?? row?.delivered,
        ),
        customId:
          row?.customId ??
          row?.fileId ??
          row?.publicId ??
          row?.leadId ??
          row?.id ??
          null,
      };
    })
    .filter(Boolean);
};

const getOrderFilesFromOrder = (order) => {
  const normalizedFiles = normalizeOrderFiles(order);
  if (normalizedFiles.length) return normalizedFiles;

  const rows = getDayRowsFromOrder(order);
  if (!rows.length) return [];

  return rows.map((row) => ({
    day: row.day,
    id: row.id,
    target: row.target,
    filled: row.filled,
    publicId: row.customId,
    locked:
      row?.deliveryDate && !Number.isNaN(new Date(row.deliveryDate).getTime())
        ? new Date(row.deliveryDate).getTime() > Date.now() ||
          safeNumber(row.filled) === 0
        : safeNumber(row.filled) === 0,
    rows: [],
  }));
};

const getDaysFromExplicitCollections = (order) => {
  const rawCollections = [
    order?.availableDays,
    order?.available_days,
    order?.availableFiles,
    order?.deliveryDays,
    order?.days,
    order?.weekdays,
    order?.deliveryConfig?.days,
    order?.deliveryConfig?.selectedDays,
    order?.schedule?.days,
  ];

  const inferredDays = [];
  rawCollections.forEach((collection) => {
    if (!Array.isArray(collection)) return;
    collection.forEach((item) => {
      const normalized = getDayFromUnknownShape(item);
      if (normalized) inferredDays.push(normalized);
    });
  });

  return dedupeWeekdays(inferredDays);
};

const expandWeekFromStartDay = (startDay) => {
  const normalizedStart = normalizeWeekday(startDay);
  if (!normalizedStart) return [];

  return WEEKDAY_SEQUENCE.filter(
    (day) => day.index >= DAY_INDEX_MAP[normalizedStart],
  ).map((day) => day.name);
};

const inferScenarioDays = (order) => {
  const scenario = String(order?.deliveryScenario || "")
    .trim()
    .toLowerCase();
  const deliveryConfig = order?.deliveryConfig || {};
  const startLikeDay =
    deliveryConfig.startDay ||
    deliveryConfig.selectedDay ||
    order?.startDay ||
    order?.selectedDay;

  if (scenario === "scheduled") {
    return WEEKDAY_SEQUENCE.map((day) => day.name);
  }

  if (scenario === "staggered") {
    return expandWeekFromStartDay(startLikeDay);
  }

  if (scenario === "standard") {
    const normalized = normalizeWeekday(startLikeDay);
    return normalized ? [normalized] : [];
  }

  return [];
};

const mapProgressFromFulfillmentReport = (report) => {
  const progressMap = {};

  if (Array.isArray(report)) {
    report.forEach((entry) => {
      const day = getDayFromUnknownShape(entry);
      if (!day) return;
      progressMap[day] = safeNumber(
        entry?.count ?? entry?.filled ?? entry?.progress ?? entry?.value,
      );
    });
    return progressMap;
  }

  if (report && typeof report === "object") {
    Object.entries(report).forEach(([dayKey, dayValue]) => {
      const day = normalizeWeekday(dayKey);
      if (!day) return;
      progressMap[day] = safeNumber(dayValue);
    });
  }

  return progressMap;
};

const allocateTargets = (total, dayCount) => {
  if (dayCount <= 0) return [];
  const safeTotal = Math.max(0, safeNumber(total));
  const base = Math.floor(safeTotal / dayCount);
  const remainder = safeTotal % dayCount;
  return Array.from(
    { length: dayCount },
    (_, index) => base + (index < remainder ? 1 : 0),
  );
};

const allocateProgressSequentially = (totalProgress, targets) => {
  const safeProgress = Math.max(0, safeNumber(totalProgress));
  let remaining = safeProgress;

  return targets.map((target) => {
    const filled = Math.min(target, remaining);
    remaining = Math.max(0, remaining - target);
    return filled;
  });
};

const getUnlockThresholdByTimezone = (timezone) => {
  const now = new Date();

  const toWeekdayNumber = (dayName) => {
    const normalized = normalizeWeekday(dayName);
    const weekdayIndex = normalized ? DAY_INDEX_MAP[normalized] : null;
    if (weekdayIndex) return weekdayIndex;

    const rawDay = String(dayName || "")
      .trim()
      .toLowerCase();
    if (rawDay.startsWith("sat")) return 6;
    if (rawDay.startsWith("sun")) return 7;

    const localDay = now.getDay();
    return localDay === 0 ? 7 : localDay;
  };

  if (!timezone) return toWeekdayNumber(null);

  try {
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: timezone,
    }).format(now);
    return toWeekdayNumber(dayName);
  } catch {
    return toWeekdayNumber(null);
  }
};

const inferDayPublicId = (order, index, explicitId) => {
  if (explicitId) {
    return String(explicitId).startsWith("#") ? explicitId : `#${explicitId}`;
  }

  const baseId = String(order?.customId || order?.publicId || "LP")
    .trim()
    .replace(/^#/, "");
  const trailingNumber = baseId.match(/(\d+)$/);

  if (!trailingNumber) {
    return `#${baseId}-${String(index + 1).padStart(2, "0")}`;
  }

  const numberWidth = trailingNumber[1].length;
  const nextNumber = String(Number(trailingNumber[1]) + index).padStart(
    numberWidth,
    "0",
  );
  const prefix = baseId.slice(0, baseId.length - numberWidth);

  return `#${prefix}${nextNumber}`;
};

export const inferOrderDays = (order) => {
  const files = getOrderFilesFromOrder(order);
  if (files.length) {
    return dedupeWeekdays(files.map((file) => file.day));
  }

  const rowDays = getDayRowsFromOrder(order).map((row) => row.day);
  if (rowDays.length) return dedupeWeekdays(rowDays);

  const explicitDays = getDaysFromExplicitCollections(order);
  if (explicitDays.length) return explicitDays;

  const scenarioDays = inferScenarioDays(order);
  if (scenarioDays.length) return dedupeWeekdays(scenarioDays);

  return WEEKDAY_SEQUENCE.map((day) => day.name);
};

export const buildOrderDayFiles = (order) => {
  const days = inferOrderDays(order);
  const totalQuantity = Math.max(0, safeNumber(order?.quantity));
  const totalFilled = Math.max(0, safeNumber(order?.filled));
  const files = getOrderFilesFromOrder(order);
  const dayRows = getDayRowsFromOrder(order);
  const rowByDay = Object.fromEntries(dayRows.map((row) => [row.day, row]));
  const fileByDay = Object.fromEntries(files.map((file) => [file.day, file]));
  const reportProgressByDay = mapProgressFromFulfillmentReport(
    order?.fulfillmentReport,
  );
  const targets = allocateTargets(totalQuantity, days.length);
  const inferredProgress = allocateProgressSequentially(totalFilled, targets);

  return days.map((dayName, index) => {
    const dayIndex = DAY_INDEX_MAP[dayName];
    const row = rowByDay[dayName];
    const file = fileByDay[dayName];
    const target = Math.max(
      0,
      safeNumber(
        file?.target ?? row?.target,
        targets[index] || file?.rows?.length || 0,
      ),
    );
    const reportFilled = safeNumber(reportProgressByDay[dayName], -1);
    const fileFilled = safeNumber(file?.filled, file?.rows?.length || 0);
    const inferredFilled = safeNumber(
      row?.filled,
      inferredProgress[index] || fileFilled,
    );
    const deliveryDate =
      file?.deliveryDate ??
      row?.deliveryDate ??
      file?.updatedAt ??
      row?.updatedAt ??
      null;
    const filled = Math.min(
      target,
      reportFilled >= 0 ? reportFilled : fileFilled || inferredFilled,
    );
    const locked = deliveryDate
      ? new Date(deliveryDate).getTime() > Date.now() || filled === 0
      : filled === 0;

    return {
      day: dayName,
      short: DAY_SHORT_MAP[dayName],
      index: dayIndex,
      id: file?.id ?? row?.id ?? row?.customId ?? file?.publicId ?? null,
      weekday: file?.weekday ?? row?.weekday ?? dayName,
      deliveryDate,
      filled,
      target,
      quantity: safeNumber(file?.quantity ?? row?.quantity ?? target),
      allocated: safeNumber(file?.allocated ?? row?.allocated ?? filled),
      updatedAt: file?.updatedAt ?? row?.updatedAt ?? null,
      locked,
      publicId: inferDayPublicId(order, index, file?.publicId ?? row?.customId),
      rows: file?.rows || [],
      title:
        order?.parentPublicId && order?.weekNumber
          ? `${order.parentPublicId} - Week ${order.weekNumber}`
          : order?.parentPublicId ||
            order?.publicId ||
            order?.customId ||
            "Order",
    };
  });
};

export const getOrderFileByDay = (order, day) => {
  const normalizedDay = normalizeWeekday(day);
  if (!normalizedDay) return null;

  return (
    getOrderFilesFromOrder(order).find((file) => file.day === normalizedDay) ||
    null
  );
};

export const getOrderFileRows = (order, day) => {
  const file = getOrderFileByDay(order, day);
  if (file && Array.isArray(file.rows) && file.rows.length) {
    return file.rows;
  }

  if (Array.isArray(order?.data)) {
    return order.data.filter((row) => row && typeof row === "object");
  }

  return [];
};

export const getLeadWeekday = (lead) => {
  for (const field of DAY_FIELD_CANDIDATES) {
    const normalized = normalizeWeekday(lead?.[field]);
    if (normalized) return normalized;
  }

  const dateFields = [
    lead?.deliveryDate,
    lead?.date,
    lead?.dateTime,
    lead?.createdAt,
    lead?.updatedAt,
  ];

  for (const value of dateFields) {
    if (!value) continue;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    const weekdayLabel = date.toLocaleDateString("en-US", { weekday: "long" });
    const normalized = normalizeWeekday(weekdayLabel);
    if (normalized) return normalized;
  }

  return null;
};

export const inferOrderRangeLabel = (order, dayCount) => {
  const formatShortDate = (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

  const explicitStart =
    order?.deliveryStartDate ||
    order?.startDate ||
    order?.deliveryWindow?.start;
  const explicitEnd =
    order?.deliveryEndDate || order?.endDate || order?.deliveryWindow?.end;

  if (explicitStart && explicitEnd) {
    return `${formatShortDate(explicitStart)} - ${formatShortDate(explicitEnd)}`;
  }

  const createdAt = order?.createdAt;
  if (!createdAt) return order?.customId || order?.publicId || "Order";

  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) {
    return order?.customId || order?.publicId || "Order";
  }

  if (dayCount <= 1) return formatShortDate(start);

  const end = new Date(start);
  end.setDate(start.getDate() + (dayCount - 1));
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
};

export const inferOrderFolderTitle = (order) => {
  if (!order) return "Order";

  const baseTitle =
    order?.parentPublicId || order?.publicId || order?.customId || "Order";
  const weekNumber = order?.weekNumber;

  if (weekNumber !== undefined && weekNumber !== null && weekNumber !== "") {
    return `${baseTitle} - Week ${weekNumber}`;
  }

  return baseTitle;
};

export const shouldHideOrderFolder = (order) => {
  const status = String(
    order?.fulfillmentStatus ||
      order?.displayStatus ||
      order?.orderStatus ||
      "",
  ).toLowerCase();
  if (status.includes("cancelled")) return true;

  const dayFiles = buildOrderDayFiles(order);
  if (!dayFiles.length) return false;

  const allLocked = dayFiles.every((file) => Boolean(file?.locked));
  if (!allLocked) return false;

  const deliveryDates = dayFiles
    .map((file) => new Date(file?.deliveryDate || null))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (!deliveryDates.length) return true;

  const firstDelivery = deliveryDates.sort((a, b) => a - b)[0];
  const unlockAt = firstDelivery.getTime() - 60 * 60 * 1000; // 1 hour before

  return Date.now() < unlockAt;
};
