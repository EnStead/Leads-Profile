import LeadsOverview from "./LeadsOverview"


const Leads = () => {
  return (
    <section>
        <div className='flex justify-between items-center' >
            <div>
                <h2 className='text-brand-primary font-park font-bold text-xl mb-2' >
                    Daily Leads Page
                </h2>
                <p className='text-brand-subtext'>
                    Track and download leads generated each day.
                </p>
            </div>

            <div className="relative w-full max-w-xs">
            
                <input
                    type="text"
                    placeholder="Search by lead name or source"
                    className="w-full px-4 py-2 border bg-brand-white border-t-0 border-x-0 rounded-xl  focus:outline-none focus:ring-2 focus:ring-brand-gray"
                />
            </div>               

        </div>

        <LeadsOverview/>
        
    </section>
  )
}

export default Leads