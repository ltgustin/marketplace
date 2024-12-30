import { urlFor } from '../lib/sanity'

function SanityImage({ image, alt, className }) {
  if (!image?.asset) {
    return null
  }

  return (
    <img
      src={urlFor(image)
        .auto('format')
        .width(800)
        .quality(80)
        .url()}
      alt={alt || ''}
      className={className}
      loading="lazy"
    />
  )
}

export default SanityImage 