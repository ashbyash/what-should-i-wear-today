import { PageSkeleton } from './Skeleton';

interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <>
      <PageSkeleton />
      <p className="text-center text-white/80 font-light text-sm mt-4">
        {message}
      </p>
    </>
  );
}
