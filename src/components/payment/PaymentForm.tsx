import React, { useState } from "react";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import PaymentStepOne, { formSchema, FormData } from "./PaymentStepOne";
import PaymentStepTwo from "./PaymentStepTwo";
import { useNavigate } from "react-router-dom";

interface PaymentFormProps {
  onAmountChange: (amount: string) => void;
}

const PaymentForm = ({ onAmountChange }: PaymentFormProps) => {
    const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "",
    },
  });
  
  // Watch the amount field to update the summary
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.amount) {
        onAmountChange(value.amount as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onAmountChange]);
  
  const onSubmit = async (values: FormData) => {
    if (step === 1) {
      setStep(2);
      return;
    }
  
    const lichessId = localStorage.getItem("lichessId");
    if (!lichessId || !values.amount || isNaN(Number(values.amount))) {
      toast.error("Invalid payment details.");
      return;
    }
  
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/lichess/auth/users/${lichessId}/balance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: Number(values.amount) }),
        }
      );
  
      if (!res.ok) throw new Error("Request failed");
  
      const data = await res.json();
     console.log(data)
  
      toast.success("Payment successful!", {
        description: `$${values.amount} has been added to your balance.`,
        duration: 4000,
      });
  
      // Reset and go back
      form.reset();
      setStep(1);
      onAmountChange("");
      
      // ✅ Redirect to profile to see updated balance
      navigate("/profile");
  
    } catch (err) {
      console.error("❌ Payment failed:", err);
      toast.error("Failed to complete payment. Please try again.");
    }
  };
  
  return (
    <Card className="bg-chess-dark/60 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-chess-gold">Payment Details</CardTitle>
        <CardDescription className="text-white/60">
          {step === 1 ? "Select amount and payment method" : "Enter your card details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 ? (
              <PaymentStepOne form={form} />
            ) : (
              <PaymentStepTwo form={form} />
            )}
            
            <div className="flex justify-between pt-4">
              {step === 2 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              )}
              
              <Button 
                type="submit" 
                className="primary-btn ml-auto flex items-center gap-2"
              >
                {step === 1 ? 'Continue' : 'Complete Payment'}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;