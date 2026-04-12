import { PageSkeleton } from './Skeleton';

interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <>
      <PageSkeleton />
      <p className="text-center text-skin-secondary font-light text-body mt-4">
        {message}
      </p>
    </>
  );
}
