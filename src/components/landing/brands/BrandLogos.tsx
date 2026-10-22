import React from "react";

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function BoschLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 180 40"
      fill="currentColor"
      className={className}
      aria-label="Bosch Diesel Service"
      role="img"
      {...props}
    >
      <g transform="translate(4, 4)">
        <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="3" width="5" height="26" rx="1.5" fill="currentColor" />
        <rect x="3" y="13.5" width="26" height="5" rx="1.5" fill="currentColor" />
        <circle cx="16" cy="16" r="3.5" fill="currentColor" />
      </g>
      <g transform="translate(44, 2)">
        <path d="M0 2h10c3.5 0 6 1.8 6 4.8 0 2-1.2 3.5-3 4.2 2.4.7 3.8 2.5 3.8 4.8 0 3.4-2.8 5.2-6.8 5.2H0V2zm4.5 4v3.5h5.2c1.4 0 2.2-.8 2.2-1.8 0-1-.8-1.7-2.2-1.7H4.5zm0 6.8v4.5h5.5c1.6 0 2.5-.9 2.5-2.2 0-1.4-.9-2.3-2.5-2.3H4.5z" />
        <path d="M25 2c6.2 0 10.5 4.4 10.5 9.5s-4.3 9.5-10.5 9.5S14.5 16.6 14.5 11.5 18.8 2 25 2zm0 4.2c-3.4 0-5.8 2.4-5.8 5.3s2.4 5.3 5.8 5.3 5.8-2.4 5.8-5.3-2.4-5.3-5.8-5.3z" />
        <path d="M46.8 6.5c-1.3-.9-3-1.4-4.8-1.4-2.5 0-4.2 1.3-4.2 3.2 0 4.5 10.5 2.2 10.5 8.3 0 3-2.5 4.7-6.5 4.7-2.8 0-5.2-.9-7-2.4l2-3.2c1.4 1.2 3.2 1.8 5 1.8 2.4 0 4-1.1 4-2.7 0-4.5-10.5-2.2-10.5-8.2 0-3.2 2.6-4.9 6.7-4.9 2.4 0 4.6.7 6.2 1.8l-1.4 3z" />
        <path d="M60.5 2c5.8 0 9.8 4 9.8 9.5h-4.6c0-3-2.2-5.3-5.2-5.3-3.4 0-5.7 2.4-5.7 5.3s2.3 5.3 5.7 5.3c3 0 5.2-2.3 5.2-5.3h4.6c0 5.5-4 9.5-9.8 9.5-6.2 0-10.4-4.3-10.4-9.5S54.3 2 60.5 2z" />
        <path d="M72 2h4.6v6.8h7.8V2H89v19h-4.6v-7.8h-7.8V21H72V2z" />
      </g>
      <text
        x="44"
        y="34"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="8"
        fontWeight="700"
        letterSpacing="1.8"
        fill="currentColor"
      >
        DIESEL SERVICE
      </text>
    </svg>
  );
}

export function ZexelLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 150 40"
      fill="currentColor"
      className={className}
      aria-label="Zexel"
      role="img"
      {...props}
    >
      <g transform="skewX(-12) translate(12, 6)">
        <path d="M4 4h18l-10 16h11v5H3l10-16H4V4z" />
        <path d="M26 4h16v5H32v5h9v4.5h-9v5.5h11V29H26V4z" />
        <path d="M44 4h6l5.5 9 5.5-9h6l-8.5 12.5L67 29h-6l-6-9.5-6 9.5h-6l8.8-12.5L44 4z" />
        <path d="M69 4h16v5H75v5h9v4.5h-9v5.5h11V29H69V4z" />
        <path d="M88 4h6v20h11v5H88V4z" />
      </g>
    </svg>
  );
}

export function DensoLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 150 40"
      fill="currentColor"
      className={className}
      aria-label="Denso"
      role="img"
      {...props}
    >
      <g transform="translate(6, 8)">
        <path d="M4 1h12.5l7.5 7.5v15.5H4V1zm6 6v12h9V10l-4-3H10z" />
        <path d="M28 1h17v5.5H34v4h10v5H34v4.5h11V24H28V1z" />
        <path d="M49 1h5.8l9.2 14.5V1h6v23h-5.5L55 9.5V24h-6V1z" />
        <path d="M84 4c-1.8-2-4.5-3-7.5-3-5 0-8.5 3-8.5 7.2 0 5 4.5 6.5 9 7.8 4 1.2 5.5 2 5.5 4 0 2-2 3.2-4.5 3.2-3.2 0-5.5-1.5-6.8-3.5L76 23.5c1.8 2.2 4.5 3.5 8 3.5 6 0 9.8-3.2 9.8-7.8 0-5-4.2-6.5-9-7.8-3.8-1-5.5-2-5.5-3.8 0-1.8 1.8-3 4.2-3 2.5 0 4.8 1 6.2 2.5L84 4z" />
        <path d="M106 1c-6.8 0-12 5-12 11.5s5.2 11.5 12 11.5 12-5 12-11.5S112.8 1 106 1zm0 5.5c3.5 0 6 3 6 6s-2.5 6-6 6-6-3-6-6 2.5-6 6-6z" />
      </g>
    </svg>
  );
}

export function SiemensVDOLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 180 40"
      fill="currentColor"
      className={className}
      aria-label="Siemens VDO"
      role="img"
      {...props}
    >
      <g transform="translate(4, 10)">
        <g transform="scale(0.85)">
          <path d="M12 4.5c-1.5-1-3.2-1.5-5-1.5-3 0-4.8 1.4-4.8 3.5 0 4 10 2.2 10 7.8 0 3-2.5 4.7-6.2 4.7-2.6 0-5-.9-6.8-2.5l2-3c1.3 1.2 3 1.8 4.8 1.8 2.2 0 3.8-1 3.8-2.5 0-4-10-2.2-10-7.8 0-3.2 2.6-4.8 6.5-4.8 2.4 0 4.5.7 6 1.8l-1.3 2.5z" />
          <path d="M15 1h3.5v18H15V1z" />
          <path d="M22 1h11v3.5h-7.5v3.8h6.5v3.2h-6.5v4H33V19H22V1z" />
          <path d="M36 1h4.2l4.8 11.2L49.8 1H54v18h-3.4V7.5L46.2 17h-2.4L39.4 7.5V19H36V1z" />
          <path d="M57 1h11v3.5h-7.5v3.8h6.5v3.2h-6.5v4H68V19H57V1z" />
          <path d="M71 1h3.5l7 10.8V1H85v18h-3.5L74.5 8.2V19H71V1z" />
          <path d="M97 4.5c-1.5-1-3.2-1.5-5-1.5-3 0-4.8 1.4-4.8 3.5 0 4 10 2.2 10 7.8 0 3-2.5 4.7-6.2 4.7-2.6 0-5-.9-6.8-2.5l2-3c1.3 1.2 3 1.8 4.8 1.8 2.2 0 3.8-1 3.8-2.5 0-4-10-2.2-10-7.8 0-3.2 2.6-4.8 6.5-4.8 2.4 0 4.5.7 6 1.8l-1.3 2.5z" />
        </g>
        <rect x="92" y="0" width="2" height="20" opacity="0.3" fill="currentColor" />
        <g transform="translate(100, 0)">
          <path d="M2 0h6l5.5 15.5L19 0h6L16.5 20h-6L2 0z" />
          <path d="M27 0h9c5.5 0 9.5 4 9.5 10s-4 10-9.5 10h-9V0zm5.5 5v10h3.5c2.8 0 4.5-2 4.5-5s-1.7-5-4.5-5h-3.5z" />
          <path d="M58 0c6 0 10 4.2 10 10s-4 10-10 10-10-4.2-10-10 4-10 10-10zm0 5c-2.8 0-4.5 2-4.5 5s1.7 5 4.5 5 4.5-2 4.5-5-1.7-5-4.5-5z" />
        </g>
      </g>
    </svg>
  );
}

export function DelphiLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 150 40"
      fill="currentColor"
      className={className}
      aria-label="Delphi"
      role="img"
      {...props}
    >
      <g transform="translate(10, 6)">
        <ellipse cx="65" cy="2" rx="42" ry="2" opacity="0.4" fill="currentColor" />
        <g transform="translate(0, 4)">
          <path d="M4 1h11c7 0 12 4.5 12 11s-5 11-12 11H4V1zm6 5.5v11h5c3.8 0 6-2.2 6-5.5s-2.2-5.5-6-5.5H10z" />
          <path d="M31 1h16v5.5H37v3h8v5h-8v4h9V23H31V1z" />
          <path d="M51 1h6v16.5h10V23H51V1z" />
          <path d="M71 1h11c5 0 8.5 3 8.5 7.5S87 16 82 16h-5v7h-6V1zm6 5v5h5c1.8 0 2.8-.8 2.8-2.5s-1-2.5-2.8-2.5H77z" />
          <path d="M94 1h6v8h8V1h6v22h-6v-8.5h-8V23h-6V1z" />
          <path d="M118 1h6v22h-6V1z" />
        </g>
      </g>
    </svg>
  );
}

export function CaterpillarLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 130 40"
      fill="currentColor"
      className={className}
      aria-label="Caterpillar (CAT)"
      role="img"
      {...props}
    >
      <g transform="translate(6, 4)">
        <path d="M28 6c-2.5-2.2-6-3.5-10-3.5-8 0-14 5.5-14 13.5s6 13.5 14 13.5c4 0 7.5-1.3 10-3.5l-3.5-5.5c-1.8 1.5-4 2.5-6.5 2.5-4.5 0-7.8-3.2-7.8-7s3.3-7 7.8-7c2.5 0 4.7 1 6.5 2.5L28 6z" />
        <path d="M47 2.5L34 29.5h6.5l2.6-5.8h11.2l2.6 5.8h6.5L50.4 2.5H47zm-1.8 16.5l3.5-8 3.5 8h-7z" />
        <path d="M64 2.5v6.5h8v20.5h6.5V9h8V2.5H64z" />
        <polygon points="41.5,29.5 55.5,29.5 48.5,18" fill="currentColor" />
        <text
          x="3"
          y="34"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="4.2"
          fontWeight="900"
          letterSpacing="1.5"
          fill="currentColor"
        >
          CATERPILLAR
        </text>
      </g>
    </svg>
  );
}

export function CumminsLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 150 40"
      fill="currentColor"
      className={className}
      aria-label="Cummins"
      role="img"
      {...props}
    >
      <g transform="translate(6, 6)">
        <path d="M4 1h26v8.5H14.5v9H30V27H4V1z" />
        <polygon points="14.5,9.5 22,9.5 18,18.5 14.5,18.5" fill="currentColor" />
        <g transform="translate(36, 1)">
          <path d="M14 4c-1.5-1.5-3.5-2.2-6-2.2-4.5 0-8 3.5-8 8.5s3.5 8.5 8 8.5c2.5 0 4.5-.7 6-2.2l-2-2.8c-1 .8-2.3 1.3-4 1.3-2.6 0-4.5-1.8-4.5-4.8s1.9-4.8 4.5-4.8c1.7 0 3 .5 4 1.3L14 4z" />
          <path d="M18 6.5h3.6v7.5c0 1.8.8 2.8 2.4 2.8 1.6 0 2.4-1 2.4-2.8V6.5H30v12.2h-3.4v-1.8c-.8 1.3-2.2 2-3.8 2-3 0-4.8-1.8-4.8-5V6.5z" />
          <path d="M33 6.5h3.4v1.8c.8-1.3 2-2 3.6-2 1.8 0 3 .8 3.6 2.2.8-1.4 2.2-2.2 3.8-2.2 2.6 0 4.2 1.6 4.2 4.6v7.8h-3.5v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H41v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H33V6.5z" />
          <path d="M54 6.5h3.4v1.8c.8-1.3 2-2 3.6-2 1.8 0 3 .8 3.6 2.2.8-1.4 2.2-2.2 3.8-2.2 2.6 0 4.2 1.6 4.2 4.6v7.8h-3.5v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H62v-7c0-1.4-.6-2-1.8-2-1.2 0-2 .8-2 2.2v6.8H54V6.5z" />
          <circle cx="75" cy="3" r="1.8" />
          <rect x="73.2" y="6.5" width="3.6" height="12.2" />
          <path d="M80 6.5h3.4v1.8c.8-1.3 2.2-2 4-2 2.8 0 4.4 1.8 4.4 5v7.4h-3.6v-7c0-1.6-.7-2.3-2.2-2.3-1.4 0-2.4 1-2.4 2.6v6.7H80V6.5z" />
          <path d="M99 9c-1-.8-2-1.2-3.2-1.2-1.6 0-2.6.8-2.6 2 0 2.5 6 1.3 6 5 0 2.2-1.8 3.8-4.5 3.8-1.8 0-3.5-.7-4.6-2l1.8-2c.8.8 1.8 1.4 2.8 1.4 1.2 0 1.8-.6 1.8-1.4 0-2.4-6-1.2-6-4.8 0-2.2 1.8-3.6 4.4-3.6 1.5 0 3 .5 4 1.4L99 9z" />
        </g>
      </g>
    </svg>
  );
}

export function StanadyneLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 160 40"
      fill="currentColor"
      className={className}
      aria-label="Stanadyne"
      role="img"
      {...props}
    >
      <g transform="translate(6, 6)">
        <g transform="translate(2, 2)">
          <polygon points="12,0 24,12 12,24 0,12" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <polygon points="12,5 19,12 12,19 5,12" fill="currentColor" />
        </g>
        <g transform="translate(36, 4)">
          <path d="M9 3c-1-.7-2.3-1.2-3.8-1.2-2.2 0-3.6 1-3.6 2.5 0 3.2 7.8 1.6 7.8 6 0 2.2-1.8 3.5-4.6 3.5-2 0-3.8-.6-5-1.8l1.3-2.2c1 .9 2.2 1.4 3.6 1.4 1.6 0 2.6-.7 2.6-1.7 0-3.2-7.8-1.6-7.8-6 0-2.3 1.9-3.7 4.8-3.7 1.8 0 3.4.5 4.6 1.4L9 3z" />
          <path d="M12 1.5h8v2.6h-2.6v11H14.7v-11H12V1.5z" />
          <path d="M25 1.5L20 15.1h2.7l1.2-3.2h5.5l1.2 3.2h2.7l-5-13.6h-3.3zm-.2 8l2-5.4 2 5.4h-4z" />
          <path d="M35 1.5h2.6l5.5 8.5V1.5h2.6v13.6h-2.5l-5.6-8.6v8.6H35V1.5z" />
          <path d="M51 1.5L46 15.1h2.7l1.2-3.2h5.5l1.2 3.2h2.7l-5-13.6h-3.3zm-.2 8l2-5.4 2 5.4h-4z" />
          <path d="M61 1.5h5.8c4 0 6.8 2.6 6.8 6.8s-2.8 6.8-6.8 6.8H61V1.5zm2.7 2.6v8.4h3c2.4 0 4-1.5 4-4.2s-1.6-4.2-4-4.2h-3z" />
          <path d="M75 1.5h2.8l3.2 5.4 3.2-5.4H87l-4.7 7.5v6.1h-2.7V9L75 1.5z" />
          <path d="M89 1.5h2.6l5.5 8.5V1.5h2.6v13.6h-2.5l-5.6-8.6v8.6H89V1.5z" />
          <path d="M102 1.5h8.8v2.5h-6.1v2.8h5.2v2.4h-5.2v3.4h6.3v2.5h-9V1.5z" />
        </g>
      </g>
    </svg>
  );
}

export function DieselKikiLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 160 40"
      fill="currentColor"
      className={className}
      aria-label="Diesel Kiki"
      role="img"
      {...props}
    >
      <g transform="translate(6, 7)">
        <g transform="translate(0, 3)">
          <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M10 4v4l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="10" r="2" fill="currentColor" />
        </g>
        <g transform="translate(26, 0)">
          <text
            x="0"
            y="11"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="1.2"
            fill="currentColor"
          >
            DIESEL
          </text>
          <text
            x="0"
            y="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="3.5"
            fill="currentColor"
          >
            KIKI
          </text>
        </g>
      </g>
    </svg>
  );
}

export function PerkinsLogo({ className = "h-8 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 150 40"
      fill="currentColor"
      className={className}
      aria-label="Perkins"
      role="img"
      {...props}
    >
      <g transform="translate(6, 6)">
        <g transform="translate(2, 4)">
          <polygon points="0,18 9,0 18,18" fill="none" stroke="currentColor" strokeWidth="2" />
          <polygon points="9,0 18,18 27,0" fill="currentColor" opacity="0.8" />
          <polygon points="18,18 27,0 36,18" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
        <g transform="translate(44, 4)">
          <path d="M4 1h8c4.2 0 7 2.6 7 6.5s-2.8 6.5-7 6.5H8v6H4V1zm4 4v5h4c1.8 0 3-.8 3-2.5S13.8 5 12 5H8z" />
          <path d="M21 11.5c0-4.8 3.5-8 8-8s7.8 3.5 7.8 8.2v1.2H25c.3 2.5 2 3.8 4.5 3.8 1.8 0 3.2-.8 4-2l3 1.8c-1.5 2.2-3.8 3.4-7 3.4-5 0-8.5-3.6-8.5-8.4zm11.8-1.5c-.3-2.2-1.8-3.5-3.8-3.5s-3.5 1.3-3.8 3.5h7.6z" />
          <path d="M40 7h4v2.5c.8-1.8 2.5-2.8 4.5-2.8.8 0 1.5.2 2 .5v4.2c-.8-.4-1.8-.5-2.6-.5-2.4 0-3.9 1.6-3.9 4.2V20H40V7z" />
          <path d="M53 1h4v8.5l5.5-6h5.2l-6.5 6.8 7 9.7h-5.2l-4.8-6.8-1.2 1.3V20h-4V1z" />
          <circle cx="73" cy="2.5" r="2" />
          <rect x="71" y="7" width="4" height="13" />
          <path d="M78 7h4v2.2c1-1.5 2.6-2.5 4.8-2.5 3.5 0 5.2 2.2 5.2 6V20h-4v-6.8c0-2-.8-3-2.6-3s-3.4 1.2-3.4 3.2V20h-4V7z" />
          <path d="M96 17c1.2 1 2.6 1.5 4 1.5 1.6 0 2.5-.7 2.5-1.8 0-3-8-1.5-8-6.2 0-2.8 2.4-4.5 5.5-4.5 2 0 3.8.7 5.2 1.8l-2 2.5c-1-.8-2.2-1.3-3.2-1.3-1.4 0-2.2.6-2.2 1.5 0 2.8 8 1.4 8 6.2 0 3-2.5 4.8-6 4.8-2.2 0-4.4-.8-5.8-2.2l2-2.3z" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Nómina inmutable de las 10 marcas oficiales autorizadas por el taller (RF-03.2)
 */
export const WORKSHOP_BRANDS = [
  {
    id: "bosch",
    name: "Bosch",
    subtitle: "Diesel Service",
    Component: BoschLogo,
  },
  {
    id: "zexel",
    name: "Zexel",
    Component: ZexelLogo,
  },
  {
    id: "denso",
    name: "Denso",
    Component: DensoLogo,
  },
  {
    id: "siemens-vdo",
    name: "Siemens VDO",
    Component: SiemensVDOLogo,
  },
  {
    id: "delphi",
    name: "Delphi",
    Component: DelphiLogo,
  },
  {
    id: "caterpillar",
    name: "Caterpillar",
    subtitle: "CAT",
    Component: CaterpillarLogo,
  },
  {
    id: "cummins",
    name: "Cummins",
    Component: CumminsLogo,
  },
  {
    id: "stanadyne",
    name: "Stanadyne",
    Component: StanadyneLogo,
  },
  {
    id: "diesel-kiki",
    name: "Diesel Kiki",
    Component: DieselKikiLogo,
  },
  {
    id: "perkins",
    name: "Perkins",
    Component: PerkinsLogo,
  },
] as const;
