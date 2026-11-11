import type { SyntheticEvent } from 'react';
import heroSneakersImage from '../assets/images/sneakers.png';

export { heroSneakersImage };

export function handleImageError(
  event: SyntheticEvent<HTMLImageElement>
): void {
  event.currentTarget.hidden = true;
}
