export default function RevealLoading() {
  return (
    <div className="theme-dark min-h-screen animate-pulse bg-pine-900 px-5 py-6 motion-reduce:animate-none sm:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="h-12 w-12 rounded-full bg-snow/10" />
        <div className="mx-auto mt-10 h-36 w-36 rounded-[28px] bg-snow/10" />
        <div className="mx-auto mt-6 h-10 w-72 max-w-full rounded-lg bg-snow/10" />
        <div className="mt-8 h-96 w-full rounded-[28px] bg-snow/10" />
      </div>
    </div>
  );
}
