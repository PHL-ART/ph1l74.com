export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="mt-4 text-xl text-gray-400">Page Not Found</p>
        <a href="/" className="mt-6 inline-block text-blue-500 hover:text-blue-400">
          Go Home
        </a>
      </div>
    </div>
  );
}

