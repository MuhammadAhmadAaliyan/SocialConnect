import React, { createContext, useState, useContext } from "react";
import Socket from "../Socket";

// Types
type CommentType = {
  id: string;
  text: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
};

type PostType = {
  id: string;
  userId: string;
  text: string;
  image?: string;
  likedBy: string[];
  unlikedBy: string[];
  comments: CommentType[];
  timestamp: string;
};

type message = {
  id: string;
  text: string;
  sender: string;
  receiver: string;
  timestamp: string;
};

type PostContextType = {
  posts: PostType[];
  setPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
  likePost: (postId: string, userId: any) => void;
  unlikePost: (postId: string, userId: any) => void;
  addComment: (postId: string, comment: CommentType) => void;
};

const PostContext = createContext<PostContextType>({
  posts: [],
  setPosts: () => {},
  likePost: () => {},
  unlikePost: () => {},
  addComment: () => {},
});

//MOCK_API_POST_URL
const MOCK_API_POST_URL =
  "https://socialconnect-backend-production.up.railway.app/post-reaction";

export const PostProvider = ({ children }: any) => {
  const [posts, setPosts] = useState<PostType[]>([]);

  React.useEffect(() => {
    Socket.connect();
    Socket.on("connect", () => {
      console.log("Socket connected:", Socket.id);
    });

    Socket.on("likeUpdate", ({ postId, likedBy, unlikedBy }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likedBy, unlikedBy } : post,
        ),
      );
    });

    Socket.on("commentUpdate", ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, comment] }
            : post,
        ),
      );
    });

    return () => {
      Socket.off("likeUpdate");
      Socket.off("commentUpdate");
      Socket.disconnect();
    };
  }, []);

  const likePost = async (postId: string, userId: string) => {
    const isLiked = posts
      .find((p) => p.id === postId)
      ?.likedBy.includes(userId);

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? isLiked
            ? { ...post, likedBy: post.likedBy.filter((id) => id !== userId) }
            : {
                ...post,
                likedBy: [...post.likedBy, userId],
                unlikedBy: post.unlikedBy.filter((id) => id !== userId),
              }
          : post,
      ),
    );

    const action = isLiked ? "like_remove" : "like_add";

    try {
      const response = await fetch(`${MOCK_API_POST_URL}/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (!response.ok) console.log("Failed to update like:", response.status);
    } catch (e) {
      console.log(e);
    }
  };

  const unlikePost = async (postId: string, userId: string) => {
    const isUnliked = posts
      .find((p) => p.id === postId)
      ?.unlikedBy.includes(userId);

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? isUnliked
            ? {
                ...post,
                unlikedBy: post.unlikedBy.filter((id) => id !== userId),
              }
            : {
                ...post,
                unlikedBy: [...post.unlikedBy, userId],
                likedBy: post.likedBy.filter((id) => id !== userId),
              }
          : post,
      ),
    );

    const action = isUnliked ? "unlike_remove" : "unlike_add";

    try {
      const response = await fetch(`${MOCK_API_POST_URL}/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (!response.ok)
        console.log("Failed to update unlike:", response.status);
    } catch (e) {
      console.log(e);
    }
  };

  const addComment = (postId: string, comment: CommentType) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post,
      ),
    );
  };

  return (
    <PostContext.Provider
      value={{ posts, setPosts, likePost, unlikePost, addComment }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);
