export function PageSkeleton() {
  return (
    <main className="w-full flex flex-col items-center pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-3/4 max-w-2xl h-12 md:h-16 bg-white/5 rounded-2xl mb-6 animate-pulse" />
          <div className="w-2/3 max-w-xl h-6 md:h-8 bg-white/5 rounded-xl animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 md:h-64 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        
        {/* Large Block Skeleton */}
        <div className="w-full h-64 md:h-96 bg-white/5 rounded-3xl animate-pulse" />
      </div>
    </main>
  );
}
