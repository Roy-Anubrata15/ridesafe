import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui'

export const ServicesTab: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Our Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Transportation services will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
} 