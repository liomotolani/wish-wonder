export default function PendingLoading() {
  return (
    <div className="theme-dark min-h-screen animate-pulse bg-pine-900 px-5 py-8 motion-reduce:animate-none sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <div className="h-10 w-44 rounded-xl bg-snow/10" />
        <div className="mt-24 h-16 w-16 rounded-2xl bg-snow/10" />
        <div className="mt-6 h-10 w-80 rounded-xl bg-snow/10" />
        <div className="mt-4 h-24 rounded-2xl bg-snow/10" />
      </div>
    </div>
  );
}
