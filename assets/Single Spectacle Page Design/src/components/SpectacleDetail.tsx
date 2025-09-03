import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, MapPin, Users, Star, Heart, Music, Shield, Accessibility, GraduationCap, Camera, Volume2, Sparkles, Info, Phone, Mail, Car } from 'lucide-react';
import ReservationButton from './ReservationButton';

interface SpectacleData {
  title: string;
  subtitle: string;
  description: string;
  synopsis: string;
  genre: string;
  ageRange: string;
  duration: string;
  language: string;
  venue: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    parking: string;
    accessibility: string;
  };
  showtimes: Array<{
    date: string;
    time: string;
    isAvailable: boolean;
    seatsLeft?: number;
  }>;
  rating: number;
  totalRatings: number;
  features: string[];
  heroImage: string;
  galleryImages: string[];
  educationalBenefits: string[];
  safetyGuidelines: string[];
  accessibilityFeatures: string[];
  musicAndSongs: string[];
}

const mockSpectacleData: SpectacleData = {
  title: "The Magical Rainbow Adventure",
  subtitle: "A Journey Through the Land of Colors",
  description: "Join Luna and her friends on an enchanting quest to bring colors back to the rainbow kingdom!",
  synopsis: "When the evil Gray Wizard steals all the colors from Rainbow Land, brave Luna must embark on a magical adventure to restore joy and vibrancy to her world. Along the way, she meets talking animals, dancing flowers, and learns valuable lessons about friendship, courage, and the power of believing in yourself. This interactive musical will have children singing, dancing, and cheering as they help Luna save the day!",
  genre: "Musical Fantasy",
  ageRange: "3-10 years",
  duration: "60 minutes",
  language: "English",
  venue: {
    name: "Little Stars Theatre",
    address: "123 Imagination Street",
    city: "Wonderland City",
    phone: "(555) 123-SHOW",
    email: "info@littlestarstheatre.com",
    parking: "Free parking available on-site with 150 spaces",
    accessibility: "Full wheelchair access, hearing loops, and sensory-friendly performances available"
  },
  showtimes: [
    { date: "2025-09-15", time: "10:30 AM", isAvailable: true, seatsLeft: 45 },
    { date: "2025-09-15", time: "2:00 PM", isAvailable: true, seatsLeft: 12 },
    { date: "2025-09-16", time: "10:30 AM", isAvailable: false, seatsLeft: 0 },
    { date: "2025-09-16", time: "2:00 PM", isAvailable: true, seatsLeft: 67 },
    { date: "2025-09-22", time: "10:30 AM", isAvailable: true, seatsLeft: 89 },
    { date: "2025-09-22", time: "2:00 PM", isAvailable: true, seatsLeft: 23 },
  ],
  rating: 4.8,
  totalRatings: 124,
  features: ["Interactive Experience", "Live Music", "Colorful Costumes", "Educational Content"],
  heroImage: "https://images.unsplash.com/photo-1695241189294-e405ed91553c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHRoZWF0cmUlMjBwdXBwZXQlMjBzaG93JTIwY29sb3JmdWx8ZW58MXx8fHwxNzU2NDI1OTUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  galleryImages: [
    "https://images.unsplash.com/photo-1701773055020-9d2b09b7ca5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdGhlYXRlciUyMHN0YWdlJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzU2NDI1OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1694083884221-d23d8b1a83b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGFjdG9ycyUyMGNvc3R1bWVzJTIwZmFpcnklMjB0YWxlfGVufDF8fHx8MTc1NjQyNTk1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ],
  educationalBenefits: [
    "Color recognition and theory",
    "Emotional intelligence and empathy",
    "Problem-solving skills",
    "Musical appreciation and rhythm",
    "Social cooperation and teamwork",
    "Creative imagination development"
  ],
  safetyGuidelines: [
    "Children must be accompanied by an adult",
    "No flash photography during performance",
    "Please arrive 15 minutes early for seating",
    "Emergency exits clearly marked",
    "First aid station available on-site",
    "Hand sanitizer stations throughout venue"
  ],
  accessibilityFeatures: [
    "Wheelchair accessible seating",
    "Hearing loop system available",
    "Large print programs available",
    "Sensory-friendly performances monthly",
    "Sign language interpretation upon request",
    "Quiet room available for breaks"
  ],
  musicAndSongs: [
    "Rainbow's Journey (Opening Song)",
    "Color Magic Dance",
    "Luna's Brave Heart",
    "Friendship Forever",
    "The Gray Wizard's Spell",
    "Bringing Back the Colors (Finale)"
  ]
};

export default function SpectacleDetail() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary rounded-b-[3rem] mb-8">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-secondary"></div>
          <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-white"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 rounded-full bg-secondary"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-white"></div>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-0 px-4 py-2 text-sm font-raleway">
                  {mockSpectacleData.genre}
                </Badge>
                <h1 className="font-amatic text-white text-6xl lg:text-7xl leading-tight">
                  {mockSpectacleData.title}
                </h1>
                <p className="font-amatic text-white/90 text-2xl">
                  {mockSpectacleData.subtitle}
                </p>
              </div>
              
              <p className="text-white/90 text-lg font-raleway leading-relaxed">
                {mockSpectacleData.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Users className="w-5 h-5 text-white" />
                  <span className="text-white font-raleway">{mockSpectacleData.ageRange}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white font-raleway">{mockSpectacleData.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Star className="w-5 h-5 text-white fill-current" />
                  <span className="text-white font-raleway">{mockSpectacleData.rating}/5 ({mockSpectacleData.totalRatings} reviews)</span>
                </div>
              </div>
              
              {/* First Reservation Button - Hero Section */}
              <div className="mt-6">
                <ReservationButton size="lg" variant="secondary" />
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <ImageWithFallback 
                  src={mockSpectacleData.heroImage}
                  alt={mockSpectacleData.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <button className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors">
                    <Heart className="w-6 h-6 text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-primary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Music className="w-8 h-8 text-primary" />
                  Story & Synopsis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed font-raleway text-lg">
                    {mockSpectacleData.synopsis}
                  </p>
                  <div className="border-t pt-4">
                    <h4 className="font-raleway font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      Show Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-primary/5 p-3 rounded-lg">
                        <span className="text-gray-600 font-raleway">Genre:</span>
                        <p className="font-semibold text-gray-800 font-raleway">{mockSpectacleData.genre}</p>
                      </div>
                      <div className="bg-secondary/5 p-3 rounded-lg">
                        <span className="text-gray-600 font-raleway">Language:</span>
                        <p className="font-semibold text-gray-800 font-raleway">{mockSpectacleData.language}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Features */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-primary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                  Special Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockSpectacleData.features.map((feature, index) => (
                    <div key={index} className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${index % 2 === 0 ? 'bg-primary/5 border-primary/20' : 'bg-secondary/5 border-secondary/20'}`}>
                      <div className={`w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}></div>
                      <span className="font-raleway font-medium text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Music & Songs */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-secondary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Volume2 className="w-8 h-8 text-secondary" />
                  Musical Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockSpectacleData.musicAndSongs.map((song, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-secondary/5 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-white font-raleway font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="font-raleway text-gray-700">{song}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Educational Benefits */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-primary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  Learning & Development
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 font-raleway mb-4">This show helps children develop:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockSpectacleData.educationalBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                      <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-raleway text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>





            {/* Gallery */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-primary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Camera className="w-8 h-8 text-primary" />
                  Behind the Scenes Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockSpectacleData.galleryImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <ImageWithFallback 
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/90 px-3 py-1 rounded-full">
                            <span className="text-gray-800 font-raleway text-sm">View Image</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-gray-600 font-raleway text-sm mt-2">
                        {index === 0 ? 'Live Performance' : 'Costume Design'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Show Information */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white sticky top-4">
              <CardHeader>
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-primary" />
                  Show Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-raleway">Duration:</span>
                    <span className="font-semibold text-gray-800 font-raleway">{mockSpectacleData.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-raleway">Age Range:</span>
                    <span className="font-semibold text-gray-800 font-raleway">{mockSpectacleData.ageRange}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-raleway">Language:</span>
                    <span className="font-semibold text-gray-800 font-raleway">{mockSpectacleData.language}</span>
                  </div>
                </div>
                
                {/* Second Reservation Button - Show Details */}
                <div className="pt-4 border-t border-gray-200">
                  <ReservationButton size="md" variant="primary" className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-primary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-primary" />
                  Venue Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <h4 className="font-semibold text-gray-800 font-raleway text-xl mb-2">{mockSpectacleData.venue.name}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 font-raleway">{mockSpectacleData.venue.address}</p>
                        <p className="text-gray-700 font-raleway">{mockSpectacleData.venue.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-gray-700 font-raleway">{mockSpectacleData.venue.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-gray-700 font-raleway">{mockSpectacleData.venue.email}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Car className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-gray-700 font-raleway">{mockSpectacleData.venue.parking}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-secondary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Accessibility className="w-8 h-8 text-secondary" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {mockSpectacleData.accessibilityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/5">
                      <Accessibility className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-gray-700 font-raleway text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Guidelines */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-primary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  Safety & Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {mockSpectacleData.safetyGuidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start gap-3 p-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 font-raleway text-sm">{guideline}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Showtimes */}
            <Card className="border-0 shadow-lg rounded-3xl bg-white">
              <CardHeader className="bg-secondary/5 rounded-t-3xl">
                <CardTitle className="font-amatic text-3xl text-gray-800 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-secondary" />
                  Available Showtimes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {mockSpectacleData.showtimes.map((showtime, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      showtime.isAvailable 
                        ? 'bg-white border-primary/30 hover:border-primary/50 hover:shadow-md' 
                        : 'bg-gray-100 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-raleway">
                        {formatDate(showtime.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-800 font-raleway text-lg">
                        {showtime.time}
                      </span>
                    </div>
                    
                    {showtime.isAvailable && showtime.seatsLeft && (
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-raleway">
                          {showtime.seatsLeft} seats remaining
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Badge 
                        className={`${
                          showtime.isAvailable 
                            ? (showtime.seatsLeft && showtime.seatsLeft < 20 ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground')
                            : 'bg-gray-400 text-white'
                        } border-0 font-raleway`}
                      >
                        {showtime.isAvailable 
                          ? (showtime.seatsLeft && showtime.seatsLeft < 20 ? 'Filling Fast' : 'Available')
                          : 'Sold Out'
                        }
                      </Badge>
                      
                      {/* Third+ Reservation Buttons - Per Showtime */}
                      {showtime.isAvailable && (
                        <ReservationButton 
                          size="sm" 
                          variant="secondary" 
                          showtime={{
                            date: formatDate(showtime.date),
                            time: showtime.time
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Sticky Reservation Button - Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-full p-3 shadow-2xl border-4 border-primary">
          <ReservationButton size="lg" variant="primary" className="animate-pulse shadow-lg" />
        </div>
      </div>
    </div>
  );
}