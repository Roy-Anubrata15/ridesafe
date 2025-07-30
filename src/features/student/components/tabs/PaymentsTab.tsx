import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui'

export const PaymentsTab: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Payment history and management will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
} 