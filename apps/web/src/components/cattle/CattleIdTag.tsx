'use client'

import { QRCodeSVG } from 'qrcode.react'

interface CattleIdTagProps {
  code: string
  name: string
  breed: string
}

export function CattleIdTag({ code, name, breed }: CattleIdTagProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = `${baseUrl}/sapi/${code}`

  return (
    <div className="flex justify-center py-2">
      {/* Rope the tag hangs from - drawn first so the tag animates "down" past it */}
      <div className="relative">
        <div
          key={code}
          className="w-[210px] origin-top animate-tag-drop"
        >
          {/* String/rope */}
          <div className="mx-auto h-6 w-[3px] rounded-full bg-gradient-to-b from-[hsl(var(--forest))/40] to-[hsl(var(--forest))/10]" />

          {/* Tag card */}
          <div className="relative -mt-1 rounded-2xl border border-[hsl(var(--line))] bg-[hsl(var(--cream))] px-5 pb-5 pt-7 text-center shadow-lg animate-tag-sway">
            {/* Punched hole + peg */}
            <div className="absolute left-1/2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-[hsl(var(--forest))/50] bg-[hsl(var(--cream2))]" />

            <p className="text-[11px] font-extrabold tracking-wide text-[hsl(var(--forest))]">
              samadyafarm.id
            </p>
            <p className="mt-0.5 text-[9px] font-semibold tracking-[.15em] text-[hsl(var(--forest))/55]">
              SAPI PILIHAN
            </p>

            <div className="mt-3 rounded-lg bg-white px-3 py-2 shadow-inner">
              <p className="font-serif text-lg font-bold leading-tight text-[hsl(var(--forest))] break-all">
                {code}
              </p>
            </div>

            <p className="mt-3 text-sm font-bold uppercase tracking-wide text-[hsl(var(--forest))]">
              {breed}
            </p>

            <div className="mx-auto mt-3 w-fit rounded-lg bg-white p-2 shadow-inner">
              <QRCodeSVG value={url} size={110} level="H" includeMargin={false} />
            </div>

            <p className="mt-3 text-[9px] font-semibold tracking-[.1em] text-[hsl(var(--forest))/60]">
              SCAN UNTUK PROFIL
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes tag-drop {
            0% {
              transform: translateY(-140px) rotate(0deg);
              opacity: 0;
            }
            60% {
              transform: translateY(6px) rotate(3deg);
              opacity: 1;
            }
            80% {
              transform: translateY(-3px) rotate(-2deg);
            }
            100% {
              transform: translateY(0) rotate(0deg);
            }
          }
          .animate-tag-drop {
            animation: tag-drop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
          @keyframes tag-sway {
            0%,
            100% {
              transform: rotate(0deg);
            }
            50% {
              transform: rotate(1.5deg);
            }
          }
          .animate-tag-sway {
            animation: tag-sway 4.5s ease-in-out 0.9s infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-tag-drop,
            .animate-tag-sway {
              animation: none;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
