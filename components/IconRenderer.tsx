import React from 'react';
import { Code, BookOpen, Briefcase, Home, Dumbbell, Music, Coffee, Star, LucideProps } from 'lucide-react';

interface IconRendererProps extends LucideProps {
  iconName: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconName, ...props }) => {
  switch (iconName) {
    case 'Code': return <Code {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'Home': return <Home {...props} />;
    case 'Dumbbell': return <Dumbbell {...props} />;
    case 'Music': return <Music {...props} />;
    case 'Coffee': return <Coffee {...props} />;
    case 'Star': return <Star {...props} />;
    default: return <Star {...props} />;
  }
};