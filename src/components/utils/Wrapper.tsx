interface WrapperProps {
  children: React.ReactNode;
  claseName?: string;
}

export const Wrapper = ({ children, claseName }: WrapperProps) => {
  return <div className={`px-2 md:px-0 py-1 ${claseName}`}>{children}</div>;
};
