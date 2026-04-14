import Image from 'next/image';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating?: number;
  image?: string;
}

export function TestimonialCard({
  name,
  role,
  content,
  rating = 5,
  image
}: TestimonialCardProps) {
  return (
    <div
      className="card p-6"
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
          style={{
            background: 'var(--color-primary-100)',
            color: 'var(--color-primary-600)',
          }}
        >
          {image ? (
            <Image src={image} alt={name} width={48} height={48} className="rounded-full object-cover" />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {name}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {role}
          </p>
        </div>
      </div>
      
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="text-sm"
            style={{ color: i < rating ? 'var(--color-golden)' : 'var(--color-border)' }}
          >
            ★
          </span>
        ))}
      </div>
      
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {content}
      </p>
    </div>
  );
}
