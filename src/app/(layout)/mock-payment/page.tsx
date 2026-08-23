"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmMockPayment } from "@/actions/orders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayment = async (status: "paid" | "cancelled") => {
    if (!orderId) return;
    setIsProcessing(true);
    
    // Simulate real gateway processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const res = await confirmMockPayment(orderId, status);
    
    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    } else {
      toast.error(res.error || "Помилка оплати");
      setIsProcessing(false);
    }
  };

  if (!orderId) {
    return <div className="p-8 text-center">Order ID is missing</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-8 pb-6 bg-zinc-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-white text-black flex items-center justify-center font-bold font-serif">M</div>
            <span className="font-bold text-xl tracking-tight">monopay</span>
          </div>
          <span className="text-zinc-400 text-sm">Тестовий режим</span>
        </div>
        
        <div className="p-8 flex flex-col items-center text-center">
          <div className="size-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <CreditCard className="size-8 text-blue-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Оплата замовлення</h2>
          <p className="text-neutral-500 text-sm mb-6">ID: {orderId}</p>
          
          <div className="w-full bg-neutral-50 rounded-2xl p-6 border mb-8 flex flex-col gap-2">
            <span className="text-neutral-500 text-sm">Сума до сплати</span>
            <span className="text-3xl font-black">--- ₴</span>
            <span className="text-xs text-neutral-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="size-3" /> Безпечний платіж
            </span>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg rounded-xl bg-black hover:bg-neutral-800 text-white"
              onClick={() => handlePayment("paid")}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin size-5" /> : "Імітувати Успішну Оплату"}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full h-14 text-lg rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
              onClick={() => handlePayment("cancelled")}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin size-5" /> : "Імітувати Відмову"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
