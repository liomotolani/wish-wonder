export default function SecretGiftsLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="h-40 w-full rounded-b-[28px] bg-pine-900 lg:rounded-none" />
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-8 lg:px-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-44 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}
