import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertPostSchema,
  insertLikeSchema,
  insertCommentSchema,
  insertFollowSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Create mock session middleware for authentication
  const mockSession = (req: Request, res: Response, next: Function) => {
    const userId = req.headers["user-id"];
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Attach user ID to request for use in route handlers
    (req as any).userId = Number(userId);
    next();
  };

  // Authentication routes
  router.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Don't return password in the response
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  router.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Don't return password in the response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  router.get("/users/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 1) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const users = await storage.getUsersBySearch(query);
      
      // Remove passwords from the results
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  router.get("/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user stats (posts, followers, following)
      const userWithStats = await storage.getUserWithStats(user.id);
      
      if (!userWithStats) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If the request has a user ID (user is logged in), check if they're following this user
      if ((req as any).userId) {
        const currentUserId = (req as any).userId;
        const isFollowing = await storage.getFollow(currentUserId, user.id);
        userWithStats.isFollowing = !!isFollowing;
      }
      
      // Don't return password in the response
      const { password, ...result } = userWithStats;
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Post routes
  router.get("/posts", async (_req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const postsWithDetails = await Promise.all(
        posts.map(post => storage.getPostWithDetails(post.id))
      );
      res.json(postsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  router.get("/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostWithDetails(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // If the request has a user ID (user is logged in), check if they've liked this post
      if ((req as any).userId) {
        const currentUserId = (req as any).userId;
        const isLiked = await storage.getLike(currentUserId, postId);
        post.isLiked = !!isLiked;
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  router.post("/posts", mockSession, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const postData = insertPostSchema.parse({
        ...req.body,
        userId
      });
      
      const newPost = await storage.createPost(postData);
      const postWithDetails = await storage.getPostWithDetails(newPost.id);
      
      res.status(201).json(postWithDetails);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  router.delete("/posts/:id", mockSession, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Check if post exists
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post
      if (post.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deletePost(postId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Like routes
  router.post("/posts/:id/like", mockSession, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Check if post exists
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const likeData = insertLikeSchema.parse({
        userId,
        postId
      });
      
      await storage.likePost(likeData);
      
      // Get updated post details
      const updatedPost = await storage.getPostWithDetails(postId);
      if (updatedPost) {
        updatedPost.isLiked = true;
      }
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  router.delete("/posts/:id/like", mockSession, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Check if post exists
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      await storage.unlikePost(userId, postId);
      
      // Get updated post details
      const updatedPost = await storage.getPostWithDetails(postId);
      if (updatedPost) {
        updatedPost.isLiked = false;
      }
      
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Comment routes
  router.post("/posts/:id/comments", mockSession, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Check if post exists
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        userId,
        postId,
        content: req.body.content
      });
      
      const newComment = await storage.createComment(commentData);
      
      // Get user info for the comment
      const user = await storage.getUser(userId);
      
      res.status(201).json({
        ...newComment,
        user
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Follow routes
  router.post("/users/:username/follow", mockSession, async (req, res) => {
    try {
      const { username } = req.params;
      const followerId = (req as any).userId;
      
      // Get the user to follow
      const userToFollow = await storage.getUserByUsername(username);
      if (!userToFollow) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is trying to follow themselves
      if (userToFollow.id === followerId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const followData = insertFollowSchema.parse({
        followerId,
        followingId: userToFollow.id
      });
      
      await storage.followUser(followData);
      
      // Get updated user stats
      const updatedUser = await storage.getUserWithStats(userToFollow.id);
      if (updatedUser) {
        updatedUser.isFollowing = true;
        const { password, ...result } = updatedUser;
        res.json(result);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  router.delete("/users/:username/follow", mockSession, async (req, res) => {
    try {
      const { username } = req.params;
      const followerId = (req as any).userId;
      
      // Get the user to unfollow
      const userToUnfollow = await storage.getUserByUsername(username);
      if (!userToUnfollow) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.unfollowUser(followerId, userToUnfollow.id);
      
      // Get updated user stats
      const updatedUser = await storage.getUserWithStats(userToUnfollow.id);
      if (updatedUser) {
        updatedUser.isFollowing = false;
        const { password, ...result } = updatedUser;
        res.json(result);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Feed route
  router.get("/feed", mockSession, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const feed = await storage.getFeedForUser(userId);
      res.json(feed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  // Prefix all routes with /api
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
