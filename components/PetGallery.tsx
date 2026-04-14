interface PetImage {
  src: string;
  alt: string;
}

const defaultImages: PetImage[] = [
  { src: '/pet-1.jpg', alt: '행복한 강아지' },
  { src: '/pet-2.jpg', alt: '졸고 있는 고양이' },
  { src: '/pet-3.jpg', alt: '산책하는 강아지' },
  { src: '/pet-4.jpg', alt: '놀고 있는 고양이' },
  { src: '/pet-5.jpg', alt: '수의사와 찍은 사진' },
  { src: '/pet-6.jpg', alt: '행복한 반려동물 가족' },
];

interface PetGalleryProps {
  images?: PetImage[];
  title?: string;
  subtitle?: string;
}

export function PetGallery({
  images = defaultImages,
  title = '행복한 반려동물들',
  subtitle = '함께 행복한 시간을 보내고 있는 소중한 친구들'
}: PetGalleryProps) {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="section-badge mb-4">갤러리</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl aspect-square"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl opacity-50">
                  {image.alt.includes('강아지') ? '🐕' : image.alt.includes('고양이') ? '🐈' : '🐾'}
                </span>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 p-3"
                style={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                }}
              >
                <p className="text-sm text-white font-medium">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
