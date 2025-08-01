import Image from 'next/image'

export default function AAALogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <Image
        src="/logos/AAA-Logo.png"
        alt="American Accreditation Association"
        width={64}
        height={64}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  )
}