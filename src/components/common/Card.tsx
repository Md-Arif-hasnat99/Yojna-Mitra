export default function Card({ 
  children, 
  hover = false,
  variant = 'default',
  className = '',
  noPadding = false,
  ...props 
}) {
  const variants = {
    default: 'bg-white rounded-2xl shadow-soft border border-neutral-200 transition-all duration-200',
    hover: 'bg-white rounded-2xl shadow-soft border border-neutral-200 transition-all duration-300 hover:shadow-medium hover:-translate-y-1 cursor-pointer',
    elevated: 'bg-white rounded-2xl shadow-medium border border-neutral-100 transition-all duration-300 hover:shadow-large',
    gradient: 'bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-soft border border-neutral-200 transition-all duration-300 hover:shadow-medium',
    glass: 'glass rounded-2xl border border-white/20 shadow-soft',
  };
  
  // Support legacy hover prop
  const selectedVariant = hover ? 'hover' : variant;
  const baseClass = variants[selectedVariant] || variants.default;
  const padding = noPadding ? '' : 'p-6';
  
  return (
    <div className={`${baseClass} ${padding} ${className}`} {...props}>
      {children}
    </div>
  )
}
