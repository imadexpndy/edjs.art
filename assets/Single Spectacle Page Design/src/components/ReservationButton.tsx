import { Button } from './ui/button';
import { Ticket } from 'lucide-react';

interface ReservationButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  showtime?: {
    date: string;
    time: string;
  };
  disabled?: boolean;
  className?: string;
}

export default function ReservationButton({ 
  size = 'md', 
  variant = 'primary', 
  showtime, 
  disabled = false,
  className = ''
}: ReservationButtonProps) {
  const handleReservation = () => {
    if (showtime) {
      alert(`Reservation for ${showtime.date} at ${showtime.time} - Feature coming soon!`);
    } else {
      alert('Choose your showtime - Feature coming soon!');
    }
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary',
    secondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary'
  };

  return (
    <Button
      onClick={handleReservation}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        font-amatic font-bold rounded-full shadow-lg hover:shadow-xl 
        transform hover:scale-105 transition-all duration-200 
        border-2 ${className}
      `}
    >
      <Ticket className="w-5 h-5 mr-2" />
      Reserve Tickets
    </Button>
  );
}