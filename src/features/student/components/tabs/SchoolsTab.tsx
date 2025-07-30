import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui'

export const SchoolsTab: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Partner Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">List of partner schools will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
} 