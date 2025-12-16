export default function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M7.2 7.8a4.8 4.8 0 0 1 9.6 0v.2c0 1.3-.6 2.5-1.5 3.3l-1.1 1v.9h1.6a2.2 2.2 0 0 1 2.2 2.2v.2a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 19.6v-.2a2.2 2.2 0 0 1 2.2-2.2h1.6v-.9l-1.1-1A4.6 4.6 0 0 1 7.2 8v-.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.6h.01M15 9.6h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
