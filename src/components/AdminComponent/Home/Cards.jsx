import Process from '../../../assets/Process.svg'
import Pending from '../../../assets/Pending.svg'
import Completed from '../../../assets/Completed.svg'
import Leads from '../../../assets/Leads.svg'
import Head from '../../../assets/Head.svg'
import { Dot,MoveRight,UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

const Cards = () => {

  return (
    <section>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' >
        {/* CARD 1 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex items-center justify-start gap-4' >
            <div className='p-1' >
              <img src={Pending} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Pending Payment
            </h3>

          </div>

          <div className='w-full'>
            <div className='flex gap-4' >
              <h2 className='text-brand-primary font-bold text-4xl font-park '>
                248
              </h2>
            </div>
            <div className='flex items-center justify-between mt-4 '>
              <span className='text-brand-muted text-xs font-light'>Amount: <span className='text-brand-muted font-light'> ~ $750</span></span>
              <Link className='text-brand-blue font-medium flex items-center gap-3'  >View Orders <MoveRight size={18}/></Link>
            </div>
          </div>

        </div>

        {/* CARD 2 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex items-center gap-4 justify-start' >
            <div className='p-1' >
              <img src={Process} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Processing Orders
            </h3>
          </div>

          <div className='w-full'>
              <h2 className='text-brand-primary font-bold text-4xl font-park '>
                12,842
              </h2>
            <div className='flex items-center justify-between mt-4 w-full '>
              <span className='text-brand-muted text-xs font-light'>Amount: <span className='text-brand-muted font-light'> ~ $750</span></span>
              <Link className='text-brand-blue font-medium flex items-center gap-3'  >View Orders <MoveRight size={18}/></Link>
            </div>
          </div>
        </div>

        {/* CARD 3 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex text-left gap-4 justify-start' >
            <div className='' >
              <img src={Completed} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Completed Today
            </h3>
          </div>

          <div className=''>
            <h2 className='text-brand-primary font-bold text-4xl font-park '>
              3
            </h2>
            <div className='flex items-center gap-3 mt-4'>
              <img src={Head} alt="Image" />
              <span className='text-brand-green font-sm font-medium'>+30% <span className='text-brand-muted font-light'>vs yesterday</span></span>
            </div>
          </div>

        </div>

        {/* CARD 4 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex text-left gap-4 justify-start' >
            <div className='' >
              <img src={Leads} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Leads Delivered today
            </h3>

          </div>

          <div className=''>
            <h2 className='text-brand-primary font-bold text-4xl font-park '>
              3
            </h2>
            <div className='flex items-center gap-3 mt-4'>
              <img src={Head} alt="Image" />
              <span className='text-brand-green font-sm font-medium'>+30% <span className='text-brand-muted font-light'>vs yesterday</span></span>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}

export default Cards