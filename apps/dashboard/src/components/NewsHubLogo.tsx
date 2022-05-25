import { MantineColor } from '@mantine/core';

interface MantineLogoProps extends React.ComponentPropsWithoutRef<'svg'> {
	variant?: MantineColor;
	width?: number;
	height?: number;
}

export function NewsHubLogo({ variant = 'default', width = 500, height = 110, ...others }: MantineLogoProps) {
	return (
		<svg
			{...others}
			version="1.0"
			xmlns="http://www.w3.org/2000/svg"
			height={height}
			viewBox="0 0 500 128"
			preserveAspectRatio="xMidYMid meet"
			width={width}
		>
			<g>
				<g transform="translate(0.000000,128.000000) scale(0.100000,-0.100000)" fill={variant} stroke="none">
					<path
						d="M503 1198 c-268 -7 -315 -14 -361 -53 -49 -41 -52 -67 -52 -524 0
-397 1 -424 19 -460 14 -26 33 -43 62 -57 39 -17 65 -19 264 -17 121 0 324 5
452 10 l232 8 30 29 c50 48 54 90 48 497 -6 454 -13 491 -107 539 -19 10 -50
21 -68 25 -47 10 -231 11 -519 3z m557 -45 c99 -45 101 -57 107 -532 4 -336 3
-389 -11 -426 -9 -23 -27 -47 -39 -54 -26 -14 -266 -23 -662 -25 -264 -1 -294
4 -320 55 -13 23 -15 102 -15 461 0 417 1 434 20 466 34 56 71 65 300 73 113
3 288 6 390 5 162 -2 190 -5 230 -23z"
					/>
					<path
						d="M320 985 c-21 -26 -19 -170 4 -215 28 -54 452 -468 489 -476 40 -8
153 5 165 19 5 7 12 46 16 87 5 63 3 79 -12 100 -32 44 -456 467 -480 480 -13
6 -56 14 -96 17 -60 5 -74 3 -86 -12z"
					/>
					<path
						d="M745 991 c-24 -5 -30 -11 -30 -31 0 -20 13 -31 70 -63 91 -50 100
-58 142 -144 38 -76 62 -92 82 -54 14 26 32 188 24 220 -10 43 -32 59 -87 65
-98 10 -171 12 -201 7z"
					/>
					<path
						d="M291 586 c-8 -9 -15 -61 -18 -128 -6 -111 -5 -114 20 -143 24 -29 27
-30 136 -33 92 -4 116 -1 137 13 44 29 29 55 -59 101 -97 50 -111 65 -140 139
-24 63 -51 81 -76 51z"
					/>
				</g>
				<text
					stroke-width="0"
					font-weight="bold"
					transform="matrix(3.33052 0 0 2.81361 -290.931 20.3572)"
					stroke={variant}
					text-anchor="start"
					font-family="'Catamaran'"
					font-size="24"
					id="svg_9"
					y="22.77875"
					x="132.08264"
					fill={variant}
				>
					NewsHub
				</text>
			</g>
		</svg>
	);
}
