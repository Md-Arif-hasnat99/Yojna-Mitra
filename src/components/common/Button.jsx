export default function Button({ 
  children, 
  variant = 'primary', 
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'md',
  ...props 
}) {
  const baseClasses = 'font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  }
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    outline: 'border-2 border-primary-600 text-primary-700 bg-white hover:bg-primary-50 hover:border-primary-700',
    ghost: 'text-neutral-700 bg-transparent hover:bg-neutral-100',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
