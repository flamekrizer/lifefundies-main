# Firebase Integration Guide

This project integrates Firebase for authentication, community posts, comments, and reviews.

## Services Created

### 1. **authService.ts** - Authentication
- `signUpWithEmail()` - Register with email/password
- `signInWithEmail()` - Login with email/password  
- `signInWithGoogle()` - Google OAuth authentication
- `logout()` - Sign out
- `resetPassword()` - Password reset
- `onAuthStateChange()` - Listen for auth state changes

### 2. **communityService.ts** - Community & Reviews
- **Posts**: `createPost()`, `getPosts()`, `getUserPosts()`, `upvotePost()`, `deletePost()`
- **Comments**: `addComment()`, `getComments()`, `upvoteComment()`, `deleteComment()`
- **Reviews**: `addReview()`, `getMentorReviews()`, `deleteReview()`

## Firebase Collections

```
users/
  {uid}
    - uid, displayName, email, phone, role, domains, onboardingComplete, createdAt

community_posts/
  {postId}
    - authorId, authorName, isAnonymous, domain, title, content
    - upvotes, upvoters[], commentCount, tags, createdAt

community_comments/
  {commentId}
    - postId, authorId, authorName, isAnonymous, content
    - upvotes, upvoters[], createdAt

mentor_reviews/
  {reviewId}
    - mentorId, userId, rating, text, sessionId, createdAt
```

## Components Updated

- **App.tsx** - Auth state listener, protected routes
- **AuthModal.tsx** - Email/password & Google sign-in
- **Navbar.tsx** - Firebase logout
- **Community.tsx** - Posts with Firebase persistence

## Features

✅ Email/Password Authentication  
✅ Google Sign-In  
✅ Community Posts (Create, Read, Upvote, Filter)  
✅ Comments System (Create, Upvote)  
✅ Mentor Reviews with Rating System  
✅ Anonymous Post Support  
✅ Domain-based Filtering  
✅ Trending & Recent Sorting  

## Next Steps

1. Add comments UI component
2. Add review submission on sessions
3. Implement mentor profile reviews display
4. Add notification system for interactions
