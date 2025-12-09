import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Copy from '../../assets/Copy.svg'
import USDT from '../../assets/USDT.svg'
import BTC from '../../assets/Bitcoin.svg'
import ETH from '../../assets/ETH.svg'
import SOL from '../../assets/SOL.svg'
import Image from '../../assets/BG.png';
import QR from '../../assets/QR.png';


const paymentMethods = {
  "Tron (TRC20)": {
    amount: "250 USDT",
    symbol: "USDT (TRC20)",
    address: "TY7aW9mQhjdfhehkjldjoqpdjqmdqh6DfJ0eUc5Avt",
    logo: USDT,  // use your real image import
  },

  "Bitcoin (BTC)": {
    amount: "0.0037 BTC",
    symbol: "Bitcoin (BTC)",
    address: "bc1q8swjl3n92jksueh2h3hd29djjc92x4jv02aa3",
    logo: BTC,   // your BTC logo
  },

  "Ethereum (ETH)": {
    amount: "0.12 ETH",
    symbol: "Ethereum (ETH)",
    address: "0x38a91f9bd82727ff9d1ae0f4b7a82bfa234d99aa",
    logo: ETH,
  },

  "Solana (SOL)": {
    amount: "4.3 SOL",
    symbol: "Solana (SOL)",
    address: "Fg5keq8k92he92hslq02nmnxjkd8sdj2ns992jjd",
    logo: SOL,
  },
};


const OrderModal = ({  
    open, onOpenChange,handlePaymentSubmit 
}) => {
    const [range, setRange] = useState("Tron (TRC20)");
    const ranges = ["Tron (TRC20)", "Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)"];
    const details = paymentMethods[range];

    const [form, setForm] = useState({ transaction: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handlePaymentSubmit(); // <— triggers opening the second modal
        console.log(form)
    };

    const truncateMiddle = (text, start = 6, end = 6) => {
        if (!text) return "";
        if (text.length <= start + end) return text;
        return text.slice(0, start) + "..." + text.slice(text.length - end);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };



  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
            {/* BACKDROP */}
            <Dialog.Overlay className="fixed inset-0 bg-black/20 z-50 backdrop-blur-[2px]" />

            {/* MODAL */}
            <Dialog.Content
                className="fixed left-1/2 top-1/2 z-50 w-[500px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-xl focus:outline-none"
            >
                {/* CLOSE BUTTON */}
                <Dialog.Close className="absolute top-2 right-4 text-black text-4xl font-medium cursor-pointer">
                    ×
                </Dialog.Close>

                {/* HEADER */}
                {/* Radix Title and Description */}
                <Dialog.Title className="text-xl text-center font-bold mb-1 text-brand-primary font-park">
                    Make Payment
                </Dialog.Title>
                <Dialog.Description className="text-center text-brand-subtext mb-4">
                    Send the payment using the details below, then upload your transaction hash for verification.
                </Dialog.Description>

                {/* RANGE BUTTONS */}
                <div className="flex items-center gap-2 border-y py-2 border-brand-stroke font-medium">
                    {ranges.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 text-xs rounded-md font-medium ${
                                range === r
                                    ? "bg-brand-white text-brand-subtext shadow-md"
                                    : "text-brand-muted bg-transparent"
                        }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                {/* PAYMENT BOX */}
                <div
                    className="bg-brand-sky rounded-2xl flex justify-between p-4 my-3"
                    style={{
                        backgroundImage: `url(${details.bg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div>
                        {/* AMOUNT */}
                        <div>
                            <span className="font-light text-brand-subtext text-xs">Amount</span>
                            <p className="font-medium text-brand-primary text-sm flex gap-2 items-center">
                                {details.amount}
                                <img
                                    src={details.copyIcon}
                                    className="cursor-pointer"
                                    onClick={() => copyToClipboard(details.amount)}
                                />
                            </p>
                        </div>

                        {/* ADDRESS */}
                        <div className="my-3">
                            <span className="font-light text-brand-subtext text-xs">Wallet Address</span>
                            <p className="font-medium text-brand-primary text-sm flex gap-2 items-center">
                                {truncateMiddle(details.address)}
                                <img
                                    src={details.copyIcon}
                                    className="cursor-pointer"
                                    onClick={() => copyToClipboard(details.address)}
                                />
                            </p>
                        </div>

                        {/* CURRENCY */}
                        <div>
                            <span className="font-light text-brand-subtext text-xs">Currency</span>
                            <p className="font-medium text-brand-primary text-sm flex gap-2 items-center">
                                {details.symbol}
                                <img src={details.logo} className="w-5" />
                            </p>
                        </div>
                    </div>

                    {/* QR CODE */}
                    <div>
                        <img src={QR} className="w-28" />
                        <p className="text-xl text-brand-blue font-normal tracking-wide mt-2 font-logo">
                            Leads Profile
                        </p>
                    </div>
                </div>

                {/* HOW TO PAY */}
                <div className="mb-3">
                    <h3 className="font-park text-brand-primary font-semibold">How to Pay</h3>
                    <ul className="text-brand-subtext text-sm list-disc pl-7">
                        <li>
                            Send exactly <b>{details.amount}</b> to the wallet address above. Only send {details.symbol}.
                        </li>
                        <li>
                            Make sure you’re sending on <b>{details.symbol}</b>.
                        </li>
                        <li>
                            After sending, paste <b>your Transaction Url (TxID)</b> below.
                        </li>
                    </ul>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label
                            htmlFor="transaction"
                            className={`mb-1 font-medium text-base ${
                                form.transaction?.trim() !== ""
                                    ? "text-brand-primary"
                                    : "text-brand-muted"
                            }`}
                        >
                            Transaction URL
                        </label>

                        <input
                            id="transaction"
                            type="text"
                            name="transaction"
                            placeholder="Paste the link to transaction here..."
                            value={form.transaction}
                            onChange={handleChange}
                            required
                            className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
                    >
                        Submit Payment
                    </button>
                </form>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
  );
}

export default OrderModal