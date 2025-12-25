import { DropdownMenu } from 'radix-ui';
import Image from '../../assets/Stack.png'
import { MoreVertical } from 'lucide-react';
import { Link } from 'react-router';
import { useDashboard } from '../../context/DashboardContext';
import CardSkeleton from '../../utility/skeletons/CardSkeleton';
import EmptyState from '../../utility/EmptyState';
import Pagination from '../../utility/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import api from '../../utility/axios';



const Cards = ({searchTerm}) => { 

    const { allOrdersData, allOrdersLoading, allOrdersError,page,setPage  } = useDashboard();
    // console.log(allOrdersData)
    const filteredLeads = allOrdersData?.data.filter((order) => {
        const term = searchTerm.toLowerCase();

        return (
            order.customId?.toLowerCase().includes(term)
        );
    });

    const { user } = useAuth(); //user


        const CSV_FIELDS = [
  { key: "dateTime", label: "Date & Time" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zipCode", label: "Zip" },
  { key: "bankName", label: "Bank" },
  { key: "incomeSource", label: "Source" },
  { key: "monthlyNetIncome", label: "Monthly Income" },
  { key: "subId", label: "SubId" },
  { key: "subId2", label: "SubId2" },
  { key: "birthday	", label: "Birthday	" },
  { key: "timeEmployed", label: "Time Employed" },
  { key: "rentOrOwn", label: "Rent Or Own" },
];


    const [downloadingDay, setDownloadingDay] = useState(null);
        
    const downloadCSV = async (orderId) => {
    try {
        setDownloadingDay(orderId);

        let allLeads = [];
        let page = 1;
        let hasMore = true;
        const limit = 100; // safe page size

        while (hasMore) {
        const res = await api.get(
            `/leads/order/${orderId}?page=${page}&limit=${limit}`,
            {
            headers: {
                Authorization: `Bearer ${user?.token}`,
            },
            }
        );

        const leads = res.data.data;
        const pagination = res.data.pagination;

        allLeads = [...allLeads, ...leads];

        if (!pagination || page >= pagination.pages) {
            hasMore = false;
        } else {
            page++;
        }
        }

        if (!allLeads.length) {
        alert("No leads available for this order");
        return;
        }

const headers = CSV_FIELDS.map((f) => f.label);

const csvRows = [
  headers.join(","),
  ...leads.map((lead) =>
    CSV_FIELDS.map((f) => `"${lead[f.key] ?? ""}"`).join(",")
  ),
];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orders-${orderId}.csv`;
        link.click();
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error("CSV download failed", err);
        alert("Failed to download CSV. Make sure you are logged in.");
    } finally {
        setDownloadingDay(null);
    }
    };

    const formatDate = (dateString) => {
        const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        };
        return new Date(dateString).toLocaleString(undefined, options);
    };

    if (allOrdersLoading) {
      return (
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    );;
    }


    if (allOrdersError) {
      return <p className="text-brand-red">Failed to load dashboard data.</p>;
    }

  return (

    <>
        {
            !filteredLeads.length  ?  <EmptyState /> :
            <section className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {Array.isArray(filteredLeads) && filteredLeads.map((item) => (
                        <div key={item._id} className="bg-transparent rounded-t-xl overflow-hidden relative">
                            <Link to={`/orders/${item._id}`}>
                                {/* IMAGE */}
                                <img src={Image} alt={'image'} className="w-full h-40 object-cover bg-brand-white" />
                            
                                {/* DETAILS */}
            
                                {/* Top Row: Last Modified + Menu */}
                                <div className="flex justify-between items-center my-2">
                                    <span className="text-xs text-brand-muted font-light">{formatDate(item.createdAt)}</span>
            
                                    {/* RADIX DROPDOWN MENU */}
                                    <DropdownMenu.Root className={'border-none shadow-md text-left'}>
                                        <DropdownMenu.Trigger asChild>
                                            <button className="p-1 bg-brand-white hover:bg-gray-100 rounded-full ">
                                                <MoreVertical size={18} />
                                            </button>
                                        </DropdownMenu.Trigger>
            
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content
                                                align="end"
                                                sideOffset={5}
                                                className="bg-white shadow-md rounded-lg p-1 z-10 text-left"
                                            >
                                                <DropdownMenu.Item className="px-3 py-2 text-sm boder-none! hover:bg-brand-sky cursor-pointer">
                                                    <Link to={`/orders/${item._id}`}>
                                                        View Details                                        
                                                    </Link>
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    disabled={!item.filled || downloadingDay === item._id}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        downloadCSV(item._id);
                                                    }}
                                                    className={`px-3 py-2 text-sm border border-brand-white hover:bg-brand-sky cursor-pointer ${
                                                        item.filled
                                                        ? "text-brand-blue hover:text-blue-700"
                                                        : "text-gray-400 cursor-not-allowed"
                                                    }`}
                                                >

                                                    {downloadingDay === item._id ? "Downloading..." : "Download as CSV"}
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </div>
            
                                <div>
                                    {/* Title */}
                                    <h3 className=" font-semibold font-park text-brand-primary">{item.customId}</h3>
            
                                    {/* Leads Progress */}
                                    <p className="text-sm font-medium text-brand-subtext mt-1">
                                        Leads Progress: {item.filled} / {item.quantity}
                                    </p>
                                </div>
            
                            </Link>
            
                        </div>
                    ))}
            </section>
        }
        <Pagination
            page={page}
            totalPages={allOrdersData?.pagination.pages}
            onPageChange={setPage}
        />
    </>

  )
}

export default Cards