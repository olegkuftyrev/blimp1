import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Blimp Smart Table
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Panda Express Food Calling System
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Table Section Tablets */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Table Sections</h2>
            <Link 
              href="/table/1" 
              className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
            >
              Table Section 1
            </Link>
            <Link 
              href="/table/2" 
              className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
            >
              Table Section 2
            </Link>
            <Link 
              href="/table/3" 
              className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
            >
              Table Section 3
            </Link>
          </div>

          {/* Kitchen Tablet */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Kitchen</h2>
            <Link 
              href="/kitchen" 
              className="block bg-green-500 hover:bg-green-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
            >
              Kitchen Tablet
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            System Status: <span className="text-green-600 font-medium">Online</span>
          </p>
        </div>
      </div>
    </div>
  );
}
