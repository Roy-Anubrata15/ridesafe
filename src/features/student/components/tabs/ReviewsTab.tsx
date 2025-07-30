import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui'

export const ReviewsTab: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Service reviews and ratings will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
} 