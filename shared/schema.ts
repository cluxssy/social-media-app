import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  email: text("email").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  bio: true,
  profileImage: true,
  email: true,
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  imageUrl: true,
  caption: true,
  location: true,
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  userId: true,
  postId: true,
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  postId: true,
  content: true,
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

// Extended types for frontend
export type PostWithDetails = Post & {
  user: User;
  likes: number;
  comments: (Comment & { user: User })[];
  isLiked?: boolean;
};

export type UserWithStats = User & {
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  posts?: Post[];
};
