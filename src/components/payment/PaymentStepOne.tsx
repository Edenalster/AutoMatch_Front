
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  paymentMethod: z.string({
    required_error: "Please select a payment method",
  }),
  cardNumber: z.string().optional(),
  cardholderName: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PaymentStepOneProps {
  form: UseFormReturn<FormData>;
}

const PaymentStepOne = ({ form }: PaymentStepOneProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Amount</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Enter amount"
                  className="pl-10 bg-white/5 border-white/20 text-white"
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription className="text-white/60">
              Enter the amount you want to add to your balance
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Payment Method</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-chess-dark border-white/20">
                <SelectItem value="credit-card" className="text-white hover:bg-white/10">Credit Card</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PaymentStepOne;
export { formSchema };
export type { FormData };