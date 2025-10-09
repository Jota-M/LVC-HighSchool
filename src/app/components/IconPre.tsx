import React from 'react'

interface IconProps{
        icon: React.JSX.Element;
        color: string;
        backgroundcolor: string;
    }
function IconPre({ icon, color, backgroundcolor }: IconProps) {
  return (
    <>
      {React.cloneElement(icon, {
        sx: {
          background: backgroundcolor,
          fontSize: 40,
          color: color,
          border: `1px solid ${color}`,
          borderRadius: '1rem',
          padding: 1,
          margin: 1,
        },
      })}
    </>
  );
}


export default IconPre
