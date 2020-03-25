import gql from 'graphql-tag';

export const POSTS_QUERY = gql`
  query allPosts {
    posts @rest(type: "Post", path: "/posts.json") {
      id
      title
      description
      time_start
      time_end
      url
    }
  }
`;

export const CREATE_POST = gql`
  mutation createPost($data: PostInput!) {
    publishedPost: publish(input: "Post", body: $data)
      @rest(type: "Post", path: "/posts.json", method: "POST", bodyKey: "body") {
      id
      title
    }
  }
`;
