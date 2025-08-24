import  { useState } from 'react';
import Navbar from '../components/Navbar';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentSummary from '../components/payment/PaymentSummary';

const AddFunds = () => {
  const [amount, setAmount] = useState("");
  
  return (
    <div className="min-h-screen bg-chess-dark">
      <Navbar showItems={false} />
      
      <div className="pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Add Funds</h1>
          <p className="text-white/60">Add funds to your account to participate in tournaments</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PaymentForm onAmountChange={setAmount} />
          </div>
          
          <div className="lg:col-span-1">
            <PaymentSummary amount={amount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFunds;