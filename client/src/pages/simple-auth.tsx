import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UniversalHeader } from "@/components/universal-header";
import { UniversalFooter } from "@/components/universal-footer";
import { 
  Users, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function SimpleAuth() {
  const [, setLocation] = useLocation();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData = loginMethod === 'email' 
        ? { email: loginEmail, password: loginPassword }
        : { phone: loginPhone, password: loginPassword };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and redirect to home
      localStorage.setItem('auth_token', data.token);
      window.location.href = '/';
      
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: registerUsername, 
          email: registerEmail, 
          phone: registerPhone,
          password: registerPassword 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token and redirect to home
      localStorage.setItem('auth_token', data.token);
      window.location.href = '/';
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Universal Header */}
      <UniversalHeader 
        showBackButton={true}
        backButtonText="Back to Home"
        showNotifications={false}
        showProfileMenu={false}
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login" className="text-base py-3">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="text-base py-3">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    {/* Login Method Toggle */}
                    <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                      <Button
                        type="button"
                        variant={loginMethod === 'email' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setLoginMethod('email')}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={loginMethod === 'phone' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setLoginMethod('phone')}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Phone
                      </Button>
                    </div>

                    {/* Email/Phone Input */}
                    <div className="space-y-2">
                      <Label htmlFor="login-input" className="text-sm font-medium text-gray-700">
                        {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {loginMethod === 'email' ? (
                            <Mail className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Phone className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <Input
                          id="login-input"
                          type={loginMethod === 'email' ? 'email' : 'tel'}
                          placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                          value={loginMethod === 'email' ? loginEmail : loginPhone}
                          onChange={(e) => loginMethod === 'email' ? setLoginEmail(e.target.value) : setLoginPhone(e.target.value)}
                          className="pl-10 h-12 text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 text-base"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-6">
                  <form onSubmit={handleRegister} className="space-y-6">
                    {/* Username Input */}
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-sm font-medium text-gray-700">
                        Username
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="register-username"
                          type="text"
                          placeholder="Choose a username"
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          className="pl-10 h-12 text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="Enter your email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10 h-12 text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                      <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="pl-10 h-12 text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 text-base"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}