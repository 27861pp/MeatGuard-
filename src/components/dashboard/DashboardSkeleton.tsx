import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder shown while the first sensor reading arrives.
 * Built from the shadcn <Skeleton /> + <Card /> primitives so the layout
 * matches the real dashboard and there is zero content-shift on load.
 */
function SensorCardSkeleton() {
  return (
    <Card className="min-w-[260px] glass">
      <CardHeader className="flex-row items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-2.5 w-full rounded-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-3 w-3/4" />
      </CardFooter>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* verdict banner */}
      <Card className="glass">
        <CardHeader className="gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
      </Card>

      {/* sensor grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SensorCardSkeleton key={i} />
        ))}
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="glass">
            <CardHeader>
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded" />
            </CardContent>
            <CardFooter className="gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
