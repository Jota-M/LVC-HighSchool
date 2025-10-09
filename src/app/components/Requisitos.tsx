import React from 'react'
import CheckIcon from '@mui/icons-material/Check';
import {useTheme} from '@mui/material';

interface RequisitosProps {
    text: string;
    icon: React.JSX.Element;
    color?: string;
}

function Requisitos({ text, icon, color }: RequisitosProps) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
  return (
    <li style={{ color: isDark ? 'grey.900' : 'text.secondary', textDecoration: 'none', listStyle: "none", marginLeft:20}}>
  {icon
    ? React.cloneElement(icon, {})
    : <CheckIcon />
  }
  {text}
</li>

  )
}

export default Requisitos
