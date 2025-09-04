import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Blimp Smart Table
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Please select your on what screen you would like to use blimp system
        </p>
        
        <div className="max-w-md mx-auto space-y-4">
          <Link 
            href="/table/1" 
            className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
          >
            ST Section 1
          </Link>
          <Link 
            href="/table/2" 
            className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
          >
            ST Section 2
          </Link>
          <Link 
            href="/table/3" 
            className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
          >
            ST Section 3
          </Link>
          <Link 
            href="/kitchen" 
            className="block bg-green-500 hover:bg-green-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
          >
            BoH Screen
          </Link>
          <Link 
            href="/boh" 
            className="block bg-purple-500 hover:bg-purple-600 text-white text-center py-4 px-6 rounded-lg text-xl font-medium transition-colors"
          >
            BOH Page
          </Link>
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
