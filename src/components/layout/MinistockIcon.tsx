export default function MinistockIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chart line */}
      <path
        d="M4 24L10 16L16 20L22 10L28 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-navy-700"
      />
      {/* Up arrow */}
      <path
        d="M22 10V16H28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500"
      />
    </svg>
  );
}
