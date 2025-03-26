import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  likes, type Like, type InsertLike,
  comments, type Comment, type InsertComment,
  follows, type Follow, type InsertFollow,
  type PostWithDetails, type UserWithStats
} from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersBySearch(query: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  getAllPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  getPostsByUser(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<boolean>;
  
  // Like operations
  likePost(like: InsertLike): Promise<Like>;
  unlikePost(userId: number, postId: number): Promise<boolean>;
  getLike(userId: number, postId: number): Promise<Like | undefined>;
  getLikesByPost(postId: number): Promise<Like[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;
  
  // Follow operations
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  getFollow(followerId: number, followingId: number): Promise<Follow | undefined>;
  getFollowersByUser(userId: number): Promise<Follow[]>;
  getFollowingByUser(userId: number): Promise<Follow[]>;
  
  // Complex operations
  getPostWithDetails(postId: number): Promise<PostWithDetails | undefined>;
  getFeedForUser(userId: number): Promise<PostWithDetails[]>;
  getUserWithStats(userId: number): Promise<UserWithStats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private likes: Map<number, Like>;
  private comments: Map<number, Comment>;
  private follows: Map<number, Follow>;
  
  private userIdCounter: number;
  private postIdCounter: number;
  private likeIdCounter: number;
  private commentIdCounter: number;
  private followIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.follows = new Map();
    
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.likeIdCounter = 1;
    this.commentIdCounter = 1;
    this.followIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize sample data for development
  private initializeSampleData() {
    const profileImages = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
    ];

    const postImages = [
      "https://images.unsplash.com/photo-1543039625-14cbd3802e7d",
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d",
      "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d",
      "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454"
    ];

    // Create users
    const sampleUsers: InsertUser[] = [
      { username: "jessica", password: "password123", fullName: "Jessica Parker", email: "jessica@example.com", profileImage: profileImages[0], bio: "Photographer & traveler ✈️ | Based in San Francisco" },
      { username: "mike87", password: "password123", fullName: "Mike Johnson", email: "mike@example.com", profileImage: profileImages[1], bio: "Music lover | Foodie | Adventurer" },
      { username: "sarah_p", password: "password123", fullName: "Sarah Peterson", email: "sarah@example.com", profileImage: profileImages[2], bio: "Coffee enthusiast ☕ | Los Angeles" },
      { username: "alex_t", password: "password123", fullName: "Alex Thompson", email: "alex@example.com", profileImage: profileImages[3], bio: "Sneakerhead 👟 | Fashion | NYC" },
      { username: "emma_j", password: "password123", fullName: "Emma Jones", email: "emma@example.com", profileImage: profileImages[4], bio: "Artist | Designer | Chicago" },
      { username: "david_k", password: "password123", fullName: "David Kim", email: "david@example.com", profileImage: profileImages[5], bio: "Tech & fitness | Seattle" }
    ];

    const userIds: number[] = [];
    sampleUsers.forEach(userData => {
      const user = this.createUser(userData);
      userIds.push(user.id);
    });

    // Create posts
    const locations = ["San Francisco, CA", "New York, NY", "Los Angeles, CA", "Chicago, IL", "Seattle, WA", "Boston, MA"];
    const captions = [
      "Beautiful day at the beach! 🌊 #summer #beach #vacation",
      "Just got these new shoes! What do you think? #fashion #sneakers",
      "Morning coffee is the best way to start the day ☕️ #coffee #morning",
      "Delicious dinner tonight! 🍽️ #foodie #dinner",
      "Exploring the city today 🏙️ #urban #adventure",
      "Nature walks are my therapy 🌳 #nature #hiking",
      "Weekend vibes 🎵 #weekend #music",
      "New haircut! What do you think? 💇 #newlook #selfie"
    ];

    for (let i = 0; i < 8; i++) {
      const userId = userIds[i % userIds.length];
      this.createPost({
        userId,
        imageUrl: postImages[i],
        caption: captions[i],
        location: locations[i % locations.length]
      });
    }

    // Create follows
    for (let i = 1; i <= userIds.length; i++) {
      for (let j = 1; j <= userIds.length; j++) {
        if (i !== j && Math.random() > 0.3) {
          this.followUser({
            followerId: i,
            followingId: j
          });
        }
      }
    }

    // Create likes and comments
    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= userIds.length; j++) {
        if (Math.random() > 0.4) {
          this.likePost({
            userId: j,
            postId: i
          });
        }
        
        if (Math.random() > 0.6) {
          const comments = [
            "This looks amazing! 😍",
            "Love it! 👏",
            "Great shot! 📸",
            "Wow, incredible! ✨",
            "So cool! 🙌",
            "Beautiful! ❤️"
          ];
          
          this.createComment({
            userId: j,
            postId: i,
            content: comments[Math.floor(Math.random() * comments.length)]
          });
        }
      }
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUsersBySearch(query: string): Promise<User[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.users.values()).filter(
      (user) => 
        user.username.toLowerCase().includes(lowercaseQuery) || 
        user.fullName.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  // Post operations
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const now = new Date();
    const post: Post = { 
      ...postData, 
      id, 
      createdAt: now 
    };
    this.posts.set(id, post);
    return post;
  }

  async deletePost(id: number): Promise<boolean> {
    const deleted = this.posts.delete(id);
    // Also delete related likes and comments
    Array.from(this.likes.values())
      .filter(like => like.postId === id)
      .forEach(like => this.likes.delete(like.id));
    Array.from(this.comments.values())
      .filter(comment => comment.postId === id)
      .forEach(comment => this.comments.delete(comment.id));
    return deleted;
  }

  // Like operations
  async likePost(likeData: InsertLike): Promise<Like> {
    // Check if already liked
    const existingLike = await this.getLike(likeData.userId, likeData.postId);
    if (existingLike) return existingLike;
    
    const id = this.likeIdCounter++;
    const like: Like = { ...likeData, id };
    this.likes.set(id, like);
    return like;
  }

  async unlikePost(userId: number, postId: number): Promise<boolean> {
    const like = await this.getLike(userId, postId);
    if (!like) return false;
    return this.likes.delete(like.id);
  }

  async getLike(userId: number, postId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      like => like.userId === userId && like.postId === postId
    );
  }

  async getLikesByPost(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.postId === postId);
  }

  // Comment operations
  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const comment: Comment = { 
      ...commentData, 
      id, 
      createdAt: now 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Follow operations
  async followUser(followData: InsertFollow): Promise<Follow> {
    // Check if already following
    const existingFollow = await this.getFollow(followData.followerId, followData.followingId);
    if (existingFollow) return existingFollow;
    
    const id = this.followIdCounter++;
    const follow: Follow = { ...followData, id };
    this.follows.set(id, follow);
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.getFollow(followerId, followingId);
    if (!follow) return false;
    return this.follows.delete(follow.id);
  }

  async getFollow(followerId: number, followingId: number): Promise<Follow | undefined> {
    return Array.from(this.follows.values()).find(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
  }

  async getFollowersByUser(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(follow => follow.followingId === userId);
  }

  async getFollowingByUser(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(follow => follow.followerId === userId);
  }

  // Complex operations
  async getPostWithDetails(postId: number): Promise<PostWithDetails | undefined> {
    const post = await this.getPost(postId);
    if (!post) return undefined;

    const user = await this.getUser(post.userId);
    if (!user) return undefined;

    const likes = await this.getLikesByPost(postId);
    const commentsData = await this.getCommentsByPost(postId);
    
    const comments = await Promise.all(commentsData.map(async (comment) => {
      const commentUser = await this.getUser(comment.userId);
      return {
        ...comment,
        user: commentUser!
      };
    }));

    return {
      ...post,
      user,
      likes: likes.length,
      comments
    };
  }

  async getFeedForUser(userId: number): Promise<PostWithDetails[]> {
    // Get all users the current user is following
    const following = await this.getFollowingByUser(userId);
    const followingIds = following.map(follow => follow.followingId);
    
    // Add the user's own posts
    followingIds.push(userId);
    
    // Get all posts from those users
    let allPosts: Post[] = [];
    for (const id of followingIds) {
      const userPosts = await this.getPostsByUser(id);
      allPosts = [...allPosts, ...userPosts];
    }
    
    // Sort posts by created date (most recent first)
    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Get full details for each post
    const postsWithDetails = await Promise.all(
      allPosts.map(async (post) => {
        const details = await this.getPostWithDetails(post.id);
        const isLiked = !!(await this.getLike(userId, post.id));
        return { ...details!, isLiked };
      })
    );
    
    return postsWithDetails;
  }

  async getUserWithStats(userId: number): Promise<UserWithStats | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const posts = await this.getPostsByUser(userId);
    const followers = await this.getFollowersByUser(userId);
    const following = await this.getFollowingByUser(userId);
    
    return {
      ...user,
      postCount: posts.length,
      followerCount: followers.length,
      followingCount: following.length,
      posts
    };
  }
}

export const storage = new MemStorage();
