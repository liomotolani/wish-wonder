export default function PickerLoading() {
  return (
    <div className="theme-dark min-h-screen animate-pulse bg-pine-900 px-5 py-6 motion-reduce:animate-none sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-12 w-12 rounded-full bg-snow/10" />
        <div className="mt-8 h-14 w-64 rounded-xl bg-snow/10" />
        <div className="mt-4 h-5 w-80 max-w-full rounded bg-snow/10" />
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="aspect-square rounded-[22px] bg-snow/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
