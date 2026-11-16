export default function ManagedWishlistLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="h-56 w-full rounded-b-[28px] bg-pine-900 lg:rounded-none" />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-6">
        <div className="h-14 rounded-2xl bg-pine-100" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
