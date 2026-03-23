import { Location } from './types/types';

export const isUserNear = (location1: Location | null, location2: Location | null): boolean => {
  if (
    (location1 === null || location1 === undefined) ||
    (location2 === null || location2 === undefined)
  ) {
    return false;
  }

  const distanceThreshold = 10;
  const distance = Math.sqrt(
    Math.pow(location1.latitude - location2.latitude, 2) +
    Math.pow(location1.longitude - location2.longitude, 2)
  );

  return distance < distanceThreshold;
};
