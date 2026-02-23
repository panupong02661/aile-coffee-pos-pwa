
import React from 'react';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell = ({ children }: ShellProps) => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      {children}
    </div>
  );
};
