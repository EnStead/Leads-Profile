import SendIcon from "../../../../assets/send.svg";

const SuccessStep = ({ onViewOrderHistory }) => (
  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
    <div className="inline-flex h-30 w-30 items-center justify-center">
      <img src={SendIcon} alt="send" className="w-full" />
    </div>
    <h3 className="mt-6 text-2xl font-park font-bold text-brand-blackish">
      Order Request Submitted
    </h3>
    <p className="mt-4 max-w-[460px] text-lg leading-relaxed text-brand-body">
      We have successfully received your request and we will review it. Rest assured, we will prepare your pricing details shortly. You can expect a notification from us as soon as the pricing information is ready for you.
    </p>
    <button
      type="button"
      onClick={onViewOrderHistory}
      className="mt-8 w-full max-w-[260px] rounded-xl bg-brand-blackish px-6 py-2 font-semibold text-brand-white transition hover:opacity-90"
    >
      View Order History
    </button>
  </div>
);

export default SuccessStep;
