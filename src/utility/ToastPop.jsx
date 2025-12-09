import { Toast } from 'radix-ui';
import { useState, useEffect } from 'react';

const ToastPop = ({ message, type = 'success', duration = 3000, onClose }) => {

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (message) {
      setOpen(true);
    }
  }, [message]);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen && onClose) onClose();
  };

  const colors = {
    success: 'text-brand-green border-brand-green',
    error: 'text-brand-red border-brand-red',
  };

  return (
    <>
        {/* Toast */}
        <Toast.Root   
            open={open}
            onOpenChange={handleOpenChange} 
            className={`bg-brand-white border px-4 py-3 rounded shadow w-fit max-w-xs ${colors[type]}`}
        >
            <Toast.Title className='font-park mb-2 font-medium'>{type === 'success' ? 'Success' : 'Error'}</Toast.Title>
            <Toast.Description>{message}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 p-4 z-50" />
    
    </>
  )
}

export default ToastPop;