interface SyUIPlainProps {
  className?: string;
  size?: number;
  height?: number;
  width?: number;
}

export function SyUIPlainLogo({className, height, size = 26, width}: SyUIPlainProps) {
  const svgHeight = height || size;
  const svgWidth = width || svgHeight;

  return (
    <>
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        height={svgHeight}
        viewBox="0 0 40 40"
        width={svgWidth}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect fill="currentColor" height="40" opacity="0.12" rx="10" width="40" />
        <path
          d="M27.5 11.5A10.3 10.3 0 0 0 20.7 9C16 9 13 11.3 13 14.6c0 7.8 14 3.1 14 10.5 0 3.5-3 5.9-7.7 5.9-3.1 0-5.9-1.1-7.8-3.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="m25.5 10 5 7 5-7m-5 7v14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
      <span className="sr-only">SY UI</span>
    </>
  );
}
