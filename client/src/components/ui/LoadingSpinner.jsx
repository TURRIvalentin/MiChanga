export default function LoadingSpinner({ size = 'md', center = false }) {
  const sizeClass = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' }[size];

  const spinner = (
    <div className={`animate-spin rounded-full border-primary-600 border-t-transparent ${sizeClass}`} />
  );

  if (center) {
    return (
      <div className="flex items-center justify-center py-16">
        {spinner}
      </div>
    );
  }
  return spinner;
}
