import api from "../utility/axios";

const LIMIT = 10;
const CUSTOMER_ORDERS_ENDPOINT = "/api/v2/orders";
const CUSTOMER_TRANSACTION_HISTORY_ENDPOINT = "/api/v2/orders/history";
const CUSTOMER_ORDER_HISTORY_ENDPOINT = "/api/v2/orders";
const CUSTOMER_ORDER_ACTIVITY_OPEN_ENDPOINT = "/api/v2/orders";
const CUSTOMER_ORDER_ACTIVITY_DOWNLOAD_ENDPOINT = "/api/v2/orders";
const CUSTOMER_ORDER_LEADS_BY_DAY_ENDPOINT = "/api/v2/orders";
const CUSTOMER_ORDER_PAYMENT_ENDPOINT = "/api/v2/orders";
const ADMIN_ORDER_HISTORY_ENDPOINT = "/api/v2/orders";
const ADMIN_TRANSACTION_DETAIL_ENDPOINT = "/api/v2/admin/transactions";
const ADMIN_TRANSACTIONS_ENDPOINT = "/api/v2/admin/transactions";
const ADMIN_ORDERS_ENDPOINT = "/api/v2/admin/orders";
const ADMIN_IMPORT_BATCHES_OVERVIEW_ENDPOINT = "/api/v2/admin/import-batches/overview";
const ADMIN_IMPORT_BATCH_LEADS_ENDPOINT = "/api/v2/admin/import-batches";
const ADMIN_DASHBOARD_OVERVIEW_ENDPOINT = "/api/v2/admin/dashboard/overview";
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const ORDER_COLLECTION_KEYS = ["data", "orders", "results", "items", "docs"];
const ORDER_DAY_FIELDS = [
  "day",
  "weekday",
  "dayKey",
  "dayName",
  "deliveryDay",
  "label",
  "name",
];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const normalizeOrderCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of ORDER_COLLECTION_KEYS) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
};

const normalizeOrderDay = (value) => {
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

const normalizeOrderRows = (rows) =>
  Array.isArray(rows)
    ? rows.filter((row) => row && typeof row === "object")
    : [];

const normalizeOrderFile = (file, fallbackDay = null) => {
  if (!file) return null;

  if (typeof file === "string") {
    const day = normalizeOrderDay(file) || normalizeOrderDay(fallbackDay);
    return day ? { day, rows: [] } : null;
  }

  if (typeof file !== "object") return null;

  const day =
    normalizeOrderDay(
      pickFirst(
        file.day,
        file.weekday,
        file.dayKey,
        file.dayName,
        file.deliveryDay,
        file.deliveryDate,
        file.label,
        file.name,
        fallbackDay,
      ),
    ) || null;

  if (!day) return null;

  const rows = normalizeOrderRows(
    pickFirst(file.data, file.rows, file.leads, file.items, file.records),
  );

  return {
    ...file,
    day,
    target: toNumber(
      pickFirst(
        file.target,
        file.quantity,
        file.total,
        file.expected,
        rows.length,
      ),
    ),
    filled: toNumber(
      pickFirst(
        file.filled,
        file.count,
        file.progress,
        file.delivered,
        rows.length,
      ),
    ),
    allocated: toNumber(
      pickFirst(file.allocated, file.filled, file.quantity, rows.length),
    ),
    publicId: pickFirst(
      file.publicId,
      file.fileId,
      file.customId,
      file.id,
      null,
    ),
    locked: Boolean(
      pickFirst(file.locked, file.isLocked, file.disabled, false),
    ),
    rows,
  };
};

const normalizeOrderFiles = (order) => {
  const rawCollections = [
    order?.files,
    order?.availableFiles,
    order?.availableDays,
    order?.available_days,
    order?.daily,
    order?.dayFiles,
    order?.deliveryDays,
    order?.deliverySchedule,
    order?.schedule?.files,
    order?.schedule?.days,
    order?.scheduleRows,
    order?.dayRows,
  ];

  const collection = rawCollections.find((candidate) => {
    if (Array.isArray(candidate)) return candidate.length > 0;
    if (candidate && typeof candidate === "object") {
      return Object.keys(candidate).length > 0;
    }
    return false;
  });

  if (!collection) return [];

  if (Array.isArray(collection)) {
    return collection
      .map((file, index) => normalizeOrderFile(file, WEEKDAYS[index] ?? null))
      .filter(Boolean);
  }

  return Object.entries(collection)
    .map(([key, value], index) =>
      normalizeOrderFile(
        typeof value === "object" && value !== null
          ? { day: key, ...value }
          : { day: key, value },
        WEEKDAYS[index] ?? key,
      ),
    )
    .filter(Boolean);
};

const normalizeOrder = (order) => {
  if (!order || typeof order !== "object") return order;

  const files = normalizeOrderFiles(order);
  const availableDays = files.length
    ? files.map((file) => file.day)
    : normalizeOrderCollection(
        pickFirst(
          order.availableDays,
          order.available_days,
          order.deliveryDays,
          order.days,
          order.weekdays,
          order.deliveryConfig?.days,
          order.deliveryConfig?.selectedDays,
          order.schedule?.days,
        ),
      )
        .map((day) => normalizeOrderDay(day))
        .filter(Boolean);

  const uniqueDays = [...new Set(availableDays)];

  return {
    ...order,
    quantity: toNumber(
      pickFirst(
        order?.quantity,
        order?.totals?.requested,
        order?.totals?.target,
        order?.totals?.allocated,
      ),
    ),
    filled: toNumber(
      pickFirst(
        order?.filled,
        order?.totals?.delivered,
        order?.totals?.allocated,
        order?.totals?.requested,
      ),
    ),
    allocated: toNumber(
      pickFirst(order?.allocated, order?.totals?.allocated, order?.filled),
    ),
    status:
      order?.status ??
      order?.orderStatus ??
      order?.fulfillmentStatus ??
      order?.approvalStatus ??
      null,
    banks: order?.banks ?? order?.targeting?.banks ?? [],
    availableDays: uniqueDays,
    files: files.length ? files : (order.files ?? []),
  };
};

const getOrderSearchTitle = (order) => {
  if (!order || typeof order !== "object") return "";

  const baseTitle =
    order?.title ||
    order?.parentPublicId ||
    order?.publicId ||
    order?.customId ||
    order?.id ||
    "Order";
  const weekNumber = order?.weekNumber;

  if (weekNumber !== undefined && weekNumber !== null && weekNumber !== "") {
    return `${baseTitle} - Week ${weekNumber}`;
  }

  return String(baseTitle);
};

const normalizeOrderResponse = (
  payload,
  { page = 1, limit = LIMIT, search = "" } = {},
) => {
  const rawOrders = normalizeOrderCollection(payload?.data ?? payload);
  const normalizedOrders = rawOrders.map(normalizeOrder).filter(Boolean);
  const searchTerm = String(search || "")
    .trim()
    .toLowerCase();

  const filteredOrders = searchTerm
    ? normalizedOrders.filter((order) => {
        const haystack = [
          order?.customId,
          order?.publicId,
          order?.title,
          getOrderSearchTitle(order),
          order?.parentPublicId,
          order?.weekNumber,
          order?.client?.name,
          order?.client?.email,
          order?.orderType,
          order?.leadType,
          order?.status,
          order?.country,
          order?.countryPool,
          order?.countryCode,
          ...(Array.isArray(order?.banks) ? order.banks : []),
          ...(Array.isArray(order?.availableDays) ? order.availableDays : []),
          ...(Array.isArray(order?.files)
            ? order.files.flatMap((file) => [file?.day, file?.publicId])
            : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchTerm);
      })
    : normalizedOrders;

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
    const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
    return bTime - aTime;
  });

  const safePage = Math.max(1, toNumber(page, 1));
  const safeLimit = Math.max(1, toNumber(limit, LIMIT));
  const total = sortedOrders.length;
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const data = sortedOrders.slice(start, start + safeLimit);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages,
      hasNextPage: safePage < pages,
      hasPrevPage: safePage > 1,
    },
    meta: {
      total,
      returned: data.length,
    },
  };
};

const normalizeCustomerTransaction = (transaction) => {
  if (!transaction || typeof transaction !== "object") return null;

  return {
    ...transaction,
    id: transaction.id ?? transaction._id ?? null,
    publicId:
      transaction.publicId ?? transaction.customId ?? transaction.id ?? null,
    date:
      transaction.date ??
      transaction.createdAt ??
      transaction.updatedAt ??
      null,
    countryCode: transaction.countryCode ?? "US",
    leadsCategory:
      transaction.leadsCategory ?? transaction.targeting?.type ?? "-",
    amount: transaction.amount ?? null,
    currency: transaction.currency ?? "USD",
    quantity: toNumber(transaction.quantity, 0),
    fulfilled: toNumber(transaction.fulfilled, 0),
    status: transaction.status ?? "pending",
    displayStatus: transaction.displayStatus ?? transaction.status ?? "pending",
    deliveryType:
      transaction.deliveryType ?? transaction.deliveryScenario ?? "-",
    createdBy: transaction.createdBy ?? null,
  };
};

const normalizeCustomerTransactionResponse = (payload) => {
  const rawTransactions = normalizeOrderCollection(payload?.data ?? payload);
  const transactions = rawTransactions
    .map(normalizeCustomerTransaction)
    .filter(Boolean);

  return {
    data: transactions,
    meta: {
      total: transactions.length,
      returned: transactions.length,
    },
  };
};

const normalizeAdminTransactionRecord = (transaction) => {
  if (!transaction || typeof transaction !== "object") return null;

  const customer =
    transaction?.customer && typeof transaction.customer === "object"
      ? transaction.customer
      : {};
  const network =
    transaction?.network && typeof transaction.network === "object"
      ? transaction.network
      : null;
  const order =
    transaction?.order && typeof transaction.order === "object"
      ? transaction.order
      : null;
  const payment =
    transaction?.payment && typeof transaction.payment === "object"
      ? transaction.payment
      : null;

  const networkKey = String(
    pickFirst(
      network?.key,
      transaction?.networkKey,
      transaction?.selectedPaymentNetwork,
      "",
    ),
  )
    .trim()
    .toLowerCase();

  const networkLabel = pickFirst(
    network?.label,
    transaction?.networkLabel,
    networkKey === "tron" ? "TRON" : networkKey === "btc" ? "BTC" : null,
  );

  return {
    ...transaction,
    id: transaction.id ?? transaction._id ?? null,
    _id: transaction._id ?? transaction.id ?? null,
    orderId:
      transaction.orderId ??
      transaction.order?._id ??
      transaction.order?.id ??
      null,
    order: order
      ? {
          ...order,
          _id: order?._id ?? order?.id ?? transaction?.orderId ?? null,
          id: order?.id ?? order?._id ?? transaction?.orderId ?? null,
        }
      : transaction.order ?? null,
    payment: payment
      ? {
          ...payment,
        }
      : transaction.payment ?? null,
    customer: customer
      ? {
          ...customer,
          id: customer?.id ?? customer?._id ?? transaction?.customerId ?? null,
          _id: customer?._id ?? customer?.id ?? transaction?.customerId ?? null,
          name: customer?.name ?? transaction?.customerName ?? "Unknown Customer",
          email: customer?.email ?? transaction?.customerEmail ?? "",
        }
      : {
          id: transaction?.customerId ?? null,
          _id: transaction?.customerId ?? null,
          name: transaction?.customerName ?? "Unknown Customer",
          email: transaction?.customerEmail ?? "",
        },
    network:
      network
        ? {
            ...network,
            key: network.key ?? (networkKey || "btc"),
            label: network.label ?? (networkLabel || "BTC"),
          }
        : {
            key: networkKey || "btc",
            label: networkLabel || "BTC",
          },
    amount: toNumber(transaction.amount, 0),
    amountPaid: toNumber(
      pickFirst(
        transaction.amountPaid,
        transaction.amount,
        transaction?.summary?.amountPaid,
      ),
      0,
    ),
    currency: transaction.currency ?? "USD",
    txnUrl:
      transaction.txnUrl ??
      transaction.transactionUrl ??
      transaction.paymentLink ??
      "",
    proofImageUrl:
      transaction.proofImageUrl ??
      transaction.receiptUrl ??
      transaction.proofOfPaymentUrl ??
      transaction.transactionScreenshot ??
      transaction.proofImage ??
      "",
    submittedAt:
      transaction.submittedAt ??
      transaction.createdAt ??
      transaction.updatedAt ??
      null,
    status: transaction.status ?? "pending",
    displayStatus: transaction.displayStatus ?? transaction.status ?? "pending",
    action: transaction.action ?? null,
  };
};

const normalizeAdminTransactionResponse = (
  payload,
  { page = 1, limit = LIMIT, search = "" } = {},
) => {
  const rawPayload = payload?.data ?? payload;
  const rawTransactions = normalizeOrderCollection(rawPayload);
  const normalizedTransactions = rawTransactions
    .map(normalizeAdminTransactionRecord)
    .filter(Boolean);
  const searchTerm = String(search || "")
    .trim()
    .toLowerCase();
  const backendPagination =
    payload?.pagination ??
    rawPayload?.pagination ??
    payload?.meta?.pagination ??
    null;
  const hasBackendPagination =
    backendPagination && typeof backendPagination === "object"
      ? Object.keys(backendPagination).length > 0
      : false;

  const filteredTransactions =
    searchTerm && !hasBackendPagination
      ? normalizedTransactions.filter((transaction) => {
          const haystack = [
            transaction?.id,
            transaction?.orderId,
            transaction?.customer?.name,
            transaction?.customer?.email,
            transaction?.network?.key,
            transaction?.network?.label,
            transaction?.displayStatus,
            transaction?.status,
            transaction?.txnUrl,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(searchTerm);
        })
      : normalizedTransactions;

  const resolvedLimit = Math.max(1, Number(limit) || LIMIT);
  const resolvedPage = Math.max(1, Number(page) || 1);
  const total =
    toNumber(
      backendPagination?.total ??
        backendPagination?.count ??
        backendPagination?.meta?.total ??
        filteredTransactions.length,
    ) || filteredTransactions.length;
  const pages =
    toNumber(
      backendPagination?.pages ??
        backendPagination?.totalPages ??
        backendPagination?.pageCount,
    ) || Math.max(1, Math.ceil(total / resolvedLimit));
  const currentPage =
    toNumber(
      backendPagination?.page ??
        backendPagination?.currentPage ??
        backendPagination?.pageNumber,
      resolvedPage,
    ) || resolvedPage;
  const paginatedTransactions = hasBackendPagination
    ? filteredTransactions
    : filteredTransactions.slice(
        (Math.min(currentPage, pages) - 1) * resolvedLimit,
        (Math.min(currentPage, pages) - 1) * resolvedLimit + resolvedLimit,
      );

  return {
    data: paginatedTransactions,
    pagination: {
      page: currentPage,
      limit: resolvedLimit,
      total,
      pages,
      hasNextPage:
        backendPagination?.hasNextPage ??
        backendPagination?.has_next_page ??
        currentPage < pages,
      hasPrevPage:
        backendPagination?.hasPrevPage ??
        backendPagination?.has_prev_page ??
        currentPage > 1,
    },
    meta: {
      total,
      returned: paginatedTransactions.length,
    },
  };
};

const normalizeAdminTransactionDetailResponse = (payload) => {
  const rawData = payload?.data ?? payload ?? {};
  return normalizeAdminTransactionRecord({
    ...rawData,
    customer:
      rawData?.customer && typeof rawData.customer === "object"
        ? rawData.customer
        : rawData?.customerId
          ? {
              _id: rawData.customerId,
              id: rawData.customerId,
              name: rawData?.customerName ?? "Unknown Customer",
              email: rawData?.customerEmail ?? "",
            }
          : null,
    order:
      rawData?.order && typeof rawData.order === "object"
        ? rawData.order
        : rawData?.orderId
          ? {
              _id: rawData.orderId,
              id: rawData.orderId,
            }
          : null,
    payment:
      rawData?.payment && typeof rawData.payment === "object"
        ? rawData.payment
        : null,
    network: rawData?.network ?? rawData?.payment?.network ?? null,
    amount: rawData?.amount ?? rawData?.payment?.amount ?? rawData?.payment?.amountPaid ?? null,
    amountPaid:
      rawData?.amountPaid ??
      rawData?.payment?.amountPaid ??
      rawData?.amount ??
      rawData?.payment?.amount ??
      0,
    currency: rawData?.currency ?? rawData?.payment?.currency ?? "USD",
    txnUrl:
      rawData?.txnUrl ??
      rawData?.payment?.txnUrl ??
      rawData?.transactionUrl ??
      rawData?.payment?.transactionUrl ??
      "",
    proofImageUrl:
      rawData?.proofImageUrl ??
      rawData?.payment?.proofImageUrl ??
      rawData?.receiptUrl ??
      rawData?.payment?.receiptUrl ??
      rawData?.proofOfPaymentUrl ??
      rawData?.payment?.proofOfPaymentUrl ??
      "",
    submittedAt:
      rawData?.submittedAt ??
      rawData?.payment?.submittedAt ??
      rawData?.createdAt ??
      rawData?.payment?.createdAt ??
      rawData?.updatedAt ??
      rawData?.payment?.updatedAt ??
      null,
    status: rawData?.status ?? rawData?.payment?.status ?? "pending",
    displayStatus:
      rawData?.displayStatus ??
      rawData?.payment?.displayStatus ??
      rawData?.status ??
      rawData?.payment?.status ??
      "pending",
  });
};

const normalizeCustomerOrderHistoryResponse = (payload) => {
  const rawData = payload?.data ?? payload ?? {};
  const order =
    rawData?.order && typeof rawData.order === "object" ? rawData.order : null;
  const summary =
    rawData?.summary && typeof rawData.summary === "object"
      ? rawData.summary
      : {};
  const timeline = Array.isArray(rawData?.timeline)
    ? rawData.timeline.filter((event) => event && typeof event === "object")
    : [];

  return {
    order,
    summary,
    timeline,
  };
};

const ADMIN_WEEKDAY_SHORTS = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const normalizeAdminCountry = (order) => {
  const rawCountry = String(
    pickFirst(
      order?.countryCode,
      order?.country,
      order?.countryPool,
      order?.deliveryCountry,
      "US",
    ),
  )
    .trim()
    .toLowerCase();

  if (rawCountry.includes("canada") || rawCountry === "ca") {
    return { code: "CA", label: "Canada" };
  }

  return { code: "US", label: "United States" };
};

const normalizeAdminCreatedByLabel = (order) => {
  const createdByName = pickFirst(
    order?.createdBy?.name,
    order?.createdByName,
    order?.createdByLabel,
    order?.createdByUser?.name,
  );
  if (createdByName) return createdByName;

  const createdByRole = String(
    pickFirst(order?.createdBy?.role, order?.createdByRole, order?.source, ""),
  )
    .trim()
    .toLowerCase();

  if (createdByRole === "admin") return "Admin";
  if (createdByRole === "client" || createdByRole === "customer")
    return "Customer";

  const createdById = String(
    pickFirst(order?.createdBy?._id, order?.createdBy, ""),
  ).trim();
  const customerId = String(
    pickFirst(
      order?.customer?._id,
      order?.customer,
      order?.client?._id,
      order?.clientUserId,
      order?.customerId,
      "",
    ),
  ).trim();

  if (createdById && customerId && createdById !== customerId) {
    return "Admin";
  }

  if (createdById && customerId && createdById === customerId) {
    return "Customer";
  }

  return "Admin";
};

const normalizeAdminDeliveryDaysLabel = (order) => {
  const scenario = String(order?.deliveryScenario || "")
    .trim()
    .toLowerCase();
  const weeks = toNumber(order?.deliveryConfig?.weeks, 0);
  if (scenario === "scheduled" || weeks > 1) {
    const safeWeeks = Math.max(1, weeks || 1);
    return `${safeWeeks} week${safeWeeks === 1 ? "" : "s"}`;
  }

  const daily = Array.isArray(order?.daily)
    ? order.daily.filter((day) => day && typeof day === "object")
    : [];

  const weekdays = daily
    .map((day) =>
      normalizeOrderDay(
        pickFirst(day?.weekday, day?.day, day?.dayName, day?.label, day?.name),
      ),
    )
    .filter(Boolean);

  if (weekdays.length === 1) return weekdays[0];

  if (
    weekdays.length === 5 &&
    weekdays[0] === "Monday" &&
    weekdays[4] === "Friday"
  ) {
    return "Mon - Fri";
  }

  if (weekdays.length > 1) {
    const first = ADMIN_WEEKDAY_SHORTS[weekdays[0]] || weekdays[0].slice(0, 3);
    const last =
      ADMIN_WEEKDAY_SHORTS[weekdays[weekdays.length - 1]] ||
      weekdays[weekdays.length - 1].slice(0, 3);
    return `${first} - ${last}`;
  }

  const fallbackDay = normalizeOrderDay(
    pickFirst(
      order?.deliveryConfig?.selectedDay,
      order?.deliveryConfig?.startDay,
      order?.deliveryConfig?.day,
    ),
  );

  if (fallbackDay) return fallbackDay;

  return "Pending";
};

const normalizeAdminOrderRecord = (order) => {
  if (!order || typeof order !== "object") return null;

  const requested = toNumber(
    pickFirst(
      order?.totals?.requested,
      order?.deliveryConfig?.totalLeads,
      order?.quantity,
    ),
  );
  const delivered = toNumber(
    pickFirst(order?.totals?.delivered, order?.filled, 0),
  );
  const country = normalizeAdminCountry(order);
  const createdByLabel = normalizeAdminCreatedByLabel(order);
  const deliveryDaysLabel = normalizeAdminDeliveryDaysLabel(order);
  const customerName = pickFirst(
    order?.customer?.name,
    order?.client?.name,
    order?.customerName,
    order?.clientName,
  );
  const customerId = pickFirst(
    order?.customer?._id,
    order?.customer,
    order?.client?._id,
    order?.clientUserId,
    order?.customerId,
    null,
  );
  const createdById = pickFirst(
    order?.createdBy?._id,
    order?.createdBy,
    order?.createdById,
    null,
  );
  const displayStatus =
    order?.displayStatus ||
    order?.status ||
    order?.fulfillmentStatus ||
    order?.approvalStatus ||
    "pending";

  return {
    ...order,
    _id: order?._id ?? order?.id ?? null,
    id: order?.id ?? order?._id ?? null,
    publicId: order?.publicId ?? order?.customId ?? order?._id ?? null,
    customerId: customerId ?? null,
    customerName: customerName || customerId || "Unknown Customer",
    customer:
      order?.customer && typeof order.customer === "object"
        ? order.customer
        : {
            _id: customerId ?? null,
            name: customerName || customerId || "Unknown Customer",
            email: order?.customer?.email ?? order?.customerEmail ?? "",
          },
    client:
      order?.client && typeof order.client === "object"
        ? order.client
        : {
            _id: customerId ?? null,
            name: customerName || customerId || "Unknown Customer",
            email: order?.customer?.email ?? order?.customerEmail ?? "",
          },
    createdBy:
      order?.createdBy && typeof order.createdBy === "object"
        ? order.createdBy
        : (order?.createdBy ?? null),
    createdById: createdById ?? null,
    createdByLabel,
    countryCode: country.code,
    country: country.label,
    countryLabel: country.label,
    requested,
    delivered,
    quantity: requested,
    filled: delivered,
    quantityUsage: `${delivered.toLocaleString()} / ${requested.toLocaleString()}`,
    deliveryDaysLabel,
    deliveryType: order?.deliveryScenario ?? order?.deliveryType ?? "-",
    displayStatus,
    status: displayStatus,
    orderStatus: order?.orderStatus ?? displayStatus,
    daily: Array.isArray(order?.daily) ? order.daily : [],
    dailyQuantity:
      order?.deliveryScenario === "staggered"
        ? toNumber(
            order?.deliveryConfig?.leadsPerDay,
            order?.dailyQuantity ?? 0,
          )
        : order?.deliveryScenario === "scheduled"
          ? toNumber(
              order?.deliveryConfig?.leadsPerWeek,
              order?.dailyQuantity ?? 0,
            )
          : toNumber(
              order?.deliveryConfig?.totalLeads,
              order?.dailyQuantity ?? 0,
            ),
  };
};

const normalizeAdminOrderResponse = (
  payload,
  { page = 1, limit = LIMIT, search = "" } = {},
) => {
  const rawPayload = payload?.data ?? payload;
  const rawOrders = normalizeOrderCollection(rawPayload);
  const normalizedOrders = rawOrders
    .map(normalizeAdminOrderRecord)
    .filter(Boolean);
  const searchTerm = String(search || "")
    .trim()
    .toLowerCase();
  const backendPagination =
    payload?.pagination ??
    rawPayload?.pagination ??
    payload?.meta?.pagination ??
    null;
  const hasBackendPagination =
    backendPagination && typeof backendPagination === "object"
      ? Object.keys(backendPagination).length > 0
      : false;

  const filteredOrders = searchTerm
    ? normalizedOrders.filter((order) => {
        const haystack = [
          order?.publicId,
          order?.customerName,
          order?.createdByLabel,
          order?.displayStatus,
          order?.orderType,
          order?.deliveryDaysLabel,
          order?.country,
          ...(Array.isArray(order?.daily)
            ? order.daily.flatMap((day) => [
                day?.weekday,
                day?.publicId,
                day?._id,
              ])
            : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchTerm);
      })
    : normalizedOrders;

  const resolvedLimit = Math.max(1, Number(limit) || LIMIT);
  const resolvedPage = Math.max(1, Number(page) || 1);
  const total =
    toNumber(
      backendPagination?.total ??
        backendPagination?.count ??
        backendPagination?.meta?.total ??
        filteredOrders.length,
    ) || filteredOrders.length;
  const pages =
    toNumber(
      backendPagination?.pages ??
        backendPagination?.totalPages ??
        backendPagination?.pageCount,
    ) || Math.max(1, Math.ceil(total / resolvedLimit));
  const currentPage =
    toNumber(
      backendPagination?.page ??
        backendPagination?.currentPage ??
        backendPagination?.pageNumber,
      resolvedPage,
    ) || resolvedPage;
  const paginatedOrders = hasBackendPagination
    ? filteredOrders
    : filteredOrders.slice(
        (Math.min(currentPage, pages) - 1) * resolvedLimit,
        (Math.min(currentPage, pages) - 1) * resolvedLimit + resolvedLimit,
      );

  return {
    data: paginatedOrders,
    pagination: {
      page: currentPage,
      limit: resolvedLimit,
      total,
      pages,
      hasNextPage:
        backendPagination?.hasNextPage ??
        backendPagination?.has_next_page ??
        currentPage < pages,
      hasPrevPage:
        backendPagination?.hasPrevPage ??
        backendPagination?.has_prev_page ??
        currentPage > 1,
    },
    meta: {
      total,
      returned: paginatedOrders.length,
    },
  };
};

const ADMIN_CUSTOMER_COLLECTION_KEYS = [
  "data",
  "customers",
  "results",
  "items",
  "docs",
];

const normalizeAdminCustomerCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of ADMIN_CUSTOMER_COLLECTION_KEYS) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
};

const normalizeAdminCustomerRecord = (record) => {
  if (!record || typeof record !== "object") return record;

  const customer =
    record?.customer && typeof record.customer === "object"
      ? record.customer
      : record;
  const summary =
    record?.summary && typeof record.summary === "object"
      ? record.summary
      : record;
  const orders = Array.isArray(record?.orders) ? record.orders : [];

  const latestOrderDate = orders.reduce((latest, current) => {
    const currentDate = new Date(current?.createdAt || current?.updatedAt || 0);
    if (Number.isNaN(currentDate.getTime())) return latest;
    if (!latest) return currentDate;
    return currentDate > latest ? currentDate : latest;
  }, null);

  return {
    ...record,
    ...customer,
    _id: customer?._id ?? record?._id ?? record?.id ?? record?.customerId ?? null,
    name:
      customer?.name ??
      record?.name ??
      record?.customerName ??
      "Unknown Customer",
    email: customer?.email ?? record?.email ?? "",
    createdAt: customer?.createdAt ?? record?.createdAt ?? null,
    updatedAt: customer?.updatedAt ?? record?.updatedAt ?? null,
    totalOrders: toNumber(summary?.totalOrders ?? record?.totalOrders ?? 0),
    activeOrders: toNumber(summary?.activeOrders ?? record?.activeOrders ?? 0),
    totalLeadsReceived: toNumber(
      summary?.totalLeadsReceived ?? record?.totalLeadsReceived ?? 0,
    ),
    totalSpent: toNumber(summary?.totalSpent ?? record?.totalSpent ?? 0),
    lastOrderDate:
      record?.lastOrderDate ??
      latestOrderDate?.toISOString?.() ??
      record?.updatedAt ??
      customer?.updatedAt ??
      null,
    orders,
  };
};

const normalizeAdminCustomerResponse = (
  payload,
  { page = 1, limit = LIMIT, search = "" } = {},
) => {
  const rawPayload = payload?.data ?? payload;
  const rawCustomers = normalizeAdminCustomerCollection(rawPayload);
  const normalizedCustomers = rawCustomers
    .map(normalizeAdminCustomerRecord)
    .filter(Boolean);
  const backendPagination =
    payload?.pagination ??
    rawPayload?.pagination ??
    payload?.meta?.pagination ??
    null;
  const hasBackendPagination =
    backendPagination && typeof backendPagination === "object"
      ? Object.keys(backendPagination).length > 0
      : false;
  const searchTerm = String(search || "")
    .trim()
    .toLowerCase();

  const filteredCustomers =
    searchTerm && !hasBackendPagination
      ? normalizedCustomers.filter((customer) => {
          const haystack = [
            customer?._id,
            customer?.customId,
            customer?.name,
            customer?.email,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(searchTerm);
        })
      : normalizedCustomers;

  const resolvedLimit = Math.max(1, Number(limit) || LIMIT);
  const resolvedPage = Math.max(1, Number(page) || 1);
  const total =
    toNumber(
      backendPagination?.total ??
        backendPagination?.count ??
        backendPagination?.meta?.total ??
        filteredCustomers.length,
    ) || filteredCustomers.length;
  const pages =
    toNumber(
      backendPagination?.pages ??
        backendPagination?.totalPages ??
        backendPagination?.pageCount,
    ) || Math.max(1, Math.ceil(total / resolvedLimit));
  const currentPage =
    toNumber(
      backendPagination?.page ??
        backendPagination?.currentPage ??
        backendPagination?.pageNumber,
      resolvedPage,
    ) || resolvedPage;
  const paginatedCustomers = hasBackendPagination
    ? filteredCustomers
    : filteredCustomers.slice(
        (Math.min(currentPage, pages) - 1) * resolvedLimit,
        (Math.min(currentPage, pages) - 1) * resolvedLimit + resolvedLimit,
      );

  return {
    data: paginatedCustomers,
    pagination: {
      page: currentPage,
      limit: resolvedLimit,
      total,
      pages,
      hasNextPage:
        backendPagination?.hasNextPage ??
        backendPagination?.has_next_page ??
        currentPage < pages,
      hasPrevPage:
        backendPagination?.hasPrevPage ??
        backendPagination?.has_prev_page ??
        currentPage > 1,
    },
    meta: {
      total,
      returned: paginatedCustomers.length,
    },
  };
};

const normalizeAdminImportBatchesOverviewResponse = (payload) => {
  const rawData = payload?.data ?? payload ?? {};
  const tooltips =
    rawData?.tooltips && typeof rawData.tooltips === "object"
      ? rawData.tooltips
      : {};

  return {
    ...rawData,
    totalLeadsUploaded: toNumber(rawData?.totalLeadsUploaded, 0),
    rolling24hDuplicateCount: toNumber(rawData?.rolling24hDuplicateCount, 0),
    historicalDuplicateCount: toNumber(rawData?.historicalDuplicateCount, 0),
    duplicateRate: toNumber(rawData?.duplicateRate, 0),
    daysSinceSetup: toNumber(rawData?.daysSinceSetup, 0),
    todaysLeads: toNumber(rawData?.todaysLeads, 0),
    averageDailyLeads: toNumber(rawData?.averageDailyLeads, 0),
    totalClients: toNumber(rawData?.totalClients, 0),
    totalLeadsGenerated: toNumber(rawData?.totalLeadsGenerated, 0),
    statusLabel: rawData?.statusLabel ?? "Active",
    tooltips,
  };
};

const normalizeWeekday = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized.startsWith("mon")) return "Monday";
  if (normalized.startsWith("tue")) return "Tuesday";
  if (normalized.startsWith("wed")) return "Wednesday";
  if (normalized.startsWith("thu")) return "Thursday";
  if (normalized.startsWith("fri")) return "Friday";
  return null;
};

const normalizeFulfillmentReport = (report) => {
  const buckets = Object.fromEntries(WEEKDAYS.map((day) => [day, 0]));

  if (Array.isArray(report)) {
    report.forEach((item) => {
      const day = normalizeWeekday(
        pickFirst(item?.day, item?.weekday, item?.name, item?.label),
      );
      if (!day) return;
      const count = toNumber(
        pickFirst(item?.count, item?.total, item?.quantity, item?.value),
      );
      buckets[day] += count;
    });
  } else if (report && typeof report === "object") {
    Object.entries(report).forEach(([key, value]) => {
      const day = normalizeWeekday(key);
      if (!day) return;
      buckets[day] += toNumber(value);
    });
  }

  return WEEKDAYS.map((day) => ({
    name: day,
    short: day.slice(0, 3),
    value: toNumber(buckets[day]),
  }));
};

const normalizeTopPurchased = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const label = pickFirst(
        item?.type,
        item?.leadType,
        item?.bank,
        item?.name,
        item?.title,
      );

      const count = toNumber(
        pickFirst(
          item?.requestedQuantity,
          item?.quantity,
          item?.count,
          item?.total,
          item?.value,
        ),
      );

      return {
        ...item,
        label: label || "Unknown",
        count,
        quantity: count,
      };
    })
    .filter((item) => item.count > 0);
};

const buildDashboardShape = ({
  raw,
  delivered,
  totalReceived,
  target,
  changePct,
  pendingPricing,
  awaitingPayment,
  processingOrder,
  activeOrders,
  fulfillmentReport,
  topPurchased,
  recentOrders,
  breakdown,
  orderRate = null,
}) => {
  const normalizedTopPurchased = normalizeTopPurchased(topPurchased);
  const normalizedFulfillment = normalizeFulfillmentReport(fulfillmentReport);
  const safeActiveOrders = toNumber(
    pickFirst(activeOrders, pendingPricing + awaitingPayment + processingOrder),
  );

  return {
    ...raw,
    raw,
    kpis: {
      weeklyLeads: {
        value: toNumber(pickFirst(raw?.kpis?.weeklyLeads?.value, delivered)),
        delivered: toNumber(delivered),
        totalReceived: toNumber(totalReceived),
        target: toNumber(target, 2500),
        progressPct: toNumber(
          pickFirst(raw?.kpis?.weeklyLeads?.progressPct, (toNumber(delivered) / toNumber(target, 2500)) * 100),
        ),
        trendPctVsLastWeek: toNumber(
          pickFirst(raw?.kpis?.weeklyLeads?.trendPctVsLastWeek, changePct),
        ),
        totalLeadsReceived: toNumber(
          pickFirst(raw?.kpis?.weeklyLeads?.totalLeadsReceived, totalReceived),
        ),
        todaysLeads: toNumber(
          pickFirst(raw?.kpis?.weeklyLeads?.todaysLeads, delivered),
        ),
        weekStart: raw?.kpis?.weeklyLeads?.weekStart ?? null,
        weekEnd: raw?.kpis?.weeklyLeads?.weekEnd ?? null,
        liveStatus: raw?.kpis?.weeklyLeads?.liveStatus ?? "live",
        changePct: toNumber(
          pickFirst(raw?.kpis?.weeklyLeads?.changePct, changePct),
        ),
      },
    },
    ordersPipeline: {
      activeCreatedOrders: toNumber(
        pickFirst(raw?.ordersPipeline?.activeCreatedOrders, activeOrders),
      ),
      statuses: Array.isArray(raw?.ordersPipeline?.statuses)
        ? raw.ordersPipeline.statuses.map((item) => ({
            ...item,
            count: toNumber(item?.count),
            pct: toNumber(item?.pct),
          }))
        : [
            {
              key: "pending",
              label: "Pending",
              count: toNumber(pendingPricing),
              pct: 0,
            },
            {
              key: "paid",
              label: "Paid",
              count: toNumber(awaitingPayment),
              pct: 0,
            },
            {
              key: "processing",
              label: "Processing",
              count: toNumber(processingOrder),
              pct: 0,
            },
          ],
      pendingPricing: toNumber(pendingPricing),
      awaitingPayment: toNumber(awaitingPayment),
      processingOrder: toNumber(processingOrder),
      activeOrders: safeActiveOrders,
    },
    fulfillmentReport: normalizedFulfillment,
    topPurchased: normalizedTopPurchased,
    recentOrders: Array.isArray(recentOrders) ? recentOrders : [],

    // Legacy fields still consumed by current Home UI.
    leadsDeliveredToday: toNumber(delivered),
    totalLeadsReceived: toNumber(totalReceived),
    weeklyTarget: toNumber(target, 2500),
    leadsDeliveredTodayChangePct: toNumber(changePct),
    activeOrders: safeActiveOrders,
    bankBreakdown: breakdown === "banks" ? normalizedTopPurchased : [],
    leadTypeBreakdown: breakdown === "types" ? normalizedTopPurchased : [],
    orderRate,
  };
};

const normalizeDashboardOverview = (payload, breakdown = "types") => {
  const data = payload || {};
  const weekly = data?.kpis?.weeklyLeads;

  const delivered =
    typeof weekly === "number"
      ? weekly
      : pickFirst(
          weekly?.delivered,
          weekly?.current,
          weekly?.value,
          weekly?.leads,
        );

  const totalReceived = pickFirst(
    weekly?.total,
    weekly?.totalReceived,
    weekly?.received,
    data?.kpis?.totalLeads,
    delivered,
  );

  const target = pickFirst(
    weekly?.target,
    weekly?.goal,
    weekly?.weeklyTarget,
    2500,
  );
  const changePct = pickFirst(
    weekly?.changePct,
    weekly?.deltaPct,
    weekly?.change,
    0,
  );

  const pendingPricing = pickFirst(
    data?.ordersPipeline?.pendingPricing,
    data?.ordersPipeline?.pending_pricing,
    data?.ordersPipeline?.pending,
  );
  const awaitingPayment = pickFirst(
    data?.ordersPipeline?.awaitingPayment,
    data?.ordersPipeline?.awaiting_payment,
    data?.ordersPipeline?.awaiting,
  );
  const processingOrder = pickFirst(
    data?.ordersPipeline?.processingOrder,
    data?.ordersPipeline?.processing_order,
    data?.ordersPipeline?.processing,
  );
  const activeOrders = pickFirst(data?.ordersPipeline?.activeOrders, null);

  return buildDashboardShape({
    raw: data,
    delivered,
    totalReceived,
    target,
    changePct,
    pendingPricing,
    awaitingPayment,
    processingOrder,
    activeOrders,
    fulfillmentReport: data?.fulfillmentReport,
    topPurchased: data?.topPurchased,
    recentOrders: data?.recentOrders,
    breakdown,
    orderRate: data?.orderRate ?? null,
  });
};

const normalizeAdminDashboardList = (value) =>
  normalizeOrderCollection(value)
    .map((item) => normalizeAdminOrderRecord(item))
    .filter(Boolean);

const normalizeAdminDashboardRevenue = (value) => {
  const revenue = value && typeof value === "object" ? value : {};
  const totalIncome = toNumber(
    pickFirst(
      revenue.totalIncome,
      revenue.totalRevenue,
      revenue.amount,
      revenue.revenue,
      revenue.total,
      revenue.value,
      revenue.income,
      revenue.grossRevenue,
      revenue.netRevenue,
    ),
  );
  const trendPctVsLastMonth = toNumber(
    pickFirst(
      revenue.trendPctVsLastMonth,
      revenue.changePct,
      revenue.deltaPct,
      revenue.growthPct,
      revenue.rate,
      revenue.orderRate,
      revenue.percentageChange,
    ),
  );
  const series = Array.isArray(revenue.series)
    ? revenue.series
        .filter((item) => item && typeof item === "object")
        .map((item, index) => {
          return {
            ...item,
            label: item?.label ?? item?.name ?? item?.month ?? item?.period ?? item?.key ?? `Item ${index + 1}`,
            totalRevenue: toNumber(pickFirst(item?.totalRevenue, item?.amount, item?.value, item?.total, 0)),
            adminOrderCount: toNumber(item?.adminOrderCount, 0),
            customerOrderCount: toNumber(item?.customerOrderCount, 0),
            orderCount: toNumber(item?.orderCount, 0),
          };
        })
    : [];

  return {
    ...revenue,
    totalIncome,
    totalRevenue: totalIncome,
    amount: totalIncome,
    trendPctVsLastMonth,
    changePct: trendPctVsLastMonth,
    orderRate: toNumber(pickFirst(revenue.orderRate, trendPctVsLastMonth)),
    series,
  };
};

const normalizeAdminDashboardOrdersPipeline = (value) => {
  const pipeline = value && typeof value === "object" ? value : {};
  const statuses = Array.isArray(pipeline.statuses)
    ? pipeline.statuses
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          ...item,
          key: item?.key ?? item?.status ?? item?.label ?? null,
          label: item?.label ?? item?.statusLabel ?? item?.status ?? "Unknown",
          count: toNumber(item?.count, 0),
          pct: toNumber(item?.pct, 0),
        }))
    : [];

  const findStatusCount = (...matchers) => {
    const found = statuses.find((item) =>
      matchers.some((matcher) => {
        const target = String(matcher).toLowerCase();
        return (
          String(item?.key ?? "").toLowerCase() === target ||
          String(item?.label ?? "").toLowerCase() === target
        );
      }),
    );

    return toNumber(found?.count, 0);
  };

  const total = toNumber(
    pickFirst(pipeline.total, pipeline.count, pipeline.value, pipeline.activeOrders),
  );
  const pendingPricing = findStatusCount("pending", "pending pricing", "pending_pricing");
  const awaitingPayment = findStatusCount("paid", "awaiting payment", "awaiting_payment");
  const processingOrder = findStatusCount("processing", "in progress", "in_progress");
  const activeOrders = total || pendingPricing + awaitingPayment + processingOrder;

  return {
    ...pipeline,
    total,
    statuses,
    pendingPricing,
    awaitingPayment,
    processingOrder,
    activeOrders,
  };
};

const normalizeAdminDashboardCustomerStats = (value) => {
  const stats = value && typeof value === "object" ? value : {};
  const totalCustomers = toNumber(
    pickFirst(
      stats.totalCustomers,
      stats.customers,
      stats.total,
      stats.count,
      stats.customerCount,
    ),
  );
  const activeOrders = toNumber(
    pickFirst(
      stats.activeCustomersLast14Days,
      stats.activeOrders,
      stats.active,
      stats.activeCount,
    ),
  );
  const todaysLeads = toNumber(
    pickFirst(
      stats.todaysLeads,
      stats.todayLeads,
      stats.leadsToday,
      stats.today,
      stats.dailyLeads,
    ),
  );
  const totalLeadsGenerated = toNumber(
    pickFirst(
      stats.totalLeadsGenerated,
      stats.totalLeads,
      stats.generatedLeads,
      stats.leadsGenerated,
    ),
  );
  const changePct = toNumber(
    pickFirst(stats.changePct, stats.deltaPct, stats.growthPct, stats.rate),
  );

  return {
    ...stats,
    totalCustomers,
    activeCustomersLast14Days: activeOrders,
    activeOrders,
    todaysLeads,
    totalLeadsGenerated,
    todaysLeadsChangePct: toNumber(
      pickFirst(
        stats.todaysLeadsChangePct,
        stats.todaysLeadsChange,
        stats.changePct,
        stats.deltaPct,
        stats.growthPct,
        changePct,
      ),
    ),
    changePct,
  };
};

const normalizeAdminDashboardOverview = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const revenue = normalizeAdminDashboardRevenue(data?.revenue);
  const ordersPipeline = normalizeAdminDashboardOrdersPipeline(
    data?.ordersPipeline,
  );
  const customerStats = normalizeAdminDashboardCustomerStats(
    data?.customerStats,
  );
  const pendingApproval = normalizeAdminDashboardList(
    pickFirst(data?.pendingApproval, data?.pendingOrders, data?.pending, []),
  );
  const recentOrders = normalizeAdminDashboardList(
    pickFirst(data?.recentOrders, data?.recent_orders, data?.orders, []),
  );
  const delivered = toNumber(
    pickFirst(
      customerStats.todaysLeads,
      revenue.totalIncome,
      revenue.totalRevenue,
      revenue.amount,
    ),
  );
  const totalReceived = toNumber(
    pickFirst(
      customerStats.totalLeadsGenerated,
      customerStats.totalLeads,
      revenue.totalIncome,
      revenue.totalRevenue,
      revenue.total,
      delivered,
    ),
  );
  const target = toNumber(
    pickFirst(
      revenue.totalIncome,
      revenue.totalRevenue,
      revenue.amount,
      customerStats.totalLeadsGenerated,
      2500,
    ),
    2500,
  );
  const changePct = toNumber(
    pickFirst(
      revenue.trendPctVsLastMonth,
      revenue.changePct,
      customerStats.todaysLeadsChangePct,
      customerStats.changePct,
      revenue.orderRate,
      0,
    ),
  );
  const activeOrders = toNumber(
    pickFirst(
      customerStats.activeCustomersLast14Days,
      customerStats.activeOrders,
      ordersPipeline.activeOrders,
      pendingApproval.length,
    ),
  );

  return {
    revenue,
    ordersPipeline,
    customerStats,
    pendingApproval,
    recentOrders,
    kpis: {
      weeklyLeads: {
        delivered,
        totalReceived,
        target,
        changePct,
      },
    },
    leadsDeliveredToday: delivered,
    totalLeadsReceived: totalReceived,
    weeklyTarget: target,
    leadsDeliveredTodayChangePct: changePct,
    activeOrders,
    bankBreakdown: [],
    leadTypeBreakdown: [],
    orderRate: toNumber(pickFirst(revenue.orderRate, changePct)),
  };
};

const buildUrl = (base, params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${base}?${query}` : base;
};

const normalizeAdminImportBatchLeadsResponse = (payload) => {
  const rawData = payload?.data ?? payload ?? {};

  return {
    batch:
      rawData?.batch && typeof rawData.batch === "object" ? rawData.batch : {},
    leads: Array.isArray(rawData?.leads)
      ? rawData.leads.filter((lead) => lead && typeof lead === "object")
      : [],
    pagination: payload?.pagination ?? rawData?.pagination ?? null,
    meta: payload?.meta ?? rawData?.meta ?? null,
  };
};

export const fetchDashboard = async (
  token,
  { range = "this_month", breakdown = "types", recentLimit = 6 } = {},
) => {
  const safeLimit = Math.min(20, Math.max(1, toNumber(recentLimit, 6)));
  const overviewUrl = "/api/v2/dashboard/overview";

  try {
    const res = await api.get(overviewUrl, {
      params: {
        range,
        breakdown,
        recentLimit: safeLimit,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return normalizeDashboardOverview(res.data?.data, breakdown);
  } catch (error) {
    console.groupCollapsed("[dashboardApi] V2 dashboard request failed");
    console.error("Request URL:", overviewUrl);
    console.error("Query Params:", {
      range,
      breakdown,
      recentLimit: safeLimit,
    });
    console.error("HTTP Status:", error?.response?.status ?? null);
    console.error("Response Data:", error?.response?.data ?? null);
    console.error("Response Headers:", error?.response?.headers ?? null);
    console.error("Axios Error:", {
      message: error?.message ?? null,
      code: error?.code ?? null,
    });
    console.groupEnd();

    if (error && typeof error === "object") {
      error.dashboardRequest = "v2_overview_failed";
    }
    throw error;
  }
};

export const fetchAllOrders = async (token, page, search) => {
  const res = await api.get(CUSTOMER_ORDERS_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalizeOrderResponse(res.data, {
    page: 1,
    limit: Number.MAX_SAFE_INTEGER,
    search,
  });
};

export const fetchCustomerTransactionHistory = async (token) => {
  const res = await api.get(CUSTOMER_TRANSACTION_HISTORY_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalizeCustomerTransactionResponse(res.data);
};

export const fetchCustomerOrderHistory = async (token, orderId) => {
  if (!orderId) return null;

  const res = await api.get(
    `${CUSTOMER_ORDER_HISTORY_ENDPOINT}/${orderId}/history`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return normalizeCustomerOrderHistoryResponse(res.data);
};

export const fetchAdminOrderHistory = async (token, orderId) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) return null;

  const res = await api.get(
    `${ADMIN_ORDER_HISTORY_ENDPOINT}/${orderId}/history`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return normalizeCustomerOrderHistoryResponse(res.data);
};

export const fetchAdminImportBatchesOverview = async (token) => {
  if (!token) throw new Error("No auth token");

  const res = await api.get(ADMIN_IMPORT_BATCHES_OVERVIEW_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return normalizeAdminImportBatchesOverviewResponse(res.data);
};

export const fetchAdminImportBatchLeads = async (
  token,
  batchId,
  { page = 1, limit = LIMIT, search = "", usage = "all" } = {},
) => {
  if (!token) throw new Error("No auth token");
  if (!batchId) return null;

  const url = buildUrl(`${ADMIN_IMPORT_BATCH_LEADS_ENDPOINT}/${batchId}/leads`, {
    q: search,
    usage,
    page,
    limit,
  });

  const res = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return normalizeAdminImportBatchLeadsResponse(res.data);
};

export const fetchAdminTransactions = async (token, page, search) => {
  const url = buildUrl(ADMIN_TRANSACTIONS_ENDPOINT, {
    q: search,
    page,
    limit: LIMIT,
  });

  const res = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return normalizeAdminTransactionResponse(res.data, {
    page,
    limit: LIMIT,
    search,
  });
};

export const fetchAdminTransactionDetail = async (token, transactionId) => {
  if (!token) throw new Error("No auth token");
  if (!transactionId) return null;

  const res = await api.get(
    `${ADMIN_TRANSACTION_DETAIL_ENDPOINT}/${transactionId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return normalizeAdminTransactionDetailResponse(res.data);
};

export const fetchCustomerOrderLeadsByDay = async (
  token,
  orderId,
  dayId,
  page = 1,
  limit = LIMIT,
) => {
  if (!orderId || !dayId) return null;

  const res = await api.get(
    buildUrl(`${CUSTOMER_ORDER_LEADS_BY_DAY_ENDPOINT}/${orderId}/leads-by-day`, {
      dayId,
      page,
      limit,
    }),
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return {
    data: Array.isArray(res.data?.data) ? res.data.data : [],
    pagination: res.data?.pagination ?? res.data?.data?.pagination ?? null,
    meta: res.data?.meta ?? null,
  };
};

export const recordCustomerOrderOpen = async (token, orderId, payload = {}) => {
  if (!orderId) return null;

  const res = await api.post(
    `${CUSTOMER_ORDER_ACTIVITY_OPEN_ENDPOINT}/${orderId}/activity/open`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const recordCustomerOrderDownload = async (
  token,
  orderId,
  payload = {},
) => {
  if (!orderId) return null;

  const res = await api.post(
    `${CUSTOMER_ORDER_ACTIVITY_DOWNLOAD_ENDPOINT}/${orderId}/activity/download`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const submitCustomerOrderPayment = async (
  token,
  orderId,
  payload = {},
) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.post(
    `${CUSTOMER_ORDER_PAYMENT_ENDPOINT}/${orderId}/payment`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const fetchOrderDetails = async (token, orderId) => {
  const res = await api.get(CUSTOMER_ORDERS_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const orders = normalizeOrderCollection(res.data?.data ?? res.data).map(
    normalizeOrder,
  );
  const normalizedOrderId = String(orderId ?? "").trim();
  return (
    orders.find(
      (order) =>
        [
          order?._id,
          order?.id,
          order?.customId,
          order?.publicId,
        ].some(
          (candidate) => String(candidate ?? "").trim() === normalizedOrderId,
        ),
    ) ?? null
  );
};

export const fetchAdminDashboard = async (token) => {
  const res = await api.get(ADMIN_DASHBOARD_OVERVIEW_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalizeAdminDashboardOverview(res.data);
};

export const fetchAllLeads = async (token, dayKey) => {
  const resolvedLimit = 100;

  const fetchLeadsPage = async (page) => {
    const url = buildUrl("/api/v2/admin/import-batches", {
      q: dayKey,
      page,
      limit: resolvedLimit,
    });

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rawPayload = res.data?.data ?? res.data ?? {};
    const rawRows = normalizeOrderCollection(rawPayload);
    const rows = rawRows
      .map((row) => {
        if (!row || typeof row !== "object") return null;

        const fulfillment =
          row?.fulfillment && typeof row.fulfillment === "object"
            ? row.fulfillment
            : {};
        const duplicates =
          row?.duplicates && typeof row.duplicates === "object"
            ? row.duplicates
            : {};

        const used = toNumber(pickFirst(fulfillment?.used, row?.used));
        const total = toNumber(
          pickFirst(fulfillment?.total, row?.total, row?.fulfilled, row?.filled),
        );
        const progressPct = toNumber(
          pickFirst(fulfillment?.progressPct, row?.progressPct),
        );

        return {
          ...row,
          id: row?.id ?? row?._id ?? null,
          dayKey: row?.id ?? row?._id ?? row?.dayKey ?? row?.title ?? null,
          title: row?.title ?? row?.source ?? row?.id ?? "Untitled Batch",
          source: row?.source ?? "-",
          fulfillment: {
            used,
            total,
            progressPct,
          },
          duplicates: {
            rolling24hCount: toNumber(
              pickFirst(duplicates?.rolling24hCount, row?.rolling24hCount),
            ),
            historicalCount: toNumber(
              pickFirst(duplicates?.historicalCount, row?.historicalCount),
            ),
            displayCount: toNumber(
              pickFirst(duplicates?.displayCount, row?.displayCount),
            ),
            totalDuplicateRows: toNumber(
              pickFirst(duplicates?.totalDuplicateRows, row?.totalDuplicateRows),
            ),
            duplicateRate: toNumber(
              pickFirst(duplicates?.duplicateRate, row?.duplicateRate),
            ),
          },
          lastUploadedAt:
            row?.lastUploadedAt ?? row?.updatedAt ?? row?.createdAt ?? null,
          uploadedBy: row?.uploadedBy ?? row?.createdBy ?? null,
          status: row?.status ?? "pending",
        };
      })
      .filter(Boolean);

    const backendPagination =
      res.data?.pagination ??
      rawPayload?.pagination ??
      res.data?.meta?.pagination ??
      null;

    return {
      rows,
      pagination: backendPagination,
    };
  };

  const firstPage = await fetchLeadsPage(1);
  const initialPagination = firstPage.pagination ?? {};
  const totalPages = toNumber(
    initialPagination?.pages ??
      initialPagination?.totalPages ??
      initialPagination?.pageCount,
    1,
  );

  const allRows = [...firstPage.rows];

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await fetchLeadsPage(page);
    allRows.push(...nextPage.rows);
  }

  return {
    data: allRows,
    pagination: {
      page: 1,
      limit: resolvedLimit,
      total: allRows.length,
      pages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    meta: {
      total: allRows.length,
      returned: allRows.length,
    },
  };
};

export const fetchAdminOrder = async (token, page, search) => {
  const url = buildUrl(ADMIN_ORDERS_ENDPOINT, {
    page,
    limit: LIMIT,
  });
  const res = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalizeAdminOrderResponse(res.data, { page, limit: LIMIT, search });
};

export const fetchUsers = async (token) => {
  const res = await api.get("/api/v1/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export const fetchAllCustomersForOrder = async (token) => {
  const resolvedLimit = 100;

  const fetchCustomersPage = async (page) => {
    const url = buildUrl("/api/v1/user/admin/customers", {
      page,
      limit: resolvedLimit,
    });

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const normalized = normalizeAdminCustomerResponse(res.data, {
      page,
      limit: resolvedLimit,
    });

    return {
      rows: Array.isArray(normalized?.data) ? normalized.data : [],
      pagination: normalized?.pagination ?? {},
    };
  };

  const firstPage = await fetchCustomersPage(1);
  const initialPagination = firstPage.pagination ?? {};
  const totalPages = toNumber(
    initialPagination?.pages ??
      initialPagination?.totalPages ??
      initialPagination?.pageCount,
    1,
  );

  const allRows = [...firstPage.rows];

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await fetchCustomersPage(page);
    allRows.push(...nextPage.rows);
  }

  return {
    data: allRows,
    pagination: {
      page: 1,
      limit: resolvedLimit,
      total: allRows.length,
      pages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    meta: {
      total: allRows.length,
      returned: allRows.length,
    },
  };
};

export const fetchAdminTopCustomers = async (token) => {
  if (!token) return [];

  const res = await api.get("/api/v2/admin/dashboard/top-customers", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const rows = normalizeOrderCollection(res.data?.data ?? res.data)
    .map((record) => {
      if (!record || typeof record !== "object") return null;
      const normalized = normalizeAdminCustomerRecord({
        ...record,
        id: record?.id ?? record?._id ?? null,
      });
      return {
        ...normalized,
        _id: normalized?._id ?? record?.id ?? record?._id ?? null,
        id: record?.id ?? normalized?._id ?? null,
        imagePreset: record?.imagePreset ?? normalized?.imagePreset ?? "",
      };
    })
    .filter(Boolean);

  return rows;
};

export const fetchAllCustomers = async (token, page, search) => {
  const url = buildUrl("/api/v1/user/admin/customers", {
    page,
    limit: LIMIT,
    search,
  });
  const res = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalizeAdminCustomerResponse(res.data, {
    page,
    limit: LIMIT,
    search,
  });
};

export const fetchAdminCustomerHistory = async (token, customerId) => {
  if (!customerId) return null;

  const res = await api.get(`/api/v2/admin/customers/${customerId}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data?.data ?? null;
};

export const createAdminOrder = async (token, payload) => {
  if (!token) throw new Error("No auth token");

  const res = await api.post(ADMIN_ORDERS_ENDPOINT, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data?.data ?? res.data ?? null;
};

export const updateAdminOrder = async (token, orderId, payload) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.put(`${ADMIN_ORDERS_ENDPOINT}/${orderId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data?.data ?? res.data ?? null;
};

export const setAdminOrderPrice = async (token, orderId, payload) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.post(
    `${ADMIN_ORDERS_ENDPOINT}/${orderId}/price`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const truncateAdminOrder = async (token, orderId) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.post(
    `${ADMIN_ORDERS_ENDPOINT}/${orderId}/truncate`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const recallAdminOrder = async (token, orderId, payload = {}) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.post(
    `${ADMIN_ORDERS_ENDPOINT}/${orderId}/recall`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const approveAdminOrderPayment = async (token, orderId) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.post(
    `${ADMIN_ORDERS_ENDPOINT}/${orderId}/payment/approve`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const rejectAdminOrderPayment = async (token, orderId, payload) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.post(
    `${ADMIN_ORDERS_ENDPOINT}/${orderId}/payment/reject`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data ?? res.data ?? null;
};

export const deleteAdminOrder = async (token, orderId) => {
  if (!token) throw new Error("No auth token");
  if (!orderId) throw new Error("Missing order id");

  const res = await api.delete(`${ADMIN_ORDERS_ENDPOINT}/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data?.data ?? res.data ?? null;
};

export const fetchDeadline = async (token) => {
  if (!token) throw new Error("No auth token");
  const res = await api.get("/api/v1/orders/admin/cutoff", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
