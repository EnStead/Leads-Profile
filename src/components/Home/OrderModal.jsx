import { useState } from 'react';
import CustomSelect from '../../utility/CustomSelect';

const OrderModal = ({
  open,
  onClose,
  onSubmit,
}) => {

  const [form, setForm] = useState({
    quantity: "",
    preference: "",
    bank: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };  


  return open ? (
    <div   className="fixed inset-0 z-70 bg-black/20 flex items-center justify-center">
      <form className="bg-white rounded-2xl p-6 w-[500px] relative z-30" onSubmit={handleSubmit}>

        <button
            onClick={onClose}
            className="absolute top-2 right-4 text-black  py-1 px-3  z-10 cursor-pointer text-4xl font-medium"
        >
            ×
        </button>
        <h2 className="text-xl text-center font-park font-bold mb-1 text-brand-primary">
          Place a New Order
        </h2>
        <p className='font-normal text-center text-brand-subtext mb-4' >
          Tell us what you need, and we’ll review and send your pricing shortly.
        </p>

        {/* Ingredient */}
        <div className="flex flex-col">
          <label htmlFor="ingredient" className={`mb-1 font-medium transition text-brand-cartext
              ${form.quantity?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}
          `}
          > 
            Lead Quantity
          </label>
          <input
            id="quantity"
            type="text"
            name="quantity"
            placeholder="Number of leads you want?"
            value={form.quantity}
            // onChange={handleChange}
            className={`${form.quantity?.trim() !== "" ? "border-b-brand-primary" : "border-b-brand-gray"} border bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray `}
          />
        </div>

        {/* Selects side by side */}
        <div className="flex flex-col gap-4 my-4">
            <CustomSelect
                label="State Preference (Optional)"
                classNameLabel={form.preference ? "text-brand-primary" : "text-brand-muted"}
                classNameInput={form.notes ? "border-b-brand-primary border-t-0 border-x-0 " : "border-b-brand-gray border-t-0 border-x-0 "} 
                options={["Chase, nationwide", "Chase, nationwide", "Chase, nationwide","Chase, nationwide", "Chase, nationwide", ]}
                value={form.preference}
                // onChange={(val) => setForm({ ...form, how_you_heard: val })}
            />

            <CustomSelect
                label="Bank Preference"
                classNameLabel={form.bank ? "text-brand-primary rounded-xl" : "text-brand-muted rounded-xl"}
                classNameInput={form.notes ? "border-b-brand-primary border-t-0 border-x-0 " : "border-b-brand-gray border-t-0 border-x-0 "} 
                options={["Chase, nationwide", "Chase, nationwide", "Chase, nationwide","Chase, nationwide", "Chase, nationwide",]}
                value={form.bank}
                // onChange={(val) => setForm({ ...form, how_you_heard: val })}
            />
        </div>

        {/* Description */}
        <div className="flex flex-col sm:col-span-2">
            <label  className={`mb-1 font-medium transition text-brand-cartext
                ${form.notes?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}
            `}>
              Notes (Optional)            
            </label>
            <textarea
                name="notes"
                value={form.notes}
                // onChange={handleChange}
                rows={4}
                placeholder="Enter additional information or request here..."
                className= {`${form.notes?.trim() !== "" ? "border-b-brand-primary" : "border-b-brand-gray"} border  bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray resize-none`}
            />
        </div>
        

        <button type="submit" className="bg-brand-blue w-full text-brand-white px-6 py-2 mt-8 font-park rounded-xl">
          Submit Request
        </button>
      </form>
    </div>
  ) : null;
}

export default OrderModal