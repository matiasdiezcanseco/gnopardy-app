import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function GameLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Score board skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Game board skeleton */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, colIndex) => (
          <div key={colIndex} className="space-y-2 sm:space-y-3">
            {/* Category header */}
            <Skeleton className="h-20 w-full" />
            {/* Question cells */}
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <Skeleton key={rowIndex} className="aspect-square w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

