export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${className}`}>
      {children}
    </div>
  );
}
