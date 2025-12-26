import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";

export default function QuestionLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        {/* Back button skeleton */}
        <Skeleton className="h-10 w-24" />

        {/* Player info skeleton */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Question category and points skeleton */}
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-6 w-40" />
          <Skeleton className="mx-auto h-12 w-32" />
        </div>

        {/* Question content skeleton */}
        <div className="rounded-xl bg-gradient-to-b from-blue-700 to-blue-900 p-6 sm:p-8">
          <div className="space-y-4">
            <Skeleton className="mx-auto h-6 w-3/4 bg-blue-500/30" />
            <Skeleton className="mx-auto h-6 w-2/3 bg-blue-500/30" />
            <Skeleton className="mx-auto h-6 w-5/6 bg-blue-500/30" />
          </div>
        </div>

        {/* Answer input skeleton */}
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

