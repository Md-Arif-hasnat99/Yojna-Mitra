export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  className = '',
  icon,
  ...props
}) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-neutral-700 mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-12' : 'px-4'} py-3.5 bg-white border-2 rounded-xl
            text-neutral-900 placeholder-neutral-400
            transition-all duration-200
            ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                : 'border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
            }
            focus:outline-none
            disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-rose-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
