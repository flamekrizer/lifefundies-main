/**
 * CommunityService Facade
 * Forwards all community posts, comments, and reviews operations to the standardized CommunityRepository.
 */

export {
  createPost,
  getPosts,
  getUserPosts,
  upvotePost,
  deletePost,
  addComment,
  getComments,
  upvoteComment,
  deleteComment,
  addReviewAndUpvoteMentor as addReview,
  getMentorReviews,
  deleteReview
} from './communityRepository'
