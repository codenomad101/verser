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
  const [activeCategory, setActiveCategory] = useState("all");

  const menuItems: MenuItem[] = [
    // Fast Food
    {
      id: 1,
      name: "Classic Burger",
      price: 199,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
      rating: 4.2,
      category: "fast-food",
      description: "Juicy beef patty with lettuce, tomato & cheese",
      prepTime: "15-20 min",
      isVeg: false
    },
    {
      id: 2,
      name: "Chicken Wrap",
      price: 149,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop",
      rating: 4.0,
      category: "fast-food",
      description: "Grilled chicken wrap with fresh vegetables",
      prepTime: "10-15 min",
      isVeg: false
    },
    // Indian
    {
      id: 3,
      name: "Chicken Biryani",
      price: 349,
      image: "https://images.unsplash.com/photo-1563379091339-03246374f5d9?w=200&h=200&fit=crop",
      rating: 4.7,
      category: "indian",
      description: "Aromatic basmati rice with tender chicken",
      prepTime: "35-40 min",
      isVeg: false
    },
    {
      id: 4,
      name: "Paneer Butter Masala",
      price: 279,
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop",
      rating: 4.4,
      category: "indian",
      description: "Rich creamy paneer curry with butter",
      prepTime: "20-25 min",
      isVeg: true
    },
    // Italian
    {
      id: 5,
      name: "Margherita Pizza",
      price: 299,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=200&fit=crop",
      rating: 4.5,
      category: "italian",
      description: "Fresh mozzarella, tomatoes, and basil",
      prepTime: "25-30 min",
      isVeg: true
    },
    {
      id: 6,
      name: "Pasta Arrabiata",
      price: 249,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=200&h=200&fit=crop",
      rating: 4.3,
      category: "italian",
      description: "Spicy tomato pasta with garlic and herbs",
      prepTime: "15-20 min",
      isVeg: true
    },
    // Chinese
    {
      id: 7,
      name: "Chicken Fried Rice",
      price: 199,
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop",
      rating: 4.1,
      category: "chinese",
      description: "Wok-tossed rice with chicken and vegetables",
      prepTime: "15-20 min",
      isVeg: false
    },
    {
      id: 8,
      name: "Veg Noodles",
      price: 169,
      image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=200&h=200&fit=crop",
      rating: 4.0,
      category: "chinese",
      description: "Stir-fried noodles with fresh vegetables",
      prepTime: "12-18 min",
      isVeg: true
    },
    // Beverages
    {
      id: 9,
      name: "Fresh Lime Soda",
      price: 79,
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop",
      rating: 4.2,
      category: "beverages",
      description: "Refreshing lime soda with mint",
      prepTime: "5 min",
      isVeg: true
    },
    {
      id: 10,
      name: "Mango Lassi",
      price: 99,
      image: "https://images.unsplash.com/photo-1553787434-6f35fb4fb300?w=200&h=200&fit=crop",
      rating: 4.6,
      category: "beverages",
      description: "Creamy mango yogurt drink",
      prepTime: "5 min",
      isVeg: true
    },
    // Desserts
    {
      id: 11,
      name: "Chocolate Brownie",
      price: 129,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop",
      rating: 4.8,
      category: "desserts",
      description: "Rich chocolate brownie with nuts",
      prepTime: "10 min",
      isVeg: true
    },
    {
      id: 12,
      name: "Gulab Jamun",
      price: 89,
      image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=200&h=200&fit=crop",
      rating: 4.5,
      category: "desserts",
      description: "Traditional Indian sweet in syrup",
      prepTime: "5 min",
      isVeg: true
    }
  ];

  const categories = [
    { id: "all", name: "All Items", count: menuItems.length },
    { id: "fast-food", name: "Fast Food", count: menuItems.filter(item => item.category === "fast-food").length },
    { id: "indian", name: "Indian", count: menuItems.filter(item => item.category === "indian").length },
    { id: "italian", name: "Italian", count: menuItems.filter(item => item.category === "italian").length },
    { id: "chinese", name: "Chinese", count: menuItems.filter(item => item.category === "chinese").length },
    { id: "beverages", name: "Beverages", count: menuItems.filter(item => item.category === "beverages").length },
    { id: "desserts", name: "Desserts", count: menuItems.filter(item => item.category === "desserts").length }
  ];

  const filteredItems = menuItems.filter(item => 
    activeCategory === "all" || item.category === activeCategory
  );

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
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
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId 
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="h-full overflow-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Food Delivery</h1>
          <p className="text-gray-600 text-sm sm:text-base">Order your favorite meals</p>
        </div>
        <div className="relative">
          <Button className="relative">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            className="text-xs sm:text-sm"
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-4">
          {/* Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredItems.map(item => {
              const quantity = getItemQuantity(item.id);
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {item.isVeg && (
                        <Badge className="bg-green-500 text-white text-xs">VEG</Badge>
                      )}
                      <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {item.rating}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{item.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">{item.prepTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Truck className="w-4 h-4" />
                          <span className="text-xs">Free delivery</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                        
                        {quantity > 0 ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold min-w-[24px] text-center">{quantity}</span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="text-xs sm:text-sm"
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No previous orders found</p>
                <p className="text-sm">Your order history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="border-t-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Cart Total: ₹{getTotalPrice()}</p>
                <p className="text-sm text-gray-600">{getTotalItems()} items</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Proceed to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}