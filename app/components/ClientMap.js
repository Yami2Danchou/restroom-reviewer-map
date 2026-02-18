'use client'

import dynamic from 'next/dynamic'

// Dynamically import the Map component with no SSR
const Map = dynamic(
  () => import('./Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }
)

export default function ClientMap(props) {
  return <Map {...props} />
}