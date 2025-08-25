import { 
    Card, 
    CardContent, 
    CardFooter, 
    CardHeader, 
    CardTitle 
  } from "../../components/ui/card";
  import { CreditCard } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import { useState } from "react";
  import { Button } from "../../components/ui/button";
  
  interface PaymentSummaryProps {
    amount: string;
  }
  
  const PaymentSummary = ({ amount }: PaymentSummaryProps) => {
    const navigate = useNavigate();
    const lichessId = localStorage.getItem("lichessId");
    const [loading, setLoading] = useState(false);
  
    const handleCompletePayment = async () => {
      if (!lichessId || !amount || isNaN(Number(amount))) {
        alert("Please enter a valid amount.");
        return;
      }
  
      setLoading(true);
      try {
        const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/lichess/auth/users/${lichessId}/balance`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ amount: Number(amount) }),
            }
          );
  
        const data = await res.json();
        console.log("Payment success, new balance:", data.balance);
        navigate("/profile");
      } catch (err) {
        console.error("Payment failed:", err);
        alert("Failed to complete payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Card className="bg-chess-dark/60 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-chess-gold">Transaction Summary</CardTitle>
        </CardHeader>
  
        <CardContent className="space-y-4">
          {amount ? (
            <>
              <div className="flex justify-between">
                <span className="text-white/60">Amount:</span>
                <span className="text-white">${amount || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Transaction Fee:</span>
                <span className="text-white">$0.00</span>
              </div>
              <div className="border-t border-white/10 my-2"></div>
              <div className="flex justify-between font-bold">
                <span className="text-white">Total:</span>
                <span className="text-chess-gold">${amount || "0.00"}</span>
              </div>
            </>
          ) : (
            <div className="text-white/60 text-center py-6">
              Enter an amount to see the transaction summary
            </div>
          )}
        </CardContent>
  
        <CardFooter className="border-t border-white/10 pt-4 flex-col items-start gap-4">
          <p className="text-white/60 text-sm">
            Your funds will be available immediately after the transaction is complete.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <CreditCard size={16} />
            <span>Secure payment processing</span>
          </div>
  
          {amount && (
            <Button
              onClick={handleCompletePayment}
              disabled={loading}
              className="w-full bg-chess-gold text-black hover:bg-yellow-400 font-bold mt-4"
            >
              {loading ? "Processing..." : "Complete Payment"}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  export default PaymentSummary;