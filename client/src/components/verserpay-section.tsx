import { useState } from "react";
import { QrCode, Wallet, Send, Receipt, CreditCard, Smartphone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VerserPaySectionProps {
  currentUser: { id: number; username: string };
}

export default function VerserPaySection({ currentUser }: VerserPaySectionProps) {
  const [balance, setBalance] = useState("₹2,450.75");
  const [showBalance, setShowBalance] = useState(true);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");

  const recentTransactions = [
    { id: 1, type: "received", amount: "₹500", from: "Alex Johnson", time: "2 hours ago" },
    { id: 2, type: "sent", amount: "₹150", to: "Food Palace", time: "Yesterday" },
    { id: 3, type: "received", amount: "₹1000", from: "Sarah Wilson", time: "2 days ago" },
  ];

  const quickActions = [
    { icon: QrCode, label: "Scan QR", action: "scan" },
    { icon: Send, label: "Send Money", action: "send" },
    { icon: Wallet, label: "Add Money", action: "add" },
    { icon: Receipt, label: "Bill Pay", action: "bills" },
  ];

  const handleQuickAction = (action: string) => {
    console.log(`Performing action: ${action}`);
    // Dummy actions for now
  };

  return (
    <div className="h-full overflow-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">VerserPay</h1>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
          <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Link Card</span>
          <span className="sm:hidden">Link</span>
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm">Total Balance</p>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {showBalance ? balance : "₹****.**"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/20"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Smartphone className="w-12 h-12 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm">Hello, {currentUser.username}</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.action}
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => handleQuickAction(action.action)}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{action.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Main Features */}
      <Tabs defaultValue="transfer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Money</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient ID or Phone</Label>
                <Input
                  id="recipient"
                  placeholder="Enter username or phone number"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  placeholder="₹0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>
              <Button className="w-full">Send Money</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'received' ? 
                          <Send className="w-5 h-5 text-green-600 rotate-180" /> : 
                          <Send className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'received' ? 
                            `From ${transaction.from}` : 
                            `To ${transaction.to}`
                          }
                        </p>
                        <p className="text-sm text-gray-500">{transaction.time}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'received' ? '+' : '-'}{transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linked Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">**** **** **** 1234</p>
                      <p className="text-sm text-gray-500">HDFC Bank</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  + Add New Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}