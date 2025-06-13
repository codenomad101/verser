import { useState } from "react";
import { ShoppingCart, Star, Clock, Truck, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FoodSectionProps {
  currentUser: { id: number; username: string };
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  description: string;
  prepTime: string;
  isVeg: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function FoodSection({ currentUser }: FoodSectionProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("popular");

  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: "Margherita Pizza",
      price: 299,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=200&fit=crop",
      rating: 4.5,
      category: "popular",
      description: "Fresh mozzarella, tomatoes, and basil",
      prepTime: "25-30 min",
      isVeg: true
    },
    {
      id: 2,
      name: "Chicken Biryani",
      price: 349,
      image: "https://images.unsplash.com/photo-1563379091339-03246374f5d9?w=200&h=200&fit=crop",
      rating: 4.7,
      category: "popular",
      description: "Aromatic basmati rice with tender chicken",
      prepTime: "35-40 min",
      isVeg: false
    },
    {
      id: 3,
      name: "Veg Burger",
      price: 179,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
      rating: 4.2,
      category: "burgers",
      description: "Crispy veggie patty with fresh vegetables",
      prepTime: "15-20 min",
      isVeg: true
    },
    {
      id: 4,
      name: "Pad Thai",
      price: 279,
      image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=200&h=200&fit=crop",
      rating: 4.4,
      category: "asian",
      description: "Traditional Thai stir-fried noodles",
      prepTime: "20-25 min",
      isVeg: true
    },
    {
      id: 5,
      name: "Paneer Tikka",
      price: 249,
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&h=200&fit=crop",
      rating: 4.6,
      category: "indian",
      description: "Grilled cottage cheese with spices",
      prepTime: "20-25 min",
      isVeg: true
    },
    {
      id: 6,
      name: "Chocolate Brownie",
      price: 129,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop",
      rating: 4.8,
      category: "desserts",
      description: "Rich chocolate brownie with ice cream",
      prepTime: "10-15 min",
      isVeg: true
    }
  ];

  const categories = [
    { id: "popular", name: "Popular" },
    { id: "burgers", name: "Burgers" },
    { id: "indian", name: "Indian" },
    { id: "asian", name: "Asian" },
    { id: "desserts", name: "Desserts" }
  ];

  const filteredItems = menuItems.filter(item => 
    activeCategory === "popular" ? item.category === "popular" : item.category === activeCategory
  );

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId 
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="h-full overflow-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Delivery</h1>
          <p className="text-gray-600">Order your favorite meals</p>
        </div>
        <div className="relative">
          <Button className="relative">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {getCartItemCount() > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500">
                {getCartItemCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.name}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="menu" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-4">
          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const quantity = getItemQuantity(item.id);
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant={item.isVeg ? "default" : "destructive"}>
                        {item.isVeg ? "VEG" : "NON-VEG"}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.prepTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold">₹{item.price}</span>
                        
                        {quantity === 0 ? (
                          <Button size="sm" onClick={() => addToCart(item)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-medium">{quantity}</span>
                            <Button size="sm" onClick={() => addToCart(item)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <Card className="sticky bottom-4 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{getCartItemCount()} items in cart</p>
                    <p className="text-lg font-bold">Total: ₹{getCartTotal()}</p>
                  </div>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Truck className="w-5 h-5 mr-2" />
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #12345</p>
                    <p className="text-sm text-gray-500">2 items • ₹448</p>
                    <p className="text-sm text-gray-500">Delivered yesterday</p>
                  </div>
                  <Badge variant="secondary">Delivered</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #12344</p>
                    <p className="text-sm text-gray-500">1 item • ₹299</p>
                    <p className="text-sm text-gray-500">Delivered 2 days ago</p>
                  </div>
                  <Badge variant="secondary">Delivered</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}