import { useAdminDashboard } from "../../../context/DashboardContext";
import TableSkeleton from "../../../utility/skeletons/TableSkeleton";
import Pagination from "../../../utility/Pagination";
import EmptyState from "../../../utility/EmptyState";
import {
  getProfileImageSrc,
  PROFILE_BG_TONES,
} from "../../../utility/profilePresets";

const Table = ({ openDetailsModal }) => {
  const {
    customersData,
    customersLoading,
    customersError,
    page,
    setSearchParams,
  } = useAdminDashboard();

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > customersData?.pagination?.pages ||
      customersLoading
    )
      return;

    setSearchParams({ p: newPage });
  };

  const customers = customersData?.data ?? [];

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const getAvatarBgTone = (customer) => {
    const seed = String(
      customer?.imagePreset || customer?._id || customer?.email || customer?.name || "",
    );

    const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return PROFILE_BG_TONES[total % PROFILE_BG_TONES.length];
  };

  const getCustomerAvatarSrc = (customer) => {
    const presetId = String(customer?.imagePreset || "").trim();
    return presetId ? getProfileImageSrc(presetId) : getProfileImageSrc();
  };

  if (customersError) {
    return <p className="text-brand-red">Failed to load customers</p>;
  }

  return (
    <section className="w-full h-full">
      <style>{`
        @keyframes rowFadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .row-animate {
          animation: rowFadeInUp 300ms ease-out both;
        }
      `}</style>
      <div className="overflow-x-auto">
        {customersLoading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : !customers.length ? (
          <EmptyState />
        ) : (
        <table className="w-full border-collapse text-left">
          <thead className="capitalize">
            <tr>
              <th className="p-3 font-medium text-sm text-brand-placeholder ">
               Customer Id
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder ">
                Customer Name
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder ">
                Email Address
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Total Orders
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Active Orders
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Leads Recieved
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Last Order Date
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder text-right">
                Action
              </th>
            </tr>
          </thead>
 
          <tbody>
            {customers?.map((customer, index) => (
                <tr
                  key={customer._id}
                  className="border-b border-brand-stroke hover:bg-brand-white transition-colors duration-200 row-animate"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-3 font-light text-brand-body text-sm">
                    {customer.customId || customer._id}
                  </td>
                  <td className="p-3 font-light text-brand-body text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-stroke ${getAvatarBgTone(customer)}`}
                      >
                        <img
                          src={getCustomerAvatarSrc(customer)}
                          alt={customer.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span>{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    <a href={`mailto:${customer.email}`} className="hover:text-brand-blue hover:underline transition-colors">
                      {customer.email}
                    </a>
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    {Number(customer.totalOrders ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    {Number(customer.activeOrders ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    {Number(customer.totalLeadsDelivered ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    {formatDate(customer.lastOrderDate)}
                  </td>
                  <td className="p-3 text-right relative">
                    <button
                      onClick={() => openDetailsModal(customer)}
                      className="inline-flex items-center gap-1 text-brand-blue text-sm font-semibold transition-all duration-200 hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-white rounded-sm"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={customersData?.pagination?.pages}
        onPageChange={handlePageChange}
        loading={customersLoading}
      />
    </section>
  );
};

export default Table;

