
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "../../components/ui/input";
import { CreditCard } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "./PaymentStepOne";

interface PaymentStepTwoProps {
  form: UseFormReturn<FormData>;
}

const PaymentStepTwo = ({ form }: PaymentStepTwoProps) => {
  return (
    <>
      <div className="bg-white/5 p-4 rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-white/60">Amount:</span>
          <span className="text-white font-medium">${form.getValues("amount")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Payment method:</span>
          <span className="text-white font-medium">Credit Card</span>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Card Number</FormLabel>
            <FormControl>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="1234 5678 9012 3456"
                  className="pl-10 bg-white/5 border-white/20 text-white"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="cardholderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Cardholder Name</FormLabel>
            <FormControl>
              <Input
                placeholder="John Doe"
                className="bg-white/5 border-white/20 text-white"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Expiry Date</FormLabel>
              <FormControl>
                <Input
                  placeholder="MM/YY"
                  className="bg-white/5 border-white/20 text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cvv"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">CVV</FormLabel>
              <FormControl>
                <Input
                  placeholder="123"
                  className="bg-white/5 border-white/20 text-white"
                  type="password"
                  maxLength={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default PaymentStepTwo;