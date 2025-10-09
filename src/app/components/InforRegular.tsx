import { Box, Typography } from '@mui/material'
import React from 'react'

interface InforRegularProps {
    icon: React.ElementType,
    title: string,
}

function InforRegular({ icon: Icon, title }: InforRegularProps) {
  return (
    <>
      <Icon sx={{ fontSize: { xs: 20, lg: 22 } }} />
      <Typography variant="h6" sx={{ fontSize: { xs: '0.7rem', md: '1rem', lg: '1rem' }, textAlign: 'center' }}>
        {title}
        </Typography>
      </>
  )
}
export default InforRegular
