interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function FlightCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-5 bg-gray-200 rounded" />
            <div className="w-20 h-5 bg-gray-200 rounded" />
          </div>
          <div className="w-32 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-16 h-10 bg-gray-200 rounded-lg" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="w-20 h-6 bg-gray-200 rounded" />
        <div className="flex-1 flex items-center gap-2">
          <div className="w-12 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FlightListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <FlightCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="relative">
        <div className="w-full h-12 bg-gray-200 rounded-lg" />
      </div>
      <div className="mt-3 w-full h-12 bg-gray-200 rounded-lg" />
    </div>
  );
}

export function AirportSelectorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
      <div className="w-full h-12 bg-gray-200 rounded-lg" />
    </div>
  );
}
