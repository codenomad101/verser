import { useEffect, useState } from "react";
import { Train, Bus, Hotel, Calendar, MapPin, Users, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TravelSectionProps {
  currentUser: { id: number; username: string };
}

interface TravelOption {
  id: number;
  type: 'bus' | 'train' | 'hotel';
  name: string;
  from?: string;
  to?: string;
  location?: string;
  price: number;
  duration?: string;
  departure?: string;
  arrival?: string;
  rating: number;
  amenities: string[];
  image: string;
  available: boolean;
}

export default function TravelSection({ currentUser }: TravelSectionProps) {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('travelTab') || "buses");
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const travelOptions: TravelOption[] = [
    // Buses
    {
      id: 1,
      type: 'bus',
      name: "Volvo Multi-Axle Semi-Sleeper",
      from: "Mumbai",
      to: "Pune",
      price: 450,
      duration: "3h 30m",
      departure: "08:00 AM",
      arrival: "11:30 AM",
      rating: 4.2,
      amenities: ["AC", "WiFi", "Charging Point", "Water Bottle"],
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=200&fit=crop",
      available: true
    },
    {
      id: 2,
      type: 'bus',
      name: "Sleeper Bus Deluxe",
      from: "Delhi",
      to: "Manali",
      price: 1200,
      duration: "12h 45m",
      departure: "09:00 PM",
      arrival: "09:45 AM",
      rating: 4.5,
      amenities: ["AC", "Sleeper", "Blanket", "Entertainment"],
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=200&fit=crop",
      available: true
    },
    // Trains
    {
      id: 3,
      type: 'train',
      name: "Rajdhani Express",
      from: "New Delhi",
      to: "Mumbai Central",
      price: 2340,
      duration: "15h 50m",
      departure: "04:00 PM",
      arrival: "07:50 AM",
      rating: 4.6,
      amenities: ["AC 3-Tier", "Meals Included", "Bedding", "Pantry Car"],
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=200&h=200&fit=crop",
      available: true
    },
    {
      id: 4,
      type: 'train',
      name: "Shatabdi Express",
      from: "Chennai",
      to: "Bangalore",
      price: 850,
      duration: "4h 45m",
      departure: "06:00 AM",
      arrival: "10:45 AM",
      rating: 4.4,
      amenities: ["AC Chair Car", "Breakfast", "Evening Snacks"],
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=200&h=200&fit=crop",
      available: true
    },
    // Hotels
    {
      id: 5,
      type: 'hotel',
      name: "Grand Palace Hotel",
      location: "Mumbai",
      price: 3500,
      rating: 4.8,
      amenities: ["Free WiFi", "Swimming Pool", "Gym", "Restaurant", "Room Service"],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop",
      available: true
    },
    {
      id: 6,
      type: 'hotel',
      name: "Hill View Resort",
      location: "Shimla",
      price: 2800,
      rating: 4.6,
      amenities: ["Mountain View", "Spa", "Restaurant", "Free Parking"],
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200&h=200&fit=crop",
      available: true
    },
    {
      id: 7,
      type: 'hotel',
      name: "Business Inn",
      location: "Bangalore",
      price: 1800,
      rating: 4.3,
      amenities: ["Free WiFi", "Business Center", "Airport Shuttle"],
      image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=200&h=200&fit=crop",
      available: true
    }
  ];

  const getFilteredOptions = (type: 'bus' | 'train' | 'hotel') => {
    return travelOptions.filter(option => option.type === type);
  };

  const renderTransportCard = (option: TravelOption) => (
    <Card key={option.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        <img 
          src={option.image} 
          alt={option.name}
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
        />
        <div className="flex-1 p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-sm sm:text-base">{option.name}</h3>
              <p className="text-xs text-gray-600">{option.from} → {option.to}</p>
            </div>
            <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
              <Star className="w-3 h-3" />
              {option.rating}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {option.duration}
              </span>
              <span>{option.departure} - {option.arrival}</span>
            </div>
            <span className="text-lg font-bold text-green-600">₹{option.price}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {option.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
          
          <Button size="sm" className="w-full text-xs">
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderHotelCard = (option: TravelOption) => (
    <Card key={option.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={option.image} 
        alt={option.name}
        className="w-full h-32 sm:h-40 object-cover"
      />
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-sm sm:text-base">{option.name}</h3>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {option.location}
            </p>
          </div>
          <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
            <Star className="w-3 h-3" />
            {option.rating}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {option.amenities.slice(0, 4).map((amenity, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-green-600">₹{option.price}/night</span>
          <Button size="sm" className="text-xs">
            Book Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const [bookings, setBookings] = useState<any[]>([]);

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/travel-bookings/mine', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) setBookings(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const bookTravel = async (payload: any) => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch('/api/travel-bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchMyBookings();
    }
  };

  const handleBookTransport = (option: TravelOption) => {
    const travelDateISO = searchDate ? new Date(searchDate).toISOString() : null;
    bookTravel({
      type: option.type,
      from: option.from,
      to: option.to,
      travelDate: travelDateISO,
      details: { name: option.name, amenities: option.amenities },
      price: option.price,
    });
  };

  const handleBookHotel = (option: TravelOption) => {
    const travelDateISO = searchDate ? new Date(searchDate).toISOString() : null;
    bookTravel({
      type: 'hotel',
      location: option.location,
      travelDate: travelDateISO,
      details: { name: option.name, amenities: option.amenities },
      price: option.price,
    });
  };

  return (
    <div className="h-full overflow-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold">Travel Booking</h1>
        <p className="text-gray-600 text-sm sm:text-base">Book buses, trains, and hotels</p>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          if (localStorage.getItem('travelTab')) localStorage.removeItem('travelTab');
        }} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="buses" className="flex items-center gap-1 text-xs sm:text-sm">
            <Bus className="w-4 h-4" />
            Buses
          </TabsTrigger>
          <TabsTrigger value="trains" className="flex items-center gap-1 text-xs sm:text-sm">
            <Train className="w-4 h-4" />
            Trains
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-1 text-xs sm:text-sm">
            <Hotel className="w-4 h-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="mybookings" className="flex items-center gap-1 text-xs sm:text-sm">
            My Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buses" className="space-y-4">
          {/* Bus Search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="from" className="text-xs">From</Label>
                  <Input
                    id="from"
                    placeholder="Departure city"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="to" className="text-xs">To</Label>
                  <Input
                    id="to"
                    placeholder="Destination city"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-xs">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full text-sm">Search Buses</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bus Results */}
          <div className="space-y-3">
            {getFilteredOptions('bus').map((option) => (
              <div key={option.id} onClick={() => handleBookTransport(option)}>
                {renderTransportCard(option)}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trains" className="space-y-4">
          {/* Train Search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="train-from" className="text-xs">From Station</Label>
                  <Input
                    id="train-from"
                    placeholder="Departure station"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="train-to" className="text-xs">To Station</Label>
                  <Input
                    id="train-to"
                    placeholder="Destination station"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="train-date" className="text-xs">Date</Label>
                  <Input
                    id="train-date"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full text-sm">Search Trains</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Train Results */}
          <div className="space-y-3">
            {getFilteredOptions('train').map((option) => (
              <div key={option.id} onClick={() => handleBookTransport(option)}>
                {renderTransportCard(option)}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          {/* Hotel Search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="location" className="text-xs">Location</Label>
                  <Input
                    id="location"
                    placeholder="City or area"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="checkin" className="text-xs">Check-in</Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="checkout" className="text-xs">Check-out</Label>
                  <Input
                    id="checkout"
                    type="date"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full text-sm">Search Hotels</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {getFilteredOptions('hotel').map((option) => (
              <div key={option.id} onClick={() => handleBookHotel(option)}>
                {renderHotelCard(option)}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="mybookings" className="space-y-4">
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-sm text-gray-600">No bookings yet.</div>
            ) : (
              bookings.map((b) => (
                <Card key={b.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">{b.type.toUpperCase()} Booking #{b.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        {b.type === 'hotel' ? (
                          <div>Location: {b.location}</div>
                        ) : (
                          <div>Route: {b.from} → {b.to}</div>
                        )}
                        <div className="text-gray-500">Status: {b.status}</div>
                      </div>
                      <div className="font-semibold">₹{b.price}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
