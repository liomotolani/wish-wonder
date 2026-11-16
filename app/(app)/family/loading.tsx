export default function FamilyLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="mx-auto mt-0 h-64 w-full max-w-6xl rounded-b-[28px] bg-pine-900 lg:mt-8 lg:rounded-[28px]" />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-6">
        <div className="h-7 w-56 rounded-lg bg-pine-100" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
