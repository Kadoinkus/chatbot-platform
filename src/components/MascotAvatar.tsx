import { getClientBrandColor } from '@/lib/brandColors';

interface MascotAvatarProps {
  image: string;
  name: string;
  clientId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: { container: 'w-4 h-4', image: 'w-3.5 h-3.5', padding: 'p-0.5' },
  sm: { container: 'w-6 h-6', image: 'w-5 h-5', padding: 'p-0.5' },
  md: { container: 'w-8 h-8', image: 'w-7 h-7', padding: 'p-0.5' },
  lg: { container: 'w-10 h-10', image: 'w-8 h-8', padding: 'p-1' },
  xl: { container: 'w-24 h-24', image: 'w-20 h-20', padding: 'p-2' },
};

export default function MascotAvatar({ image, name, clientId, size = 'md', className = '' }: MascotAvatarProps) {
  const brandColor = getClientBrandColor(clientId);
  const sizeClasses = sizeMap[size];

  return (
    <div 
      className={`${sizeClasses.container} rounded-full flex items-center justify-center ${sizeClasses.padding} ${className}`}
      style={{ backgroundColor: brandColor }}
    >
      <img 
        src={image} 
        alt={name}
        className={`${sizeClasses.image} object-contain`}
      />
    </div>
  );
}