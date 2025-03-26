// Collection of mock image URLs for the application

// Profile images
export const profileImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330", // Female profile 1
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", // Male profile 1
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80", // Female profile 2
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", // Male profile 2
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb", // Female profile 3
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"  // Male profile 3
];

// Post images
export const postImages = [
  "https://images.unsplash.com/photo-1543039625-14cbd3802e7d", // Beach photo
  "https://images.unsplash.com/photo-1516762689617-e1cffcef479d", // Sneakers
  "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454", // Coffee
  "https://images.unsplash.com/photo-1513104890138-7c749659a591", // Pizza
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836", // Food plate
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f", // Fashion
  "https://images.unsplash.com/photo-1516762689617-e1cffcef479d", // Sneakers 2
  "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454"  // Coffee 2
];

// Get a random profile image
export const getRandomProfileImage = (): string => {
  return profileImages[Math.floor(Math.random() * profileImages.length)];
};

// Get a random post image
export const getRandomPostImage = (): string => {
  return postImages[Math.floor(Math.random() * postImages.length)];
};
